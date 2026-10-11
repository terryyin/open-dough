// What a login's token reaches: `gh` alone. Nothing written under the
// endpoint root, said either way over an owner's socket, or printed by a
// consumer or the installed diagnostic entry carries a fixture token, and
// each request names its login only as its endpoint directory is named.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { basename, join } from "node:path";
import { test } from "node:test";
import { startInstalledScript } from "./ci-github-test-fixtures.mjs";
import {
  endpointOf,
  fixtureToken,
  log,
  loginMachine,
} from "./github-request-login-test-fixtures.mjs";
import { claimedRecord } from "./github-request-owner-endpoint.mjs";
import { saidToOwner } from "./github-request-owner-test-fixtures.mjs";
import { protocol } from "./github-request-owner-wire.mjs";

// Stands in `directory` as its owner for one consumer: answers what that
// consumer said, line by line, once its one read is answered.
function standIn(directory) {
  const socket = "0000000a.s";
  const record = { pid: process.pid, protocol, token: "caller", socket };
  return new Promise((resolve) => {
    const server = createServer((consumer) => {
      let heard = "";
      consumer.on("data", (chunk) => {
        heard += chunk;
        const lines = heard.split("\n").filter(Boolean);
        if (!heard.endsWith("\n")) return;
        if (lines.length === 1)
          consumer.write(`${JSON.stringify({ welcome: protocol })}\n`);
        if (lines.length < 2) return;
        const answer = { status: 200, headers: [], body: "stood in" };
        const { id } = JSON.parse(lines[1]);
        consumer.end(`${JSON.stringify({ id, answer })}\n`);
        server.close();
        rmSync(join(directory, "owner.1.json"));
        resolve(lines.map((line) => JSON.parse(line)));
      });
    });
    server.listen(join(directory, socket), () =>
      assert.ok(claimedRecord(directory, 1, record)),
    );
  });
}

// Everything the owner standing in `directory` says to a caller asking
// `args`, until it answered.
async function ownerSaid({ directory, socket, token }, args) {
  const request = {
    args,
    boundMs: 5_000,
    maxBufferBytes: 1_000_000,
    scope: basename(directory),
  };
  const { lines } = await saidToOwner(
    join(directory, socket),
    [
      { hello: protocol, token },
      { id: 1, request },
    ],
    2,
  );
  return JSON.stringify(lines);
}

// Every path under `root` and what each file there holds.
function kept(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true }).map(
    (entry) => {
      const path = join(entry.parentPath, entry.name);
      return entry.isFile() ? `${path}\n${readFileSync(path, "utf8")}` : path;
    },
  );
}

test("no token is written under the endpoint root, said over an owner's socket, or printed by a consumer", async (t) => {
  const machine = loginMachine(t);
  const alice = machine.withToken("alice");
  const stored = machine.stored("bob");
  const root = machine.github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT;

  const directory = await endpointOf(alice.env);
  const heardStandingIn = standIn(directory);
  const byToken = alice.consumer();
  const stoodIn = await byToken.ask(log(1)).settled;
  assert.equal(stoodIn.body, "stood in");
  const [greeting, { request }] = await heardStandingIn;
  assert.deepEqual(Object.keys(greeting).toSorted(), ["hello", "token"]);
  assert.deepEqual(request, {
    args: log(1),
    boundMs: 60_000,
    maxBufferBytes: 1024 * 1024,
    scope: basename(directory),
  });

  const byStore = stored.consumer();
  machine.github.limit(1, "jobs/3/", 600, "bob");
  const printed = [
    stoodIn,
    await byToken.ask(log(2)).settled,
    await byToken.ask(["api", "repos/owner/repo/missing"]).settled,
    await byStore.ask(log(3)).settled,
    await byStore.ask(log(4)).settled,
  ];
  const diagnostic = startInstalledScript(
    { ...machine.github, env: alice.env },
    "ci-github-diagnostic.mjs",
    ["workflow", "owner/repo"],
  );
  assert.equal(await diagnostic.exited, 0);
  const saidByOwner = await ownerSaid(
    machine.owners().find((record) => record.directory === directory),
    log(5),
  );

  // The tokens were in use: `gh` asked as both users.
  assert.equal(alice.env.GH_TOKEN, fixtureToken("alice"));
  assert.equal(machine.asked("alice").length, 4);
  assert.deepEqual(machine.asked("bob"), ["3"]);
  const everything = [
    ...kept(root),
    JSON.stringify([greeting, request, printed]),
    JSON.stringify([byToken.failed, byStore.failed]),
    saidByOwner,
    diagnostic.stdout(),
    diagnostic.stderr(),
  ];
  assert.ok(kept(root).some((path) => /owner\.\d+\.json\n/.test(path)));
  assert.ok(kept(root).some((path) => /hold\.core\.json\n/.test(path)));
  assert.match(saidByOwner, /the log for alice/);
  for (const text of everything)
    assert.doesNotMatch(text, new RegExp(fixtureToken("")));
});
