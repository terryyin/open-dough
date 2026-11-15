import assert from "node:assert/strict";
import { renameSync } from "node:fs";
import { tmpdir } from "node:os";
import test from "node:test";
import { git } from "../../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { until } from "../../support/local-test-suite-fixtures.mjs";
import {
  delivered,
  lastFetched,
  objectAt,
  observed,
  outcomeChange,
  onlyResult,
  outcomePath,
  publish,
  startWait,
  watchedOutcome,
  watchedRemote,
} from "../../support/wait-for-publication-fixture.mjs";

const minuteMs = 60_000;
// A duration that outlasts the command's start-up on a loaded machine.
const beyondLoadedStartUp = ["--duration-minutes", "0.25"];

test("a push touching no watched path prints nothing, and a push to a watched path ends the wait with one result naming the change and the deadline", async (t) => {
  const { supplier, watcher } = await watchedRemote(t);
  const start = await objectAt(supplier, "HEAD");
  const deadline = new Date(Date.now() + 60 * minuteMs).toISOString();
  const wait = startWait(t, watcher, ...watchedOutcome, "--deadline", deadline);
  await observed(watcher, start);

  const unrelated = await publish(supplier, "main", { "src/other.md": "x\n" });
  await observed(watcher, unrelated);
  assert.equal(wait.stdout + wait.stderr, "");

  const published = await publish(supplier, "main", delivered);

  assert.deepEqual(await onlyResult(wait), {
    result: "publication",
    remote: "origin",
    changes: [
      await outcomeChange(
        supplier,
        await objectAt(supplier, `${start}:${outcomePath}`),
        published,
      ),
    ],
    deadline,
  });
  assert.equal((await git(watcher, "status", "--porcelain")).stdout, "");
});

test("a supplier branch watched whole beside a path on the target stays silent across an unrelated push to the target, and a push to the branch touching no watched path ends the wait naming that ref", async (t) => {
  const { supplier, watcher } = await watchedRemote(t);
  const start = await objectAt(supplier, "HEAD");
  await git(supplier, "push", "--quiet", "origin", "HEAD:refs/heads/supplier");
  const wait = startWait(t, watcher, "--ref", "supplier", ...watchedOutcome);
  await observed(watcher, start);

  const unrelated = await publish(supplier, "main", { "src/other.md": "x\n" });
  await observed(watcher, unrelated);
  assert.equal(wait.stdout + wait.stderr, "");
  const published = await publish(supplier, "supplier", { "any.md": "x\n" });

  assert.deepEqual((await onlyResult(wait)).changes, [
    { ref: "supplier", before: start, after: published },
  ]);
});

test("a watched path that first appears on the ref ends the wait", async (t) => {
  const { supplier, watcher } = await watchedRemote(t, { "README.md": "x\n" });
  const start = await objectAt(supplier, "HEAD");
  const wait = startWait(t, watcher, ...watchedOutcome);
  await observed(watcher, start);

  const published = await publish(supplier, "main", delivered);

  assert.deepEqual((await onlyResult(wait)).changes, [
    await outcomeChange(supplier, null, published),
  ]);
});

for (const [name, duration, minutes] of [
  ["defaults to 60 minutes", [], 60],
  ["follows the named duration", ["--duration-minutes", "90"], 90],
]) {
  test(`the deadline ${name} from the start of the wait`, async (t) => {
    const { supplier, watcher } = await watchedRemote(t);
    const startedAfter = Date.now();
    const wait = startWait(t, watcher, "--ref", "main", ...duration);
    await observed(watcher, await objectAt(supplier, "HEAD"));
    const startedBefore = Date.now();

    await publish(supplier, "main", delivered);

    const deadline = Date.parse((await onlyResult(wait)).deadline);
    assert.ok(deadline >= startedAfter + minutes * minuteMs);
    assert.ok(deadline <= startedBefore + minutes * minuteMs);
  });
}

test("arguments that name no ref end at once with the usage", async (t) => {
  const wait = startWait(t, tmpdir());

  assert.equal((await wait.ended).code, 2);
  assert.equal(wait.stdout, "");
  assert.match(wait.stderr, /at least one --ref\nUsage: /);
});

test("a first observation that cannot read the remote ends at once with its error", async (t) => {
  const { remote, watcher } = await watchedRemote(t);
  renameSync(remote, `${remote}.away`);

  const wait = startWait(t, watcher, "--ref", "main");

  assert.equal((await wait.ended).code, 1);
  assert.equal(wait.stdout, "");
  assert.match(wait.stderr, /cannot read main from origin: .*repository/s);
});

test("a later observation that cannot read the remote is retried silently", async (t) => {
  const { remote, supplier, watcher } = await watchedRemote(t);
  const start = await objectAt(supplier, "HEAD");
  const wait = startWait(t, watcher, "--ref", "main");
  await observed(watcher, start);

  renameSync(remote, `${remote}.away`);
  await until("an observation fails", () => lastFetched(watcher) === "");
  assert.equal(wait.stdout + wait.stderr, "");
  renameSync(`${remote}.away`, remote);
  const published = await publish(supplier, "main", { "any.md": "x\n" });

  assert.deepEqual((await onlyResult(wait)).changes, [
    { ref: "main", before: start, after: published },
  ]);
});

test("a remote that stays unreadable after the first observation prints nothing until one deadline result", async (t) => {
  const { remote, supplier, watcher } = await watchedRemote(t);
  const wait = startWait(t, watcher, ...watchedOutcome, ...beyondLoadedStartUp);
  await observed(watcher, await objectAt(supplier, "HEAD"));

  renameSync(remote, `${remote}.away`);

  const result = await onlyResult(wait);
  assert.equal(lastFetched(watcher), "");
  assert.equal(result.result, "deadline");
  assert.ok(wait.printedAt >= Date.parse(result.deadline));
});
