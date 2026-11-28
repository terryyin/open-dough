// The local owner's authenticated consumers and their pending operations.
// Disconnecting ends only this consumer's waits. Closing the owner stops
// admitting greetings and ends every wait.
import { timingSafeEqual } from "node:crypto";
import { GhFailure } from "./github-request-answer.mjs";
import { greetingLimitMs } from "./github-request-owner-endpoint-connection.mjs";
import {
  coreCooldownOperation,
  fixedOperation,
  protocol,
  receive,
  send,
  unknownOperationRefusal,
  wireAnswer,
  workflowRerunOperation,
} from "./github-request-owner-wire.mjs";

const messageBytesLimit = 256 * 1024;
const left = new Error("The requester left.");

export function ownerConnections({
  token,
  scope,
  departed,
  read,
  failed,
  coreCooldown,
}) {
  const consumers = new Set();
  const requesters = new Set();
  let closed = false;

  const admitted = (offered) =>
    typeof offered === "string" &&
    offered.length === token.length &&
    timingSafeEqual(Buffer.from(offered), Buffer.from(token));

  async function answer(fixed, signal) {
    if (fixed.operation === coreCooldownOperation) {
      return { cooldown: await coreCooldown(signal) };
    }
    const result = await read(fixed, signal);
    return { answer: wireAnswer(result), told: failed(result) };
  }

  function ask(socket, waits, id, fixed) {
    if (fixed === undefined || fixed.scope !== scope) {
      const refused =
        fixed === undefined ? unknownOperationRefusal : "another login";
      send(socket, { id, refused });
      return;
    }
    const wait = new AbortController();
    waits.set(id, wait);
    requesters.add(wait);
    answer(fixed, wait.signal)
      .then(
        (reply) => send(socket, { id, ...reply }),
        (error) => {
          if (wait.signal.aborted) return;
          const timedOut =
            error instanceof GhFailure && error.reason.kind === "timed-out";
          send(socket, timedOut ? { id, timedOut } : { id });
        },
      )
      .finally(() => {
        waits.delete(id);
        requesters.delete(wait);
      });
  }

  function serve(socket) {
    if (closed) {
      socket.destroy();
      return;
    }
    const waits = new Map();
    let welcomed = false;
    consumers.add(socket);
    const greeting = setTimeout(() => socket.destroy(), greetingLimitMs);
    const refuse = (refused) => {
      send(socket, { refused });
      socket.end();
    };
    socket.on("error", () => undefined);
    socket.on("close", () => {
      clearTimeout(greeting);
      consumers.delete(socket);
      if (welcomed) departed();
      for (const wait of waits.values()) wait.abort(left);
    });
    receive(
      socket,
      (message) => {
        if (!welcomed) {
          if (!admitted(message?.token)) refuse("unauthenticated");
          else if (message.hello !== protocol) refuse("incompatible");
          else {
            welcomed = true;
            clearTimeout(greeting);
            send(socket, {
              welcome: protocol,
              operations: [workflowRerunOperation, coreCooldownOperation],
            });
          }
          return;
        }
        const { id, cancel, request } = message ?? {};
        if (!Number.isSafeInteger(id)) refuse("unknown operation");
        else if (cancel === "left" || cancel === "bound")
          waits
            .get(id)
            ?.abort(
              cancel === "left" ? left : new GhFailure({ kind: "timed-out" }),
            );
        else if (request === undefined || waits.has(id))
          refuse("unknown operation");
        else ask(socket, waits, id, fixedOperation(request));
      },
      messageBytesLimit,
    );
  }

  return {
    serve,
    hasConsumers: () => consumers.size > 0,
    close() {
      closed = true;
      for (const wait of requesters) wait.abort(left);
      for (const consumer of consumers) consumer.destroy();
    },
  };
}
