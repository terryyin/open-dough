import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { basename, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  claimedRecord,
  EndpointBinding,
  newSocketName,
  standingRecord,
} from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.mjs";
import {
  protocol,
  receive,
  send,
} from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-wire.mjs";
import { GitHubRequests } from "../../../src/skills/dough-execute-plan/scripts/github-requests.mjs";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import { deferChildExit } from "./fixture-teardown-test-fixtures.mjs";
import {
  ownerSecret,
  refusingOwner,
} from "./github-request-owner-refusal-test-fixtures.mjs";
import {
  ownerRecords,
  saidToOwner,
} from "./github-request-owner-test-fixtures.mjs";

const coreRoute = "repos/owner/repo/actions/jobs/17/logs";
const searchRoute = "search/issues?q=repo:owner/repo";
const ownerEntry = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/scripts/github-request-owner.mjs",
    import.meta.url,
  ),
);

function reader(github) {
  const requests = new GitHubRequests({
    boundMs: 10_000,
    backoffBaseMs: 60_000,
  });
  github.teardown.defer(() => requests.disconnect());
  return requests;
}

async function clockedOwner(github) {
  const directory = await new EndpointBinding(github.env).directory();
  const clock = join(github.env.CI_GH_FIXTURE, "owner-time");
  const advanceTo = (now) => {
    writeFileSync(`${clock}.pending`, String(now));
    renameSync(`${clock}.pending`, clock);
  };
  const now = Date.now();
  advanceTo(now);
  const control = encodeURIComponent(`
    import { readFileSync } from "node:fs";
    Date.now = () => Number(readFileSync(${JSON.stringify(clock)}, "utf8"));
  `);
  const owner = spawn(
    process.execPath,
    [
      `--import=data:text/javascript,${control}`,
      ownerEntry,
      directory,
      "60000",
    ],
    { env: github.env, stdio: "ignore" },
  );
  deferChildExit(github.teardown, owner);
  await until(
    () =>
      owner.pid !== undefined && standingRecord(directory)?.pid === owner.pid,
    "the controlled request owner stood",
  );
  return { advanceTo, directory, now };
}

test("a separate consumer reads the owner's kept core wait through expiry without asking GitHub", async (t) => {
  const github = instrumentedGithubFixture(t, { log: "existing log" });
  github.enter();
  const signal = new AbortController().signal;
  const owner = await clockedOwner(github);
  const waitSeconds = 4;
  github.limit(1, coreRoute, waitSeconds);
  const { failure } = await reader(github).request(["api", coreRoute], signal);
  assert.deepEqual(failure, { kind: "rate-limited", status: 429, waitSeconds });

  const observer = reader(github);
  const hold = join(owner.directory, "hold.core.json");
  const { resumesAtMs } = JSON.parse(readFileSync(hold, "utf8"));
  const inode = statSync(hold).ino;
  owner.advanceTo(owner.now + 1_100);
  assert.deepEqual(await observer.coreCooldown(signal), {
    kind: "held-back",
    waitSeconds: waitSeconds - 1,
  });
  owner.advanceTo(resumesAtMs);
  assert.deepEqual(await observer.coreCooldown(signal), { kind: "clear" });
  assert.equal(statSync(hold).ino, inode);
  assert.deepEqual(github.asked(), [`api --include ${coreRoute}`]);
});

test("a core cooldown query requires the owner's scope and accepts no API arguments", async (t) => {
  const github = instrumentedGithubFixture(t, {});
  github.enter();
  const observer = reader(github);
  await observer.coreCooldown(new AbortController().signal);
  const [owner] = ownerRecords(github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT);
  const { lines } = await saidToOwner(
    join(owner.directory, owner.socket),
    [
      { hello: protocol, token: owner.token },
      { id: 1, request: { operation: "core-cooldown", scope: "other login" } },
      {
        id: 2,
        request: {
          operation: "core-cooldown",
          scope: basename(owner.directory),
          args: ["api", coreRoute],
        },
      },
    ],
    3,
  );
  assert.deepEqual(lines.slice(1), [
    { id: 1, refused: "another login" },
    { id: 2, refused: "not a GitHub API read" },
  ]);
  assert.deepEqual(github.asked(), []);
});

test("a wait scoped to the search resource leaves the core cooldown clear", async (t) => {
  const github = instrumentedGithubFixture(t, {});
  github.enter();
  const signal = new AbortController().signal;
  github.limit(1, searchRoute, 600);
  const search = await reader(github).request(["api", searchRoute], signal);
  assert.equal(search.failure.kind, "rate-limited");
  assert.deepEqual(await reader(github).coreCooldown(signal), {
    kind: "clear",
  });
  assert.deepEqual(github.asked(), [`api --include ${searchRoute}`]);
});

test("a protocol 2 peer without cooldown support still serves ordinary reads", async (t) => {
  const github = instrumentedGithubFixture(t, {});
  github.enter();
  const directory = await new EndpointBinding(github.env).directory();
  const socketName = newSocketName();
  const sockets = new Set();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let greeted = false;
    receive(socket, (message) => {
      if (!greeted) {
        assert.deepEqual(message, { hello: 2, token: ownerSecret });
        send(socket, { welcome: 2, operations: ["rerun-workflow"] });
        greeted = true;
        return;
      }
      const { id, request } = message;
      assert.equal(request.scope, basename(directory));
      if (request.operation === "core-cooldown") {
        send(socket, { id, refused: "not a GitHub API read" });
        return;
      }
      assert.deepEqual(request.args, ["api", coreRoute]);
      send(socket, {
        id,
        answer: { status: 200, headers: [], body: "older owner's log" },
      });
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(join(directory, socketName), resolve);
  });
  github.teardown.defer(async () => {
    rmSync(join(directory, "owner.1.json"), { force: true });
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  });
  assert.equal(
    claimedRecord(directory, 1, {
      pid: process.pid,
      protocol: 2,
      token: ownerSecret,
      socket: socketName,
    }),
    true,
  );
  const requests = reader(github);
  const signal = new AbortController().signal;
  assert.deepEqual(await requests.coreCooldown(signal), {
    kind: "unsupported",
  });
  const answer = await requests.request(["api", coreRoute], signal);
  assert.equal(answer.status, 200);
  assert.equal(answer.body, "older owner's log");
  assert.deepEqual(github.asked(), []);
});

test("an endpoint refusing the caller leaves the cooldown unavailable", async (t) => {
  const github = instrumentedGithubFixture(t, {});
  github.enter();
  await refusingOwner(github, { refused: "unauthenticated" });
  assert.deepEqual(
    await reader(github).coreCooldown(new AbortController().signal),
    {
      kind: "unavailable",
      failure: { kind: "owner-unavailable", cause: "unauthenticated" },
    },
  );
  assert.deepEqual(github.asked(), []);
});
