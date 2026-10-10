// Trunk Mode closure whose coordinator holds no live observer and one ended
// observer that registered the final closure, through the installed `finish`
// with real workers and a bare remote: that observer settles the closure only
// by a CI verdict its record holds. A sibling coordinator's live observer of
// the same target is never registered on, completed, or stopped for it.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acceptedIncrement,
  coverage,
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

test("finish whose coordinator's one observer registered the final closure and ended with only a cancelled attempt reports it ended with the deliver step and retires nothing; its rerun after that deliver completes on the new observer and retires", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher } = journey;
  const beforeCleanup = await acceptedIncrement(fixture);
  const final = await commitFinalClosure(fixture);
  const finish = () =>
    journey.finish({ beforeCleanup, final, extra: ["--created-for-work"] });
  const established = async () => {
    const { delivered } = await journey.deliver(beforeCleanup);
    assert.equal(delivered.receipt.sha, final);
    return delivered.observation;
  };
  // The owner's one observer is told of the final closure, then stopped
  // before CI released a verdict for it.
  assert.equal((await established()).directory, publisher);
  await fixture.stopObserver(publisher);
  assert.deepEqual(coverage(publisher), [final]);
  const pushes = await journey.pushes();

  const ended = await finish();
  await assertUnresolvedCoverage(fixture, ended, {
    final,
    ownership: "ended",
    reason: new RegExp(
      `${publisher} ended \\(.*its observer at ${publisher} registered this revision and its record holds no CI verdict for it.*next \`deliver\` from the execution worktree establishes its own.*rerunning this finish`,
    ),
  });
  assert.deepEqual(ended.result.observation.directories, [publisher]);
  journey.assertSiblingUntouched();

  const own = await established();
  assert.equal(own.state, "attached", own.reason);
  assert.notEqual(own.directory, publisher);
  releaseCi(fixture, { [final]: "success" });
  const rerun = await finish();
  assert.equal(rerun.code, 0, rerun.stderr);
  assert.equal(rerun.result.observation.directory, own.directory);
  assert.deepEqual(coverage(own.directory), [final]);
  assertCompletedAndStopped(rerun.result, own.directory, final);
  assert.equal(rerun.result.cleanup.worktree, "removed");
  assert.deepEqual(coverage(publisher), [final]);
  assert.equal(pushes(), 0);
  // That delivery added its readiness probe and its observer; finish none.
  journey.assertSiblingUntouched(4);
});
