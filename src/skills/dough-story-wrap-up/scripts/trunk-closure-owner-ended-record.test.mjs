// Trunk Mode closure whose coordinator holds no live observer and one ended
// observer that registered the final closure, through the installed `finish`
// with real workers and a bare remote: finish recovers completion on a
// replacement when that ended record holds no CI verdict. A sibling
// coordinator's live observer of the same target is never registered on,
// completed, or stopped for it.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acceptedIncrement,
  coverage,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  assertCompletedAndStopped,
  closureBesideSibling,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

test("finish whose coordinator's one observer registered the final closure and ended with only a cancelled attempt completes on a replacement and retires; its rerun repeats the receipt without another observer", async (t) => {
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
  releaseCi(fixture, { [final]: "success" });

  const finished = await finish();
  assert.equal(finished.code, 0, finished.stderr);
  const own = finished.result.observation.directory;
  assert.notEqual(own, publisher);
  assert.equal(
    finished.result.observation.state,
    "attached",
    finished.result.observation.reason,
  );
  assert.deepEqual(coverage(own), [final]);
  assertCompletedAndStopped(finished.result, own, final);
  assert.equal(finished.result.cleanup.worktree, "removed");
  assert.deepEqual(coverage(publisher), [final]);
  assert.equal(pushes(), 0);
  // Recovery added its readiness probe and its observer; finish none more.
  journey.assertSiblingUntouched(4);

  const again = await journey.rerunFromManagement(
    { beforeCleanup, final },
    journey.owner,
  );
  assert.equal(again.code, 0, again.stderr);
  assert.equal(again.result.pushCount, 0);
  assert.equal(again.result.observation.directory, own);
  assert.equal(again.result.completion.requestedSha, final);
  assert.equal(again.result.completion.verdict, "success");
  assert.equal(again.result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  assert.deepEqual(coverage(publisher), [final]);
  assert.deepEqual(coverage(own), [final]);
  journey.assertSiblingUntouched(4);
});
