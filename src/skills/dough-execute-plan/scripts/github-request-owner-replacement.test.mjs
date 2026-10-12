// A request owner killed outright, as nothing it could prepare for does,
// and the owner the next consumer starts in its place: the `gh` calls the
// killed one left at GitHub are ended before the new one asks anything, a
// rate limit's wait stands on through any number of owners, and no consumer
// is told of a wait that was not stored first. An owner still running once
// another's record overtakes its own asks nothing more.
import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { test } from "node:test";
import { until } from "./ci-github-test-fixtures.mjs";
import { fixtureToken, log } from "./github-request-login-test-fixtures.mjs";
import { claimedRecord } from "./github-request-owner-endpoint.mjs";
import { replacementMachine } from "./github-request-owner-replacement-test-fixtures.mjs";
import { processGone } from "./github-request-owner-test-fixtures.mjs";
import { protocol } from "./github-request-owner-wire.mjs";

const heldBack = (answer) => {
  assert.equal(answer.status, undefined);
  assert.equal(answer.failure.kind, "held-back");
  return answer.failure.waitSeconds;
};

test("an owner killed with eight calls at GitHub is replaced by one that ends those eight before it asks anything, and its waiters are told their calls failed", async (t) => {
  const { github, owners, consumer, killOwner, logsAsked, kept } =
    replacementMachine(t);
  github.recordEndings();
  const consumers = [consumer(), consumer()];
  const asking = (jobs, from) =>
    consumers.flatMap((process, index) =>
      Array.from(Array(jobs).keys(), (job) =>
        process.ask(log(from + index * jobs + job)),
      ),
    );
  const waits = asking(4, 0);
  await until(() => logsAsked() === 8, "eight logs were asked");

  // Each call at GitHub is recorded by its process, with no token.
  const [{ directory }] = owners();
  const left = github.calls().map(({ pid }) => pid);
  const records = kept(directory);
  assert.deepEqual(
    Object.keys(records)
      .filter((name) => name.startsWith("call."))
      .toSorted(),
    left.map((pid) => `call.1.${pid}.json`).toSorted(),
  );
  for (const text of Object.values(records))
    assert.doesNotMatch(String(text), new RegExp(fixtureToken("")));

  const killed = killOwner();
  for (const { settled } of waits)
    assert.deepEqual(await settled, {
      settled: (await settled).settled,
      failure: { kind: "failed" },
      body: "",
    });
  assert.deepEqual(consumers[0].failed, Array(4).fill("failed"));

  const again = asking(6, 100);
  await until(() => logsAsked() === 16, "eight more logs were asked");
  const [owner, ...others] = owners();
  assert.deepEqual(others, []);
  assert.equal(basename(owner.file), "owner.2.json");
  assert.notEqual(owner.pid, killed.pid);

  // All eight left calls were told to end before the next call was asked.
  const timeline = github.calls();
  assert.deepEqual(
    timeline.slice(8, 16).map(({ phase, pid }) => [phase, left.includes(pid)]),
    Array(8).fill(["told-to-end", true]),
  );
  assert.ok(timeline.slice(16).every(({ pid }) => !left.includes(pid)));

  github.releaseLogs();
  for (const { settled } of again) {
    const answer = await settled;
    assert.equal(answer.status, 200);
    assert.equal(answer.body, "the log for ann");
  }
  assert.equal(logsAsked(), 20);
  assert.equal(github.mostUnderWay(), 8);
  assert.deepEqual(
    Object.keys(kept(directory)).filter((name) => name.startsWith("call.")),
    [],
  );
});

test("a rate limit's wait is stored before it is answered and holds back each owner started after the one that met it was killed", async (t) => {
  const { github, owners, consumer, killOwner, kept } = replacementMachine(t);
  github.limit(1, "jobs/1/", 600);
  const metAt = Date.now();
  const refused = await consumer().ask(log(1)).settled;
  assert.deepEqual(refused.failure, {
    kind: "rate-limited",
    status: 429,
    waitSeconds: 600,
  });
  const [{ directory }] = owners();
  const stored = JSON.parse(String(kept(directory)["hold.core.json"]));
  assert.deepEqual(Object.keys(stored).toSorted(), [
    "backoffStep",
    "resumesAtMs",
    "resuming",
    "version",
  ]);
  assert.ok(stored.resumesAtMs >= metAt + 600_000);

  for (const generation of [2, 3]) {
    killOwner();
    const wait = heldBack(await consumer().ask(log(generation)).settled);
    assert.ok(wait > 590 && wait <= 600);
    assert.equal(basename(owners()[0].file), `owner.${generation}.json`);
  }
  assert.equal(github.asked().length, 1);
});

