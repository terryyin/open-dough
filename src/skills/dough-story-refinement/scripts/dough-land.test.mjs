// Git mechanics (not guidance-following): Dough Land commits everything in a
// reviewed worktree, publishes it through the shared publisher, refreshes the
// default checkout when eligible, and retires the worktree once the remote
// contains it. Missing context stops before any commit. Native agent evidence
// is not this file.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  landWorktree,
  planReviewedEdits,
} from "./dough-land-test-fixtures.mjs";
import {
  cloneFile,
  createPreparationFixture,
  worktreeCount,
} from "./preparation-publication-test-fixtures.mjs";

test("Dough Land commits every committed and uncommitted edit, publishes over a sibling change, refreshes the clean default checkout, and retires the worktree", async (t) => {
  const { origin, integration, preparation, preparationBranch, cleanup } =
    await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  planReviewedEdits(preparation);
  const siblingSha = await advanceOriginFromAnotherWriter(origin, {
    file: "sibling-story.md",
    body: "SEED-2: sibling story\n",
    message: "another writer's sibling story",
  });
  const worktreesBefore = await worktreeCount(integration);

  const landed = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
    message: "Land reviewed SEED-1 refinement",
  });

  assert.equal(landed.stopped, null);
  assert.equal(landed.commit, "created");
  assert.equal(landed.publication.publication, "accepted");
  const acceptedSha = landed.publication.receipt.sha;
  await assertRemoteCandidate(origin, acceptedSha);
  assert.equal(
    await cloneFile(origin, "seed-draft.md"),
    "SEED-1: refined goal, scope, and key examples\n",
  );
  assert.equal(
    await cloneFile(origin, "plan-draft.md"),
    "PLAN-1: two slices\n",
  );
  assert.equal(
    await cloneFile(origin, "sibling-story.md"),
    "SEED-2: sibling story\n",
  );
  assert.equal(
    (await git(origin, "merge-base", "--is-ancestor", siblingSha, acceptedSha))
      .stdout,
    "",
  );
  assert.equal(
    await messageCount(origin, "refs/heads/main", "Refine SEED-1 draft"),
    1,
  );
  assert.equal(landed.refresh.result, "advanced");
  assert.equal(await revParse(integration, "HEAD"), acceptedSha);
  assert.equal(landed.cleanup.removed, true);
  assert.equal(existsSync(preparation), false);
  assert.equal(await worktreeCount(integration), worktreesBefore - 1);
  await assert.rejects(
    git(
      integration,
      "rev-parse",
      "--verify",
      `refs/heads/${preparationBranch}`,
    ),
  );
});

test("Dough Land reports a deferred refresh when the default checkout holds a pending edit, and still retires the worktree", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  planReviewedEdits(preparation);
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  await advanceOriginFromAnotherWriter(origin);

  const landed = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
  });

  assert.equal(landed.stopped, null);
  assert.equal(landed.publication.publication, "accepted");
  await assertRemoteCandidate(origin, landed.publication.receipt.sha);
  assert.equal(
    await cloneFile(origin, "plan-draft.md"),
    "PLAN-1: two slices\n",
  );
  assert.equal(landed.refresh.result, "deferred");
  assert.equal(landed.refresh.reason, "pending-edit");
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, trunkSha);
  assert.equal(landed.cleanup.removed, true);
  assert.equal(existsSync(preparation), false);
});

test("Dough Land stops before committing when no worktree is in context or the worktree is the default checkout", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  planReviewedEdits(preparation);
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const preparationStatus = (await git(preparation, "status", "--porcelain"))
    .stdout;

  const missing = await landWorktree({
    worktree: null,
    branch: null,
    defaultCheckout: integration,
  });
  const itself = await landWorktree({
    worktree: integration,
    branch: "main",
    defaultCheckout: integration,
  });
  const noTarget = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
    target: null,
  });

  assert.equal(missing.stopped, "missing-worktree");
  assert.equal(itself.stopped, "default-checkout");
  assert.equal(noTarget.stopped, "missing-target");
  for (const result of [missing, itself, noTarget]) {
    assert.equal(result.commit, "none");
    assert.equal(result.refresh, "not-attempted");
    assert.equal(result.cleanup, "not-performed");
  }
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.equal(await revParse(integration, "HEAD"), trunkSha);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(
    (await git(preparation, "status", "--porcelain")).stdout,
    preparationStatus,
  );
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
});

// Preparation's keep validation stops before landing a workspace that holds
// another session's work (guidance, asserted in dough-land-guidance.test.mjs).
// A reused workspace whose content is all reviewed lands, and Dough Land
// leaves it with its owner.
test("Dough Land publishes a reused workspace's reviewed content and leaves the workspace with its owner", async (t) => {
  const { origin, integration, preparation, preparationBranch, cleanup } =
    await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  planReviewedEdits(preparation);
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);

  const landed = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
    sessionCreated: false,
  });

  assert.equal(landed.stopped, null);
  const acceptedSha = landed.publication.receipt.sha;
  await assertRemoteCandidate(origin, acceptedSha);
  assert.equal(
    await cloneFile(origin, "plan-draft.md"),
    "PLAN-1: two slices\n",
  );
  assert.equal(landed.refresh.result, "deferred");
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.equal(landed.cleanup.removed, false);
  assert.match(landed.cleanup.reason, /reused or host-owned/);
  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), acceptedSha);
});
