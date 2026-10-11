import { rmSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import {
  claimedRecord,
  EndpointBinding,
  newSocketName,
} from "./github-request-owner-endpoint.mjs";
import { protocol } from "./github-request-owner-wire.mjs";

// An actual private endpoint that refuses a greeting, closes it, or says
// nothing. Only that starting condition is supplied; readers must classify
// it themselves. Its token is a disclosure sentinel, never an API login.
export const ownerSecret = "owner-secret-must-stay-local";

export async function refusingOwner(github, greeting) {
  const directory = await new EndpointBinding(github.env).directory();
  const socketName = newSocketName();
  const sockets = new Set();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("error", () => undefined);
    socket.on("close", () => sockets.delete(socket));
    socket.on("data", (chunk) => {
      if (greeting === "close") socket.end();
      else if (greeting === "unanswered") {
        const message = JSON.parse(chunk.toString("utf8"));
        socket.write(
          `${JSON.stringify(
            message.hello ? { welcome: protocol } : { id: message.id },
          )}\n`,
        );
      } else if (greeting !== "silent")
        socket.end(`${JSON.stringify(greeting)}\n`);
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(join(directory, socketName), resolve);
  });
  claimedRecord(directory, 1, {
    pid: process.pid,
    protocol,
    token: ownerSecret,
    socket: socketName,
  });
  github.teardown.defer(async () => {
    rmSync(join(directory, "owner.1.json"), { force: true });
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  });
  return { directory, socket: join(directory, socketName) };
}
