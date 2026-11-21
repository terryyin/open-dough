// A Trunk Mode `finish` rerun from the management context after the execution
// worktree was removed, owned by the caller's ambient session alone: the
// installed command, the installed host hook's own claims, real workers, a
// bare remote, and a controlled CI provider. It settles the accepted closure
// only for the coordinator that owns an observer of it, beside a sibling
// coordinator's live observer of the same target.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acceptedIncrement,
  coverage,
  hosts,
  revisions,
} from "../dough-execute-plan/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { completeThroughCli } from "../dough-execute-plan/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { git } from "../dough-execute-plan/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  assertCompletedAndStopped,
  closureBesideSibling,
  deliverBeforeCleanup,
  pushFinalClosure,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

test("a rerun after completion and worktree removal completes only for the owner and stops at the unpublished record: without its identity or as another coordinator the accepted closure is reported unobserved and the branch stays", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher } = journey;
  const beforeCleanup = await deliverBeforeCleanup(journey);
  const final = await commitFinalClosure(fixture);
  const { delivered } = await journey.deliver(beforeCleanup);
  assert.equal(delivered.receipt.sha, final);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  // The completion the interrupted `finish` ran.
  const first = await completeThroughCli(fixture, publisher, final);
  assert.equal(first.shutdown.status, "confirmed");
  await git(fixture.integration, "worktree", "remove", fixture.execution);
  const pushes = await journey.pushes();
  const rerun = (coordinator) =>
    journey.ambientRerunFromManagement({ beforeCleanup, final }, coordinator);

  for (const [coordinator, ownership, reason] of [
    // No ambient identity at all, then one that owns no observer.
    [null, "unidentified", /CLAUDE_CODE_SESSION_ID is unset.*run finish/],
    ["third-coordinator", "missing", /holds no observer.*--session-json/],
  ]) {
    const { result, code } = await rerun(coordinator);
    assert.equal(code, 1);
    assert.equal(result.step, "observation");
    assert.equal(result.publication, "accepted");
    assert.equal(result.acceptedSha, final);
    assert.equal(result.observation.state, "unobserved");
    assert.equal(result.observation.ownership, ownership);
    assert.match(result.observation.reason, reason);
    assert.equal(result.completion, null);
    assert.equal(result.cleanup, "not-performed");
    assert.equal(await branchSha(fixture), final);
  }

  const { result, code } = await rerun(journey.owner);
  assert.equal(code, 1);
  assert.equal(result.observation.directory, publisher);
  assert.equal(result.completion.shutdown.status, "confirmed");
  // The removed worktree held the unpublished session record, so the owner's
  // settlement stops at the record stage and the branch stays.
  assert.equal(result.step, "record");
  assert.deepEqual(result.record, { status: "not-published" });
  assert.equal(result.cleanup, "not-performed");
  assert.equal(await branchSha(fixture), final);
  assert.equal(pushes(), 0);
  journey.assertSiblingUntouched();
});

test("an ambient rerun after worktree removal whose coordinator's observers never registered the final closure registers, completes, and stops that coordinator's one live observer of the target, stops at the unpublished record, and leaves the sibling's alone", async (t) => {
  // Armed from the default checkout, the publisher's observer outlives the
  // execution worktree as the sibling's does.
  const journey = await closureBesideSibling(t, "claude", "sibling");
  const { fixture, publisher } = journey;
  const beforeCleanup = await acceptedIncrement(fixture);
  const final = await pushFinalClosure(fixture);
  releaseCi(fixture, { [final]: "success" });
  await git(fixture.integration, "worktree", "remove", fixture.execution);
  assert.deepEqual(coverage(publisher), []);
  const pushes = await journey.pushes();

  const { result, code, stderr } = await journey.ambientRerunFromManagement({
    beforeCleanup,
    final,
  });

  assert.equal(code, 1, stderr);
  assert.equal(result.pushCount, 0);
  assert.equal(result.observation.directory, publisher);
  assert.match(
    result.observation.notifies,
    new RegExp(`${journey.owner}, named by ${hosts.claude.variable}`),
  );
  assert.deepEqual(coverage(publisher), revisions(final));
  assertCompletedAndStopped(result, publisher, final);
  // The removed worktree held the unpublished session record.
  assert.equal(result.step, "record");
  assert.deepEqual(result.record, { status: "not-published" });
  assert.equal(result.cleanup, "not-performed");
  assert.equal(pushes(), 0);
  journey.assertSiblingUntouched();
});
