// Connections to this user's private GitHub request owner endpoint: whether
// its socket answers, whether its owner admits this caller, and the host/login
// scope its directory names. Wire encoding owns what is said over the socket.
import { lstatSync } from "node:fs";
import { connect } from "node:net";
import { basename } from "node:path";
import { OwnerUnavailable } from "./github-request-owner-failure.mjs";
import { protocol, receive, send } from "./github-request-owner-wire.mjs";

// How long a greeting may take, for the owner awaiting it and for the
// consumer awaiting its welcome, before either ends the connection.
export const greetingLimitMs = 5_000;

// How a read names the API host and login whose endpoint `directory` is.
/** @param {string} directory */
export const scopeOf = (directory) => basename(directory);

// Whether anything accepts a connection at `path`.
/** @param {string} path */
export const reachable = (path) =>
  new Promise((resolve) => {
    const socket = connect(path);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });

// The owner `record` names, greeted: its connection, or undefined when
// nothing answers there. Throws when it is another user's or refuses this
// caller. `onMessage` hears what it says after its welcome.
export function greeted(
  { socket: path, token },
  onMessage,
  inspect = lstatSync,
) {
  return new Promise((resolve, reject) => {
    try {
      if (inspect(path).uid !== process.getuid?.())
        throw new OwnerUnavailable("another-user");
    } catch (error) {
      if (error.code === "ENOENT") resolve(undefined);
      else reject(error);
      return;
    }
    const socket = connect(path);
    const gone = () => {
      clearTimeout(limit);
      reject(new OwnerUnavailable("connection-failed"));
    };
    const limit = setTimeout(() => {
      socket.off("close", gone);
      socket.destroy();
      reject(new OwnerUnavailable("unknown"));
    }, greetingLimitMs);
    let welcomed = false;
    socket.on("error", (error) => {
      socket.off("close", gone);
      clearTimeout(limit);
      if (error.code === "ENOENT" || error.code === "ECONNREFUSED")
        resolve(undefined);
      else reject(new OwnerUnavailable("connection-failed"));
    });
    socket.once("close", gone);
    socket.once("connect", () => send(socket, { hello: protocol, token }));
    receive(socket, (message) => {
      if (welcomed) {
        onMessage(message);
        return;
      }
      clearTimeout(limit);
      socket.off("close", gone);
      if (message?.welcome === protocol) {
        welcomed = true;
        resolve(socket);
        return;
      }
      socket.destroy();
      const cause = message?.refused;
      reject(
        new OwnerUnavailable(
          cause === "incompatible" || cause === "unauthenticated"
            ? cause
            : "unknown",
        ),
      );
    });
  });
}
