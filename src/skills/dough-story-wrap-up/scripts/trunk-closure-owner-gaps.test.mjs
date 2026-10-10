// Trunk Mode closure whose owner evidence is missing, another coordinator's,
// ended, or ambiguous keeps the accepted publication beside an unresolved
// coverage obligation and the workspace, through the installed `finish` with
// real workers and a bare remote. A sibling coordinator's live observer of
// the same target is never registered on, completed, or stopped for it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  acceptedIncrement,
  coverage,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { lsRemoteSha } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { closureBesideSibling } from "./trunk-closure-owner-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

// The accepted final closure stands unobserved with everything preserved.
async function assertUnresolvedCoverage(
  fixture,
  { result, code },
  { final, ownership, reason },
) {
  assert.equal(code, 1);
  assert.equal(result.ok, false);
  assert.equal(result.step, "observation");
  assert.equal(result.publication, "accepted");
  assert.equal(result.acceptedSha, final);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(result.observation.state, "unobserved");
  assert.equal(result.observation.pendingCi, "unobserved");
  assert.equal(result.observation.ownership, ownership);
  assert.match(result.observation.reason, reason);
  assert.equal(result.completion, null);
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
}

test("finish without the owner's identity, as another coordinator, or after the owner's observer ended reports the accepted closure unobserved, keeps the worktree, and leaves the live sibling alone; a replacing session that follows the gap completes on its own observer", async (t) => {
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

  // The owner's observer ended before it was told of the final closure.
  await fixture.stopObserver(publisher);
  const ended = await finish();
  await assertUnresolvedCoverage(fixture, ended, {
    final,
    ownership: "ended",
    reason: new RegExp(
      `${publisher} ended \\(.*next \`deliver\` from the execution worktree establishes its own.*rerunning this finish`,
    ),
  });
  assert.deepEqual(coverage(publisher), []);
  assert.equal(pushes(), 1);
  journey.assertSiblingUntouched();

  // The session that replaced that coordinator follows the gap reason: the
  // recorded observer is stopped, its `deliver` establishes its own without a
  // second push, and its rerun completes there.
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

test("finish whose coordinator's ended observers each registered the final closure reports them ended with the deliver step; its rerun after that deliver completes on the new observer and retires; a rerun after retirement repeats completion on that observer for its owner only", async (t) => {
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

  const several = await finish();
  await assertUnresolvedCoverage(fixture, several, {
    final,
    ownership: "ended",
    reason:
      /ended \(.*2 of its observers each registered this revision and none is live.*next `deliver` from the execution worktree establishes its own.*rerunning this finish/,
  });
  assert.deepEqual(
    several.result.observation.directories.toSorted(),
    [publisher, second].toSorted(),
  );

  const own = await established();
  assert.equal(own.state, "attached", own.reason);
  releaseCi(fixture, { [final]: "success" });
  const rerun = await finish();
  assert.equal(rerun.code, 0, rerun.stderr);
  assert.equal(rerun.result.observation.directory, own.directory);
  assert.deepEqual(coverage(own.directory), [final]);
  assert.equal(rerun.result.completion.verdict, "success");
  assert.equal(rerun.result.completion.shutdown.status, "confirmed");
  assert.equal(rerun.result.cleanup.worktree, "removed");
  // Each establishing delivery added its readiness probe and its observer.
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
  assert.equal(again.result.observation.directory, own.directory);
  assert.equal(again.result.completion.requestedSha, final);
  assert.equal(again.result.completion.verdict, "success");
  assert.equal(again.result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  for (const ended of [publisher, second, own.directory])
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
