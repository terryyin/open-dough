// Separate consumer processes -- the request source's own and the installed
// CI diagnostic entry -- asking one instrumented `gh` through one request
// owner of each test's own: one owner however many enter together, eight
// turns and one rate-limit wait shared by them all, and a leaving or ended
// process ending only its own waits.
import assert from "node:assert/strict";
import { basename } from "node:path";
import { test } from "node:test";
import {
  instrumentedGithubFixture,
  startInstalledScript,
  until,
} from "./ci-github-test-fixtures.mjs";
import { startConsumer } from "./github-request-consumer-test-fixtures.mjs";
import {
  ownerRecords,
  processGone,
} from "./github-request-owner-test-fixtures.mjs";

const logRoute = (job) => `repos/owner/repo/actions/jobs/${job}/logs`;
const log = (job) => ["api", logRoute(job)];
const observationMs = 5_000;

// A missing settlement is an assertion failure, even when a disabled rule
// leaves the real consumer waiting on a held upstream call.
async function observed(promise, description) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((...[, reject]) => {
        timer = setTimeout(
          () =>
            reject(
              new assert.AssertionError({
                message: `${description} did not settle within ${observationMs} ms`,
              }),
            ),
          observationMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// A `gh` whose job logs wait for `releaseLogs`, the consumers asking it
// through one owner, and how many logs it was asked for.
function heldLogs(t) {
  const github = instrumentedGithubFixture(t, {
    runs: [],
    attempts: {},
    jobs: [],
    holdLogs: true,
    log: "the log",
  });
  github.teardown.defer(() => {
    github.releaseLogs();
    github.releaseRequests();
  });
  const root = github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT;
  return {
    github,
    owners: () => ownerRecords(root),
    consumer: () => startConsumer(github.env, github.teardown),
    logsAsked: () =>
      github.asked().filter((call) => call.endsWith("/logs")).length,
  };
}

test("processes entering together start one owner, which asks GitHub once for the call they all wait on and ends after them", async (t) => {
  const { github, owners, consumer, logsAsked } = heldLogs(t);
  const consumers = Array.from({ length: 5 }, consumer);
  const waits = consumers.map((entering) => entering.ask(log(1)));
  await Promise.all(consumers.map((entering) => entering.reached()));
  await until(() => logsAsked() === 1, "the shared log was asked");

  // A second owner could only have stood by claiming a later generation.
  const [owner, ...others] = owners();
  assert.deepEqual(others, []);
  assert.equal(basename(owner.file), "owner.1.json");
  assert.ok(!consumers.some(({ pid }) => pid === owner.pid));

  github.releaseLogs();
  for (const { settled } of waits)
    assert.deepEqual(await settled, {
      settled: 1,
      status: 200,
      body: "the log",
    });
  assert.equal(logsAsked(), 1);

  assert.equal(processGone(owner.pid), false);
  for (const entered of consumers) entered.kill();
  await until(() => processGone(owner.pid), "the owner ended once idle");
});

test("at most eight calls are at GitHub at once across processes, and the rest are asked as turns end", async (t) => {
  const { github, consumer, logsAsked } = heldLogs(t);
  const consumers = [consumer(), consumer()];
  const waits = consumers.flatMap((process, index) =>
    Array.from(Array(6).keys(), (job) => process.ask(log(index * 6 + job))),
  );
  await observed(
    Promise.all(consumers.map((process) => process.reached())),
    "both consumers reached the owner",
  );
  await until(() => logsAsked() >= 8, "eight logs were asked", observationMs);
  assert.equal(logsAsked(), 8, "only eight held logs may reach GitHub");

  github.releaseLogs();
  const answered = await observed(
    Promise.all(waits.map(({ settled }) => settled)),
    "all twelve logs",
  );
  assert.ok(answered.every(({ status }) => status === 200));
  assert.equal(logsAsked(), 12);
  assert.equal(github.mostUnderWay(), 8);
});

test("a rate limit one process meets holds back every other process unasked, a newly started diagnostic entry included", async (t) => {
  const { github, consumer } = heldLogs(t);
  github.limit(1, "jobs/1/", 600);
  const [limited, peer] = [consumer(), consumer()];
  const refused = await observed(
    limited.ask(log(1)).settled,
    "the limited log",
  );
  assert.deepEqual(refused.failure, {
    kind: "rate-limited",
    status: 429,
    waitSeconds: 600,
  });

  const held = await observed(
    peer.ask(log(2)).settled,
    "the peer's held-back log",
  );
  assert.equal(held.status, undefined);
  assert.equal(held.failure.kind, "held-back");
  assert.ok(held.failure.waitSeconds > 590 && held.failure.waitSeconds <= 600);
  assert.deepEqual(limited.failed, ["rate-limited"]);
  assert.deepEqual(peer.failed, []);

  // The wait outlives the processes that met it: a process started later
  // to check again is held by it.
  limited.kill();
  peer.kill();
  const diagnostic = startInstalledScript(github, "ci-github-diagnostic.mjs", [
    "workflow",
    "owner/repo",
  ]);
  assert.equal(await observed(diagnostic.exited, "the held diagnostic"), 75);
  assert.match(diagnostic.stderr(), /GitHub directed a wait of \d+ s/);
  assert.deepEqual(github.asked(), [`api --include ${logRoute(1)}`]);
});

test("once a wait ends one request goes first for every process, and the others follow it", async (t) => {
  const { github, consumer, logsAsked } = heldLogs(t);
  github.limit(1, "jobs/1/", 1);
  const consumers = [consumer(), consumer()];
  const refused = await observed(
    consumers[0].ask(log(1)).settled,
    "the limited log",
  );
  const waitOver = Date.now() + refused.failure.waitSeconds * 1000;
  await until(
    () => Date.now() >= waitOver,
    "the directed wait ended",
    observationMs,
  );

  const waits = consumers.flatMap((process, index) =>
    [2, 3, 4].map((job) => process.ask(log(index * 10 + job))),
  );
  await observed(
    Promise.all(consumers.map((process) => process.reached())),
    "both consumers reached the owner after the wait",
  );
  await until(
    () => logsAsked() >= 2,
    "the first request was asked",
    observationMs,
  );
  assert.equal(
    logsAsked(),
    2,
    "only one held log may follow the directed wait",
  );

  github.releaseLogs();
  const answered = await observed(
    Promise.all(waits.map(({ settled }) => settled)),
    "the six post-wait logs",
  );
  assert.ok(answered.every(({ status }) => status === 200));
  assert.equal(logsAsked(), 7);
  // The refused call, then the one that went first: answered before any
  // other was asked.
  const [, , first, next] = github.calls();
  assert.deepEqual(
    [first.phase, next.phase, next.pid],
    ["asked", "answered", first.pid],
  );
});

test("a process that stops waiting, or ends, leaves the call running for the process still waiting", async (t) => {
  const { github, consumer, logsAsked } = heldLogs(t);
  const [staying, leaving, ending] = [consumer(), consumer(), consumer()];
  const stays = staying.ask(log(1));
  const leaves = leaving.ask(log(1));
  ending.ask(log(1));
  await Promise.all(
    [staying, leaving, ending].map((process) => process.reached()),
  );
  await until(() => logsAsked() === 1, "the shared log was asked");

  leaves.cancel();
  assert.deepEqual(await leaves.settled, { settled: 1, rejected: "left" });
  ending.kill();
  await until(() => processGone(ending.pid), "the ending process ended");
  // The owner has read a departure once it answers what was sent after it.
  await leaving.reached();
  await staying.reached();

  github.releaseLogs();
  assert.equal((await stays.settled).status, 200);
  assert.equal(logsAsked(), 1);
  // Each `reached` is one refused request, told as failed; a departure and
  // an answered call are told to nobody.
  assert.deepEqual(staying.failed, ["failed", "failed"]);
  assert.deepEqual(leaving.failed, ["failed", "failed"]);
});
