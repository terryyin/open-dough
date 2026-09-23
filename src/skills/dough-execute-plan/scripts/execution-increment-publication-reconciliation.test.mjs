// Git mechanics: reconciled Trunk Mode increment requires applicable proof
// before push; validated reconciled candidates publish the rewritten SHA.
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const recordedStoryBranch = "refs/heads/cursor/story-execution";

function receiptsOf() {
  const receipts = [];
  return {
    receipts,
    register(receipt) {
      receipts.push(receipt);
    },
  };
}

async function ancestor(workspace, ancestorSha, descendant) {
  try {
    await git(
      workspace,
      "merge-base",
      "--is-ancestor",
      ancestorSha,
      descendant,
    );
    return true;
  } catch (error) {
    if (error.code === 1) return false;
    throw error;
  }
}

test("Trunk Mode increment returns needs-validation when another writer advances and proof is unconfirmed", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const before = await captureCheckout(integration);
  const observer = receiptsOf();

  const published = await publishExecutionIncrement({
    workspace: execution,
    branch: "exec/story",
    previouslyPublishedBase: trunkSha,
    targetRef: trunkTarget,
    register: observer.register,
  });

  assert.equal(published.ok, false);
  assert.equal(published.publication, "reconciled");
  assert.equal(published.status, "needs-validation");
  assert.equal(published.remoteTip, disjointSha);
  assert.equal(published.preRebaseSha, candidateSha);
  assert.notEqual(published.candidate, candidateSha);
  assert.deepEqual(observer.receipts, []);
  assert.equal(await lsRemoteSha(origin, trunkTarget), disjointSha);
  assert.equal(
    (
      await git(execution, "log", "--format=%P", "-1", published.candidate)
    ).stdout.trim(),
    disjointSha,
  );
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("Trunk Mode increment publishes a validated reconciled candidate and not the pre-rebase SHA", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const before = await captureCheckout(integration);
  const observer = receiptsOf();
  const validated = [];

  const published = await publishExecutionIncrement({
    workspace: execution,
    branch: "exec/story",
    previouslyPublishedBase: trunkSha,
    targetRef: trunkTarget,
    register: observer.register,
    validate: async (candidate, context) => {
      validated.push({ candidate, ...context });
      return { ok: true };
    },
  });

  assert.equal(published.ok, true);
  assert.notEqual(published.receipt.sha, candidateSha);
  assert.equal(published.preRebaseSha, candidateSha);
  assert.equal(validated[0].candidate, published.receipt.sha);
  assert.equal(validated[0].remoteTip, disjointSha);
  assert.deepEqual(published.receipt, {
    sha: published.receipt.sha,
    target: trunkTarget,
  });
  assert.deepEqual(observer.receipts, [published.receipt]);
  assert.equal(
    observer.receipts.some((receipt) => receipt.sha === candidateSha),
    false,
  );
  assert.equal(await lsRemoteSha(origin, trunkTarget), published.receipt.sha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/exec/story"), "");
  assert.equal(await lsRemoteSha(origin, recordedStoryBranch), "");
  assert.equal(
    (
      await git(execution, "log", "--format=%P", "-1", published.receipt.sha)
    ).stdout.trim(),
    disjointSha,
  );
  assert.equal(await ancestor(execution, candidateSha, "origin/main"), false);
  assert.equal(await revParse(execution, "--show-toplevel"), execution);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
