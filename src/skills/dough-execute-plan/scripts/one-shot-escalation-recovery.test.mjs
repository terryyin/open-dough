// An interrupted escalation keeps the grown attempt's edits under its carried
// ref and resumes through the startup command's ordinary
// `--starting-revision/--candidate-sha` recovery: the claim is published or
// confirmed once and the edits are restored exactly once. Driven through the
// real startup CLI against a local bare remote.
import assert from "node:assert/strict";
import { test } from "node:test";
import { lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { createQueuedTrunk } from "./workspace-publication-fixtures.mjs";
import {
  interruptFirstPush,
  resumeArgs,
} from "./workspace-publication-startup-test-fixtures.mjs";
import {
  assertCleanAt,
  assertOneClaim,
  attemptOverClaim,
  carriedRef,
  carriedSha,
  draftUnlistedStory,
  escalate,
  growAttempt,
  killAfterPush,
  startUnlistedOneShot,
  unlisted,
  workspaceBytes,
} from "./one-shot-escalation-test-fixtures.mjs";

// A one-shot workspace with a grown attempt and its drafted story; returns
// the attempt's bytes.
async function grownAttempt(trunk) {
  const { workspace } = await startUnlistedOneShot(trunk);
  growAttempt(workspace);
  draftUnlistedStory(trunk);
  return { workspace, attempt: workspaceBytes(workspace) };
}

// Resumes the escalation and asserts the one claim at remote trunk's tip and
// the attempt restored over it once, with the carried ref gone.
async function resumeAndAssertRestored(trunk, workspace, attempt, retained) {
  const resumed = await escalate(trunk, "trunk", "grow", unlisted, {
    extra: resumeArgs(retained),
  });
  const { receipt } = resumed;
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.deepEqual(receipt.carried, { restored: true });
  const sha = receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  await assertOneClaim(trunk, sha, trunk.trunkSha, unlisted.identity);
  assert.equal(await revParse(workspace, "HEAD"), sha);
  const restored = await attemptOverClaim(trunk, attempt, sha);
  assert.deepEqual(workspaceBytes(workspace), restored);
  assert.equal(await carriedSha(workspace, "grow"), undefined);

  // Running the same resume again restores nothing a second time.
  const again = await escalate(trunk, "trunk", "grow", unlisted, {
    extra: resumeArgs(retained),
  });
  assert.equal(again.receipt.status, "resumed", JSON.stringify(again.receipt));
  assert.deepEqual(again.receipt.carried, { restored: false });
  assert.deepEqual(workspaceBytes(workspace), restored);
  return receipt;
}

test("an escalation interrupted before its claim reached trunk resumes and restores the edits once", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { workspace, attempt } = await grownAttempt(trunk);
  await interruptFirstPush(trunk);

  const { receipt } = await escalate(trunk, "trunk", "grow", unlisted);
  assert.equal(receipt.status, "unpublished", JSON.stringify(receipt));
  assert.deepEqual(receipt.carried, {
    ref: carriedRef("grow"),
    restored: false,
  });
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
  // The edits wait under the ref; the workspace holds only the claim.
  await assertCleanAt(workspace, receipt.recovery.candidateSha);
  assert.ok(await carriedSha(workspace, "grow"));

  const resumed = await resumeAndAssertRestored(
    trunk,
    workspace,
    attempt,
    receipt.recovery,
  );
  assert.equal(resumed.status, "published");
});

test("an escalation killed after its claim reached trunk resumes as owned and restores the edits once", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { workspace, attempt } = await grownAttempt(trunk);

  const killed = await escalate(trunk, "trunk", "grow", unlisted, {
    env: killAfterPush(trunk),
  });
  assert.equal(killed.receipt, null);
  const candidateSha = await revParse(workspace, "HEAD");
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    candidateSha,
  );
  await assertCleanAt(workspace, candidateSha);
  assert.ok(await carriedSha(workspace, "grow"));

  const resumed = await resumeAndAssertRestored(trunk, workspace, attempt, {
    startingRevision: trunk.trunkSha,
    candidateSha,
  });
  assert.equal(resumed.status, "resumed");
  assert.equal(resumed.publishedSha, candidateSha);
});