test("a wait that ended while no owner stood leaves one request to go first for the owner started next", async (t) => {
  const { github, owners, consumer, killOwner, logsAsked, kept } =
    replacementMachine(t);
  github.limit(1, "jobs/1/", 1);
  await consumer().ask(log(1)).settled;
  const [{ directory }] = owners();
  killOwner();
  const { resumesAtMs } = JSON.parse(String(kept(directory)["hold.core.json"]));
  await until(() => Date.now() >= resumesAtMs, "the directed wait ended");

  const consumers = [consumer(), consumer()];
  const waits = consumers.flatMap((process, index) =>
    [2, 3, 4].map((job) => process.ask(log(index * 10 + job))),
  );
  await Promise.all(consumers.map((process) => process.reached()));
  await until(() => logsAsked() === 2, "the first request was asked");

  github.releaseLogs();
  for (const { settled } of waits) assert.equal((await settled).status, 200);
  assert.equal(logsAsked(), 7);
  // The refused call, then the one that went first: answered before any
  // other was asked.
  const [, , first, next] = github.calls();
  assert.deepEqual(
    [first.phase, next.phase, next.pid],
    ["asked", "answered", first.pid],
  );
  assert.equal(kept(directory)["hold.core.json"], undefined);
});

test("a wait that cannot be stored is told to nobody: the call that met the limit fails, nothing more is asked, and the wait is told once it is stored", async (t) => {
  const { github, owners, consumer, killOwner, kept } = replacementMachine(t);
  github.limit(1, "jobs/1/", 600);
  const limited = consumer();
  await limited.reached();
  const [{ directory }] = owners();
  const hold = join(directory, "hold.core.json");
  mkdirSync(join(hold, "in-the-way"), { recursive: true });

  const refused = await limited.ask(log(1)).settled;
  assert.deepEqual(refused.failure, { kind: "failed" });
  assert.equal(refused.status, undefined);
  assert.deepEqual(limited.failed, ["failed", "failed"]);
  const peer = consumer();
  assert.deepEqual((await peer.ask(log(2)).settled).failure, {
    kind: "failed",
  });
  assert.deepEqual(Object.keys(kept(directory)), ["owner.1.json"]);

  rmSync(hold, { recursive: true });
  const wait = heldBack(await peer.ask(log(3)).settled);
  assert.ok(wait > 590 && wait <= 600);
  assert.ok(JSON.parse(String(kept(directory)["hold.core.json"])).resuming);

  killOwner();
  heldBack(await consumer().ask(log(4)).settled);
  assert.equal(github.asked().length, 1);
});

test("an owner whose record is overtaken while its calls are at GitHub asks nothing more and passes no answer on", async (t) => {
  const { github, owners, consumer, logsAsked } = replacementMachine(t);
  const consumers = [consumer(), consumer()];
  const waits = consumers.flatMap((process, index) =>
    Array.from(Array(6).keys(), (job) => process.ask(log(index * 6 + job))),
  );
  await Promise.all(consumers.map((process) => process.reached()));
  await until(() => logsAsked() === 8, "eight logs were asked");

  const [overtaken] = owners();
  const later = join(overtaken.directory, "owner.2.json");
  github.teardown.defer(() => rmSync(later, { force: true }));
  const standing = { pid: process.pid, protocol, token: "caller" };
  assert.ok(claimedRecord(overtaken.directory, 2, standing));
  github.releaseLogs();

  for (const { settled } of waits) {
    const answer = await settled;
    assert.deepEqual(answer.failure, { kind: "failed" });
    assert.equal(answer.status, undefined);
  }
  assert.equal(logsAsked(), 8);
  await until(() => processGone(overtaken.pid), "the overtaken owner ended");
});
