// Git mechanics (not guidance-following): refresh eligibility fast-forwards
// only a clean checkout this caller owns and that is strictly behind fetched
// trunk. Publication acceptance stays independent of that result. Native
// agent behavior is not this file.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { refreshDefaultCheckout } from "./maintain-default-checkout.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  indexLockPath,
  lsRemoteSha,
  maintenanceFromInspection,
  plantHumanEdit,
  pushCandidate,
  revParse,
} from "./publication-test-fixtures.mjs";

function refresh(checkout, declaredOwner, requester) {
  return refreshDefaultCheckout({
    checkout,
    declaredOwner,
    requester,
    integrationBranch: "main",
  });
}

test("an eligible clean checkout fast-forwards to fetched trunk and a second attempt is already current", async (t) => {
  const { origin, integration, trunkSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const current = await refresh(integration, "coordinator", "coordinator");
  assert.equal(current.result, "already current");
  assert.equal(current.head, trunkSha);
  assert.equal(current.status, "");

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const advanced = await refresh(integration, "coordinator", "coordinator");
  assert.equal(advanced.result, "advanced");
  assert.equal(advanced.head, disjointSha);
  assert.equal(advanced.remoteSha, disjointSha);
  assert.equal(advanced.status, "");
  assert.equal(await revParse(integration, "HEAD"), disjointSha);
  assert.equal(
    (await git(integration, "log", "-1", "--format=%s")).stdout.trim(),
    "another writer's own increment",
  );

  const again = await refresh(integration, "coordinator", "coordinator");
  assert.equal(again.result, "already current");
  assert.equal(again.head, disjointSha);
});

test("refresh preserves a pending edit, unpublished commits, another writer's ownership, and an ongoing lock", async (t) => {
  const edit = await createCleanTrunkFixture();
  const local = await createCleanTrunkFixture();
  const other = await createCleanTrunkFixture();
  const locked = await createCleanTrunkFixture();
  t.after(edit.cleanup);
  t.after(local.cleanup);
  t.after(other.cleanup);
  t.after(locked.cleanup);

  await plantHumanEdit(edit.integration);
  const editBefore = await captureCheckout(edit.integration);
  const editResult = await refresh(
    edit.integration,
    "coordinator",
    "coordinator",
  );
  assert.equal(editResult.result, "deferred");
  assert.equal(editResult.reason, "pending-edit");
  assert.match(editResult.status, /human-staged\.txt/);
  assert.match(editResult.status, /human-unstaged\.txt/);
  assertCheckoutUnchanged(editBefore, await captureCheckout(edit.integration));

  writeFileSync(join(local.integration, "local-only.txt"), "not published\n");
  await git(local.integration, "add", "local-only.txt");
  await git(local.integration, "commit", "-m", "unpublished local commit");
  const localHead = await revParse(local.integration, "HEAD");
  const localResult = await refresh(
    local.integration,
    "coordinator",
    "coordinator",
  );
  assert.equal(localResult.result, "deferred");
  assert.equal(localResult.reason, "unpublished-commits");
  assert.equal(await revParse(local.integration, "HEAD"), localHead);
  assert.equal(
    await lsRemoteSha(local.origin, "refs/heads/main"),
    local.trunkSha,
  );

  const remoteTip = await advanceOriginFromAnotherWriter(local.origin);
  const diverged = await refresh(
    local.integration,
    "coordinator",
    "coordinator",
  );
  assert.equal(diverged.result, "stopped");
  assert.equal(diverged.reason, "diverged");
  assert.equal(await revParse(local.integration, "HEAD"), localHead);
  assert.equal(await lsRemoteSha(local.origin, "refs/heads/main"), remoteTip);

  await plantHumanEdit(local.integration);
  const dirtyDivergedBefore = await captureCheckout(local.integration);
  const dirtyDiverged = await refresh(
    local.integration,
    "coordinator",
    "coordinator",
  );
  assert.equal(dirtyDiverged.result, "stopped");
  assert.equal(dirtyDiverged.reason, "diverged");
  assertCheckoutUnchanged(
    dirtyDivergedBefore,
    await captureCheckout(local.integration),
  );

  const remoteAhead = await advanceOriginFromAnotherWriter(other.origin);
  const otherBefore = await captureCheckout(other.integration);
  const otherResult = await refresh(other.integration, "agent-a", "agent-b");
  assert.equal(otherResult.result, "deferred");
  assert.equal(otherResult.reason, "another-writer");
  assertCheckoutUnchanged(
    otherBefore,
    await captureCheckout(other.integration),
  );
  assert.notEqual(otherBefore.head, remoteAhead);

  const ambiguous = await refresh(other.integration, null, "agent-b");
  assert.equal(ambiguous.result, "deferred");
  assert.equal(ambiguous.reason, "unclear-ownership");
  assertCheckoutUnchanged(
    otherBefore,
    await captureCheckout(other.integration),
  );

  await git(other.integration, "checkout", "-b", "side");
  const sideHead = await revParse(other.integration, "HEAD");
  const side = await refresh(other.integration, "agent-b", "agent-b");
  assert.equal(side.result, "stopped");
  assert.equal(side.reason, "unexpected-branch");
  assert.equal(await revParse(other.integration, "HEAD"), sideHead);
  assert.notEqual(sideHead, remoteAhead);

  const lockHead = await revParse(locked.integration, "HEAD");
  writeFileSync(await indexLockPath(locked.integration), "");
  const lockResult = await refresh(
    locked.integration,
    "coordinator",
    "coordinator",
  );
  assert.equal(lockResult.result, "deferred");
  assert.equal(lockResult.reason, "ongoing-operation");
  assert.equal(await revParse(locked.integration, "HEAD"), lockHead);
  assert.equal(lockResult.status, null);
});

test("a busy checkout accepts a remote publication and a later refresh fast-forwards to current remote history", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const before = await captureCheckout(integration);
  await pushCandidate(execution, candidateSha);
  await assertRemoteCandidate(origin, candidateSha);
  const inspected = await captureCheckout(integration);
  assertCheckoutUnchanged(before, inspected);
  assert.equal(maintenanceFromInspection(inspected, candidateSha), "deferred");

  const held = await refresh(integration, "agent-a", "agent-b");
  assert.equal(held.result, "deferred");
  assert.equal(held.reason, "another-writer");
  assert.equal(held.head, trunkSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  await assertRemoteCandidate(origin, candidateSha);

  const laterSha = await advanceOriginFromAnotherWriter(origin);
  assert.notEqual(laterSha, candidateSha);
  assert.equal(
    (await git(origin, "log", "--format=%P", "-1", laterSha)).stdout.trim(),
    candidateSha,
  );

  const released = await refresh(integration, "agent-b", "agent-b");
  assert.equal(released.result, "advanced");
  assert.equal(released.head, laterSha);
  assert.equal(released.remoteSha, laterSha);
  assert.equal(released.status, "");
  assert.equal(await revParse(integration, "HEAD"), laterSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), laterSha);
  await assertRemoteCandidate(origin, laterSha);
});
