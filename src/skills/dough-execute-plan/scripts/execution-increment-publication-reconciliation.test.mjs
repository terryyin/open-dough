// Git mechanics: reconciled Trunk Mode increment requires applicable proof
// before push; validated reconciled candidates publish the rewritten SHA; a
// suffix changing only done records replays through the backlog adapter.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { divergedDoneBranches } from "../../../../tests/support/published-done-branches.mjs";
import {
  assertCatalogDescribes,
  catalog,
  done,
  fileNames,
} from "../../../../tests/support/product-backlog-git-done-catalog-fixture.mjs";
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

test("Trunk Mode retains a multi-commit comparison before publishing its validated reconciled candidate", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  writeFileSync(join(execution, "second-increment.txt"), "second increment\n");
  await git(execution, "add", "second-increment.txt");
  await git(execution, "commit", "-m", "second verified increment");
  const multiCommitCandidate = await revParse(execution, "HEAD");
  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const before = await captureCheckout(integration);
  const observer = receiptsOf();
  const validated = [];
  const retained = [];

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
    beforePush: async (comparison) => {
      retained.push(comparison);
      assert.equal(await lsRemoteSha(origin, trunkTarget), disjointSha);
      assert.deepEqual(
        (
          await git(
            execution,
            "diff",
            "--name-only",
            comparison.suffixBase,
            comparison.candidate,
          )
        ).stdout
          .trim()
          .split("\n"),
        ["increment.txt", "second-increment.txt"],
      );
    },
  });

  assert.equal(published.ok, true);
  assert.notEqual(published.receipt.sha, candidateSha);
  assert.equal(published.preRebaseSha, multiCommitCandidate);
  assert.equal(published.suffixBase, disjointSha);
  assert.deepEqual(retained, [
    {
      attempt: 0,
      candidate: published.receipt.sha,
      suffixBase: disjointSha,
    },
  ]);
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
    await revParse(execution, `${published.receipt.sha}~2`),
    disjointSha,
  );
  assert.notEqual(
    await revParse(execution, `${published.receipt.sha}^`),
    disjointSha,
  );
  assert.equal(await ancestor(execution, candidateSha, "origin/main"), false);
  assert.equal(await revParse(execution, "--show-toplevel"), execution);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("an unpublished candidate already on the advanced target refuses a no-op rebase and pushes nothing", async (t) => {
  const { origin, execution, trunkSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);
  const advancedTip = await advanceOriginFromAnotherWriter(origin);
  // The branch already sits on the advanced tip while the caller still names
  // the older base, so reconciling leaves the candidate unchanged.
  await git(execution, "fetch", "origin");
  await git(execution, "rebase", "origin/main");
  const candidate = await revParse(execution, "exec/story");

  await assert.rejects(
    publishExecutionIncrement({
      workspace: execution,
      branch: "exec/story",
      previouslyPublishedBase: trunkSha,
      targetRef: trunkTarget,
      validate: async () => ({ ok: true }),
    }),
    /rebase left the pre-rebase SHA as the candidate/,
  );
  assert.equal(await lsRemoteSha(origin, trunkTarget), advancedTip);
  assert.equal(await revParse(execution, "exec/story"), candidate);
});

test("Trunk Mode increment replays a suffix changing only done records through the backlog adapter, publishing a current catalog", async (t) => {
  const { origin, execution, publishedBase } = await divergedDoneBranches(t);

  const published = await publishExecutionIncrement({
    workspace: execution,
    branch: "exec/story",
    previouslyPublishedBase: publishedBase,
    targetRef: trunkTarget,
    register: () => {},
    validate: async () => ({ ok: true }),
  });

  assert.equal(published.ok, true, JSON.stringify(published));
  const { sha } = published.receipt;
  assert.equal(await lsRemoteSha(origin, trunkTarget), sha);
  assert.equal(
    (await git(origin, "log", "-1", "--format=%s", sha)).stdout.trim(),
    "Rebuild the done catalog from its record files",
  );
  const publishedCatalog = assertCatalogDescribes(
    (await git(origin, "show", `${sha}:${catalog}`)).stdout,
    (await git(origin, "ls-tree", `${sha}:${done}`)).stdout,
  );
  assert.deepEqual(fileNames(publishedCatalog), [
    "X_X.json",
    "Y_Y.json",
    "Z_Z.json",
  ]);
});
