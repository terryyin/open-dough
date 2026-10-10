// Which of its coordinator's observers closure selects, with real workers.
// When several that ended each registered the final closure: none of them,
// and the one live observer the coordinator holds beside them before that
// observer registers it. With none live, the ended observers whose records
// hold the closure's result decide: one of them when those results agree, none
// when they differ. An observer claimed after the coordinator's observers were
// listed is never selected. The other gaps' reasons and directories are proven
// through the installed `finish` in `trunk-closure-owner-gaps.test.mjs`.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { publishJson } from "../../dough-execute-plan/scripts/ci-mailbox-json-file.mjs";
import { registerPushedRevision } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
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

test("closure selects, among several ended observers that each registered the final closure, the first whose record holds its result when those results agree, and none when they differ", async (t) => {
  const checkouts = await siblingCheckouts(t, "cursor");
  const sha = "b".repeat(40);
  const ended = await endedCovering(checkouts, sha, 3);
  // What an observer's record holds once it saw the closure's CI result.
  const record = (directory, state) =>
    publishJson(join(directory, "coverage"), `${sha}.json`, { sha, state });
  const listed = (await observersOf(checkouts.fixture)).directories;
  assert.deepEqual(listed.toSorted(), ended.toSorted());
  const select = async () => (await observersOf(checkouts.fixture)).select(sha);

  // One holds the result; the others ended before they saw it.
  record(listed[1], "success");
  assert.equal((await select()).directory, listed[1]);

  // Every record that holds the result holds the same one.
  record(listed[2], "success");
  assert.equal((await select()).directory, listed[1]);
  record(listed[0], "success");
  assert.equal((await select()).directory, listed[0]);

  // Records that differ identify none to trust.
  record(listed[2], "failure");
  const { gap, directory } = await select();
  assert.equal(directory, undefined);
  assert.equal(gap.ownership, "ended");
  assert.match(gap.reason, /3 of its observers each registered this revision/);
  assert.deepEqual(gap.directories.toSorted(), ended.toSorted());
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
