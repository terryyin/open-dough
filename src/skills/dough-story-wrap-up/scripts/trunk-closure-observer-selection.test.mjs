// Which of its coordinator's observers closure selects, with real workers.
// When several that ended each registered the final closure: none of them,
// and the one live observer the coordinator holds beside them before that
// observer registers it. With none live, the ended observers whose records
// hold a CI verdict for the closure decide: one of them when those verdicts
// agree, none when they differ, and a record that holds no verdict (nothing
// yet, or a cancelled attempt) neither identifies one nor counts against one.
// Each record is written by the observer's own writer,
// `observeRevisionCoverage`. An observer claimed after the coordinator's
// observers were listed is never selected. The other gaps' reasons and
// directories are proven through the installed `finish` in
// `trunk-closure-owner-gaps.test.mjs`.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { publishJson } from "../../dough-execute-plan/scripts/ci-mailbox-json-file.mjs";
import {
  observeRevisionCoverage,
  readRevisionCoverage,
  registerPushedRevision,
} from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import {
  coverage,
  siblingCheckouts,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { closureObservers, observerAccess } from "./trunk-closure-observer.mjs";

// `coordinator`'s observers of the shared target, as closure reads them.
async function observersOf(fixture, coordinator = "coordinator") {
  return closureObservers({
    repo: "owner/project",
    branch: "main",
    host: "cursor",
    session: { conversation_id: coordinator },
    root: await observerAccess(fixture.execution),
    storage: fixture.storage,
  });
}

// A live observer started from the publisher's checkout that `coordinator`
// claimed through the installed hook.
async function claimed({ startObserver, hook }, coordinator = "coordinator") {
  const directory = await startObserver("publisher");
  assert.match(
    await hook("publisher", coordinator, startReceipt(directory)),
    /CI observer attached to this coordinator/,
  );
  return directory;
}

// `count` of the coordinator's observers that each registered `sha`, then
// ended.
async function endedCovering(checkouts, sha, count) {
  const ended = [];
  while (ended.length < count) ended.push(await claimed(checkouts));
  for (const directory of ended) {
    registerPushedRevision(directory, sha);
    await checkouts.fixture.stopObserver(directory);
  }
  return ended;
}

test("closure selects none of several ended observers that each registered the final closure, and selects its coordinator's one live observer that has yet to register it beside them", async (t) => {
  const checkouts = await siblingCheckouts(t, "cursor");
  const sha = "a".repeat(40);
  await endedCovering(checkouts, sha, 2);
  const select = async () => (await observersOf(checkouts.fixture)).select(sha);

  assert.equal((await select()).gap.ownership, "ended");

  const live = await claimed(checkouts);
  assert.equal((await select()).directory, live);
});

// The ended observer at `directory` records the CI attempts `runs`, as its
// worker did on each poll while it ran. An attempt's `conclusion` gives the
// record's state: `success`, `failure`, or `cancelled` for `incomplete`.
const attempt = (headSha, conclusion) => ({
  headSha,
  status: "completed",
  conclusion,
  databaseId: 1,
  attempt: 1,
});
const observe = (directory, ...runs) =>
  observeRevisionCoverage(directory, runs, {
    repo: "owner/project",
    branch: "main",
  });
const states = (directories, sha) =>
  directories.map((directory) => {
    const record = readRevisionCoverage(directory).find(
      (revision) => revision.sha === sha,
    );
    return record.basis?.state
      ? `${record.state}:${record.basis.state}`
      : record.state;
  });

// `count` ended observers of the coordinator that each registered `sha`, in
// the order closure lists them, with what selecting among them returns.
async function endedListed(t, sha, count) {
  const checkouts = await siblingCheckouts(t, "cursor");
  const ended = await endedCovering(checkouts, sha, count);
  const listed = (await observersOf(checkouts.fixture)).directories;
  assert.deepEqual(listed.toSorted(), ended.toSorted());
  return {
    listed,
    select: async () => (await observersOf(checkouts.fixture)).select(sha),
  };
}

function assertEndedGap({ gap, directory }, listed) {
  assert.equal(directory, undefined);
  assert.equal(gap.ownership, "ended");
  assert.match(
    gap.reason,
    new RegExp(
      `${listed.length} of its observers each registered this revision`,
    ),
  );
  assert.deepEqual(gap.directories.toSorted(), listed.toSorted());
}

test("closure selects, among several ended observers that each registered the final closure, the first whose record holds a verdict when those verdicts agree, and none when they differ", async (t) => {
  const sha = "b".repeat(40);
  const { listed, select } = await endedListed(t, sha, 3);

  // One holds the verdict; the others ended before they saw it.
  await observe(listed[1], attempt(sha, "success"));
  assert.deepEqual(states(listed, sha), [
    "undiscovered",
    "success",
    "undiscovered",
  ]);
  assert.equal((await select()).directory, listed[1]);

  // Every record that holds a verdict holds the same one.
  await observe(listed[2], attempt(sha, "success"));
  assert.equal((await select()).directory, listed[1]);
  await observe(listed[0], attempt(sha, "success"));
  assert.equal((await select()).directory, listed[0]);

  // Verdicts that differ identify none to trust.
  await observe(listed[2], attempt(sha, "failure"));
  assert.deepEqual(states(listed, sha), ["success", "success", "failure"]);
  assertEndedGap(await select(), listed);
});

test("closure selects none of several ended observers whose records each hold only a cancelled attempt of the final closure", async (t) => {
  const sha = "c".repeat(40);
  const { listed, select } = await endedListed(t, sha, 2);

  for (const directory of listed)
    await observe(directory, attempt(sha, "cancelled"));
  assert.deepEqual(states(listed, sha), ["incomplete", "incomplete"]);

  assertEndedGap(await select(), listed);
});

test("closure selects the ended observer whose record holds a verdict beside ended observers whose records hold a cancelled attempt, whether the verdict is the closure's own or its basis's", async (t) => {
  const sha = "d".repeat(40);
  const basis = "e".repeat(40);
  const { listed, select } = await endedListed(t, sha, 3);

  await observe(listed[0], attempt(sha, "cancelled"));
  await observe(listed[1], attempt(sha, "success"));
  assert.deepEqual(states(listed, sha), [
    "incomplete",
    "success",
    "undiscovered",
  ]);
  assert.equal((await select()).directory, listed[1]);

  await observe(listed[1], attempt(sha, "failure"));
  assert.equal((await select()).directory, listed[1]);

  // A closure whose own paths need no CI run is recorded `not_required` with
  // the ancestor that carries its verdict, the record `observeRevisionCoverage`
  // publishes for a revision `classifyRevisionApplicability` returns
  // `{ result: "not_required", basis: { sha } }` for; the worker's next poll
  // then records that ancestor's attempt on the basis.
  await observe(listed[1], attempt(sha, "cancelled"));
  publishJson(join(listed[2], "coverage"), `${sha}.json`, {
    sha,
    state: "not_required",
    basis: { sha: basis },
  });
  assertEndedGap(await select(), listed);
  await observe(listed[2], attempt(basis, "success"));
  assert.deepEqual(states(listed, sha), [
    "incomplete",
    "incomplete",
    "not_required:success",
  ]);
  assert.equal((await select()).directory, listed[2]);

  // A cancelled attempt of the basis holds no verdict either.
  await observe(listed[2], attempt(basis, "cancelled"));
  assertEndedGap(await select(), listed);
});

test("closure names an observer its coordinator claimed after its observers were listed as one that went live, with the rerun that registers on it", async (t) => {
  const checkouts = await siblingCheckouts(t, "cursor");
  const observers = await observersOf(checkouts.fixture, "late-coordinator");
  assert.deepEqual(observers.directories, []);
  const late = await claimed(checkouts, "late-coordinator");

  const { gap } = observers.select("a".repeat(40));

  assert.equal(gap.state, "unobserved");
  assert.equal(gap.ownership, "live");
  assert.deepEqual(gap.directories, [late]);
  assert.match(
    gap.reason,
    new RegExp(
      `observer at ${late} went live while this finish ran; rerunning this finish registers on it$`,
    ),
  );
  assert.deepEqual(coverage(late), []);
});
