// Trunk Mode closure whose owner evidence is missing, another coordinator's,
// ended, or ambiguous keeps the accepted publication beside an unresolved
// coverage obligation and the workspace when recovery cannot settle it, through
// the installed `finish` with real workers and a bare remote. When this
// coordinator's observers have ended while the worktree exists, finish recovers
// completion on a replacement. A sibling coordinator's live observer of the
// same target is never registered on, completed, or stopped for it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  acceptedIncrement,
  coverage,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  assertCompletedAndStopped,
  assertUnresolvedCoverage,
  closureBesideSibling,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

test("finish without the owner's identity or as another coordinator reports the accepted closure unobserved, keeps the worktree, and leaves the live sibling alone; a replacing session that follows the gap completes on its own observer", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher, sibling } = journey;
  const beforeCleanup = await acceptedIncrement(fixture);
  const final = await commitFinalClosure(fixture);
  const pushes = await journey.pushes();
  const finish = (coordinator) =>
    journey.finish(
      { beforeCleanup, final, extra: ["--created-for-work"] },
      coordinator,
    );

  // The unpublished final closure is published once; nothing observes it.
  const unidentified = await finish(null);
  await assertUnresolvedCoverage(fixture, unidentified, {
    final,
    ownership: "unidentified",
    reason: /CLAUDE_CODE_SESSION_ID is unset/,
  });
  assert.equal(pushes(), 1);

  const stranger = await finish("third-coordinator");
  await assertUnresolvedCoverage(fixture, stranger, {
    final,
    ownership: "missing",
    reason:
      /holds no observer of owner\/project main.*--session-json with its session_id, and the agent_id its observer was claimed with, if any.*replaced the coordinator.*receives none of its events.*ci-mailbox\.mjs stop <recorded directory>.*next `deliver` from the execution worktree establishes its own.*rerunning this finish/,
  });
  assert.doesNotMatch(stranger.result.observation.reason, /naming the session/);
  for (const directory of [publisher, sibling])
    assert.doesNotMatch(
      stranger.result.observation.reason,
      new RegExp(directory),
    );
  assert.deepEqual(coverage(publisher), []);
  assert.equal(existsSync(`${publisher}/result.json`), false);
  journey.assertSiblingUntouched();

  // The owner's observer ended before it was told of the final closure. The
  // session that replaced that coordinator follows the missing gap: the
  // recorded observer is stopped, its `deliver` establishes its own without a
  // second push, and its finish completes there.
  await fixture.stopObserver(publisher);
  const { delivered } = await journey.deliver(
    beforeCleanup,
    [],
    "third-coordinator",
  );
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.receipt.sha, final);
  assert.equal(
    delivered.observation.state,
    "attached",
    delivered.observation.reason,
  );
  const own = delivered.observation.directory;
  assert.match(
    delivered.observation.notifies,
    /^Claude Code session third-coordinator, named by CLAUDE_CODE_SESSION_ID/,
  );
  releaseCi(fixture, { [final]: "success" });
  const replaced = await finish("third-coordinator");
  assert.equal(replaced.code, 0, replaced.stderr);
  assert.equal(replaced.result.observation.directory, own);
  assert.equal(
    replaced.result.observation.notifies,
    delivered.observation.notifies,
  );
  assert.equal(replaced.result.completion.verdict, "success");
  assert.equal(replaced.result.completion.shutdown.status, "confirmed");
  assert.equal(replaced.result.cleanup.worktree, "removed");
  assert.deepEqual(coverage(publisher), []);
  assert.equal(pushes(), 1);
  // That delivery added its readiness probe and its observer; finish none.
  journey.assertSiblingUntouched(4);
});

test("finish whose coordinator's ended observers each registered the final closure recovers on a replacement and retires; a rerun after retirement repeats completion on that observer for its owner only", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher } = journey;
  const beforeCleanup = await acceptedIncrement(fixture);
  const final = await commitFinalClosure(fixture);
  const finish = () =>
    journey.finish({ beforeCleanup, final, extra: ["--created-for-work"] });
  // Each of the owner's observers is told of the final closure, then ends.
  const established = async () => {
    const { delivered } = await journey.deliver(beforeCleanup);
    assert.equal(delivered.receipt.sha, final);
    return delivered.observation;
  };
  assert.equal((await established()).directory, publisher);
  await fixture.stopObserver(publisher);
  const second = (await established()).directory;
  assert.notEqual(second, publisher);
  await fixture.stopObserver(second);
  for (const ended of [publisher, second])
    assert.deepEqual(coverage(ended), [final]);
  releaseCi(fixture, { [final]: "success" });

  const recovered = await finish();
  assert.equal(recovered.code, 0, recovered.stderr);
  const own = recovered.result.observation.directory;
  assert.notEqual(own, publisher);
  assert.notEqual(own, second);
  assert.deepEqual(coverage(own), [final]);
  assertCompletedAndStopped(recovered.result, own, final);
  assert.equal(recovered.result.cleanup.worktree, "removed");
  // Recovery added its readiness probe and its observer after two ended ones.
  journey.assertSiblingUntouched(6);

  // After retirement three of the owner's ended observers each registered the
  // final closure and one completed it. A rerun from the management context
  // names its owner where the ambient identity is the sibling's.
  const settled = (session) =>
    journey.rerunFromManagement({ beforeCleanup, final }, session);

  const stranger = await settled("third-coordinator");
  assert.equal(stranger.code, 1);
  assert.equal(stranger.result.step, "observation");
  assert.equal(stranger.result.observation.ownership, "missing");
  assert.equal(stranger.result.completion, null);
  assert.equal(stranger.result.cleanup, "not-performed");

  const again = await settled(journey.owner);
  assert.equal(again.code, 0, JSON.stringify(again.result));
  assert.equal(again.result.pushCount, 0);
  assert.equal(again.result.observation.directory, own);
  assert.equal(again.result.completion.requestedSha, final);
  assert.equal(again.result.completion.verdict, "success");
  assert.equal(again.result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  for (const ended of [publisher, second, own])
    assert.deepEqual(coverage(ended), [final]);
  journey.assertSiblingUntouched(6);
});

test("finish chooses none of several live observers its coordinator owns for an accepted closure neither covers", async (t) => {
  const journey = await closureBesideSibling(t, "cursor");
  const { fixture, publisher } = journey;
  const second = await journey.startObserver("publisher");
  await journey.hook("publisher", journey.owner, startReceipt(second));
  const beforeCleanup = await acceptedIncrement(fixture);
  await commitFinalClosure(fixture);
  const final = await acceptedIncrement(fixture);
  const pushes = await journey.pushes();

  const finished = await journey.finish({
    beforeCleanup,
    final,
    extra: ["--created-for-work"],
  });

  await assertUnresolvedCoverage(fixture, finished, {
    final,
    ownership: "ambiguous",
    reason:
      /owns 2 live observers of owner\/project main.*next finish reuses it/,
  });
  assert.deepEqual(
    finished.result.observation.directories.toSorted(),
    [publisher, second].toSorted(),
  );
  assert.deepEqual(coverage(publisher), []);
  assert.deepEqual(coverage(second), []);
  assert.equal(pushes(), 0);
  journey.assertSiblingUntouched(3);
});
