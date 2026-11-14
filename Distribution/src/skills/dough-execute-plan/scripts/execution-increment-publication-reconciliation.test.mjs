// Git mechanics: reconciled Trunk Mode increment requires applicable proof
// before push; validated reconciled candidates publish the rewritten SHA.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

const trunkTarget = "refs/heads/main";
const recordedStoryBranch = "refs/heads/cursor/story-execution";

// One trunk commit, and a workspace on exec/story one unpublished
// increment.txt commit ahead.
const trunkWithIncrement = makeMe.aRepository
  .withRevision("trunk")
  .withWorkspace("exec/story", { from: "trunk" })
  .withUnpublishedRevision("increment", {
    files: { "increment.txt": "increment\n" },
  });
const trunkWithOneIncrement = trunkWithIncrement.please();

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
    await materializeRepository(trunkWithOneIncrement);
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const before = await captureCheckout(integration);
  const observer = receiptsOf();

  const published = await publishExecutionIncrement({
    workspace: execution,
    ...makeMe.anIncrementPublication
      .with({
        branch: "exec/story",
        previouslyPublishedBase: trunkSha,
        targetRef: trunkTarget,
      })
      .please(),
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
  const {
    origin,
    integration,
    execution,
    trunkSha,
    revisions: { increment: candidateSha },
    candidateSha: multiCommitCandidate,
    cleanup,
  } = await materializeRepository(
    trunkWithIncrement
      .withUnpublishedRevision("second increment", {
        files: { "second-increment.txt": "second increment\n" },
      })
      .please(),
  );
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const before = await captureCheckout(integration);
  const observer = receiptsOf();
  const validated = [];
  const retained = [];

  const published = await publishExecutionIncrement({
    workspace: execution,
    ...makeMe.anIncrementPublication
      .with({
        branch: "exec/story",
        previouslyPublishedBase: trunkSha,
        targetRef: trunkTarget,
      })
      .please(),
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
  const { origin, execution, trunkSha, cleanup } = await materializeRepository(
    trunkWithOneIncrement,
  );
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
      ...makeMe.anIncrementPublication
        .with({
          branch: "exec/story",
          previouslyPublishedBase: trunkSha,
          targetRef: trunkTarget,
        })
        .please(),
      validate: async () => ({ ok: true }),
    }),
    /rebase left the pre-rebase SHA as the candidate/,
  );
  assert.equal(await lsRemoteSha(origin, trunkTarget), advancedTip);
  assert.equal(await revParse(execution, "exec/story"), candidate);
});
