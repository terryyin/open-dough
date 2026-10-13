import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { createServer } from "node:net";
import { basename, join } from "node:path";
import { test } from "node:test";
import {
  instrumentedGithubFixture,
  startInstalledScript,
} from "./ci-github-test-fixtures.mjs";
import { endpointOf } from "./github-request-login-test-fixtures.mjs";
import {
  claimedRecord,
  newSocketName,
} from "./github-request-owner-endpoint.mjs";
import { ownerRecords } from "./github-request-owner-test-fixtures.mjs";
import { protocol, receive, send } from "./github-request-owner-wire.mjs";

function consumer(t) {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
  });
  github.enter();
  return { github, root: github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT };
}

test("startup refuses a responsive incompatible owner without claiming a replacement or asking gh", async (t) => {
  const { github, root } = consumer(t);
  const directory = await endpointOf(github.env);
  const socket = newSocketName();
  const token = "f".repeat(64);
  const greetings = [];
  const connections = new Set();
  const server = createServer((connection) => {
    connections.add(connection);
    connection.once("close", () => connections.delete(connection));
    receive(connection, (message) => {
      greetings.push(message);
      send(connection, { refused: "incompatible" });
      connection.end();
    });
  });
  await new Promise((resolve) =>
    server.listen(join(directory, socket), resolve),
  );
  github.teardown.defer(async () => {
    for (const connection of connections) connection.destroy();
    await new Promise((resolve) => server.close(resolve));
  });
  assert.ok(
    claimedRecord(directory, 1, {
      pid: process.pid,
      protocol: protocol + 1,
      token,
      socket,
    }),
  );
  // This fixture's server is in the test process; remove its record before
  // ordinary request-owner teardown, which waits for recorded processes to end.
  github.teardown.defer(() =>
    rmSync(join(directory, "owner.1.json"), { force: true }),
  );

  const starting = startInstalledScript(github, "github-request-owner.mjs", [
    directory,
    "60000",
  ]);
  assert.equal(await starting.exited, 1);
  assert.match(starting.stderr(), /explicitly refused the protocol/);
  assert.deepEqual(greetings, [{ hello: protocol, token }]);
  assert.deepEqual(
    ownerRecords(root).map(({ file }) => basename(file)),
    ["owner.1.json"],
  );
  assert.deepEqual(github.asked(), []);
});
