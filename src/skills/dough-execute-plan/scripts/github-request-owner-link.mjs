// One process's connection to this machine's GitHub request owner
// (`./github-request-owner.mjs`) over its private endpoint
// (`./github-request-owner-endpoint.mjs`): found by its standing record,
// started when none answers, greeted with its caller token, and kept for
// every request this process asks. An owner that cannot be reached or
// started, speaks another protocol or refuses the greeting leaves each
// request unanswered -- never asked of GitHub by this process itself, so no
// second owner of the allowance appears.
import { spawn } from "node:child_process";
import { lstatSync } from "node:fs";
import { connect } from "node:net";
import { fileURLToPath } from "node:url";
import {
  endpointDirectory,
  standingRecord,
} from "./github-request-owner-endpoint.mjs";
import {
  greetingLimitMs,
  protocol,
  receive,
  send,
} from "./github-request-owner-wire.mjs";

/** @import { Socket } from "node:net" */

const ownerEntry = fileURLToPath(
  new URL("./github-request-owner.mjs", import.meta.url),
);

// How long finding or starting the owner may take before the requests
// still waiting for it go unanswered -- each gives up at its own bound
// before that.
const startLimitMs = 30_000;

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// What `read` reads, or undefined while it cannot be read: asked again.
function readable(read) {
  try {
    return read();
  } catch {
    return undefined;
  }
}

// The owner `record` names, greeted: its connection, or undefined when
// nothing answers there. Throws when it refuses this caller.
function greeted({ socket: path, token }, onMessage) {
  return new Promise((resolve, reject) => {
    try {
      if (lstatSync(path).uid !== process.getuid?.())
        throw new Error("The GitHub request owner is another user's.");
    } catch (error) {
      if (error.code === "ENOENT") resolve(undefined);
      else reject(error);
      return;
    }
    const socket = connect(path);
    const gone = () => {
      clearTimeout(limit);
      resolve(undefined);
    };
    const limit = setTimeout(() => socket.destroy(), greetingLimitMs);
    let welcomed = false;
    socket.on("error", () => undefined);
    socket.once("close", gone);
    socket.once("connect", () => send(socket, { hello: protocol, token }));
    receive(socket, (message) => {
      if (welcomed) {
        onMessage(message);
        return;
      }
      clearTimeout(limit);
      socket.off("close", gone);
      if (message.welcome === protocol) {
        welcomed = true;
        resolve(socket);
        return;
      }
      socket.destroy();
      reject(new Error("The GitHub request owner refused this caller."));
    });
  });
}

/**
 * @typedef {{
 *   readonly left?: true;
 *   readonly timedOut?: true;
 *   readonly answer?: any;
 *   readonly told?: boolean;
 * }} OwnerReply
 */

export class OwnerLink {
  #backoffBaseMs;

  /** @type {Promise<Socket> | undefined} */
  #connecting;

  // Each request still waiting for the owner's reply, by its number on this
  // connection.
  /** @type {Map<number, (reply: OwnerReply) => void>} */
  #waiting = new Map();

  #asked = 0;

  // `backoffBaseMs` is given to an owner this process starts: its first
  // wait after a rate limit that directs none.
  /** @param {{ readonly backoffBaseMs: number }} options */
  constructor({ backoffBaseMs }) {
    this.#backoffBaseMs = backoffBaseMs;
  }

  // The owner's reply to one request: its `answer`, and whether the call
  // failed (`told`); `timedOut` when the call reached its own bound; `left`
  // once `signal` ended this wait, which tells the owner so, at this
  // requester's own bound when `leavingAtBound` says so; and nothing when
  // the owner refused the request or cannot be asked.
  /**
   * @param {{ readonly args: readonly string[]; readonly boundMs: number; readonly maxBufferBytes: number }} request
   * @param {AbortSignal} signal
   * @param {() => boolean} leavingAtBound
   * @returns {Promise<OwnerReply>}
   */
  ask(request, signal, leavingAtBound) {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve({ left: true });
        return;
      }
      let sent;
      const settle = (reply) => {
        signal.removeEventListener("abort", leave);
        if (sent !== undefined) {
          this.#waiting.delete(sent.id);
          if (this.#waiting.size === 0) sent.socket.unref();
        }
        resolve(reply);
      };
      const leave = () => {
        if (sent !== undefined)
          send(sent.socket, {
            id: sent.id,
            cancel: leavingAtBound() ? "bound" : "left",
          });
        settle({ left: true });
      };
      signal.addEventListener("abort", leave, { once: true });
      this.#connected().then(
        (socket) => {
          if (signal.aborted) return;
          this.#asked += 1;
          sent = { id: this.#asked, socket };
          this.#waiting.set(sent.id, settle);
          socket.ref();
          send(socket, { id: sent.id, request });
        },
        () => settle({}),
      );
    });
  }

  #connected() {
    this.#connecting ??= this.#connect().then(
      (socket) => {
        socket.unref();
        socket.once("close", () => {
          this.#connecting = undefined;
          for (const settle of [...this.#waiting.values()]) settle({});
        });
        return socket;
      },
      (error) => {
        this.#connecting = undefined;
        throw error;
      },
    );
    return this.#connecting;
  }

  async #connect() {
    const directory = endpointDirectory();
    const deadline = Date.now() + startLimitMs;
    let starting;
    for (;;) {
      const record = readable(() => standingRecord(directory));
      const socket =
        record?.socket === undefined
          ? undefined
          : await greeted(record, ({ id, ...reply }) =>
              this.#waiting.get(id)?.(reply),
            );
      if (socket !== undefined) return socket;
      if (Date.now() > deadline)
        throw new Error("The GitHub request owner did not start.");
      if (starting === undefined || starting.exitCode !== null)
        starting = this.#started(directory);
      await pause(20);
    }
  }

  // An owner of its own process group, outliving this process, with no
  // output and nothing of this process's Node options: it runs only what is
  // installed beside this file.
  #started(directory) {
    const env = { ...process.env };
    delete env.NODE_OPTIONS;
    const owner = spawn(
      process.execPath,
      [ownerEntry, directory, String(this.#backoffBaseMs)],
      { cwd: directory, env, detached: true, stdio: "ignore" },
    );
    owner.on("error", () => undefined);
    owner.unref();
    return owner;
  }
}
