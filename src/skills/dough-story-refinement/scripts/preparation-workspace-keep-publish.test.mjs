import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertPublicationAgreement,
  fetchAndAssertOriginMain,
  git,
  lsRemoteSha,
  revParse,
} from "../../dough-execute-plan/scripts/trunk-publication-local-main-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  createPreparationFixture,
} from "./preparation-keep-publish-test-fixtures.mjs";

// Slice 3 of .planning/quick/065-prepare-stories-in-owned-worktrees/PLAN.md
// proves preparation-disposition.md's "Decide what happens to the written
// result" / "Keep and publish the retained result" rule: a developer's
// explicit keep instruction commits (if needed), reconciles with current
// origin, integrates locally, and pushes an owned preparation workspace's
// retained record through the existing [publish the candidate] mechanics --
// with no separate approval question and no dropped intervening work from
// another writer. An explicit no-push/leave-unpublished instruction takes the
// same starting point and leaves origin untouched, with the retained result
// still recoverable locally. This reuses the shared low-level Git fixture
// helpers from publish-the-candidate.test.mjs's own fixtures file, and the
// preparation-specific workspace fixture (an "integration" checkout plus a
// separately named, separately branched "preparation" worktree holding only
// a planning-record commit, never an "exec/story" execution branch or a
// Taken commit) shared with preparation-keep-publish-resume.test.mjs's Slice
// 5 proof of the same workspace shape's resume behavior, rather than
// inventing or duplicating either.

test("an explicit keep instruction rebases the retained preparation record onto current origin, integrates it locally, and pushes it -- preserving the other writer's intervening commit", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-workspace-keep-");
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  assert.notEqual(
    disjointSha,
    trunkSha,
    "the other writer's commit must actually advance origin/main",
  );

  // "Keep and publish the retained result" step 1: the retained record is
  // already committed in the owned preparation workspace (see fixture), so
  // no further commit happens here.

  // Step 3, via "Publish the candidate":
  // 1. Fetch the authorized remote for the target branch.
  await git(integration, "fetch", "origin");
  assert.equal(await revParse(integration, "origin/main"), disjointSha);

  // 2 & 3. Reconcile: fetched trunk (disjointSha) is no longer the
  // previously published base (trunkSha) this preparation workspace started
  // from, so rebase only the owned suffix -- the one retained-record commit
  // -- onto it.
  assert.equal(
    (
      await git(preparation, "log", "--format=%P", "-1", preparationSha)
    ).stdout.trim(),
    trunkSha,
    "the retained commit's parent must still be the stale starting revision before rebase",
  );
  await git(
    preparation,
    "rebase",
    "--onto",
    disjointSha,
    trunkSha,
    preparationBranch,
  );
  const rewrittenSha = await revParse(preparation, preparationBranch);

  assert.notEqual(
    rewrittenSha,
    preparationSha,
    "the rebase must replace the pre-rebase retained-record SHA with a new one",
  );
  assert.equal(
    (
      await git(preparation, "log", "--format=%P", "-1", rewrittenSha)
    ).stdout.trim(),
    disjointSha,
    "the rewritten retained-record commit's parent must be the other writer's commit -- not dropped or overwritten",
  );

  // Validate: the rewritten commit still contains exactly the retained
  // seed-draft record and nothing else (no implementation, no unrelated
  // file), matching "validating the candidate ... means reconfirming that
  // the suffix's commits are exactly the retained record the keep
  // instruction named and nothing else".
  const changedFiles = (
    await git(
      preparation,
      "diff-tree",
      "--no-commit-id",
      "--name-only",
      "-r",
      rewrittenSha,
    )
  ).stdout.trim();
  assert.equal(changedFiles, "seed-draft.md");

  // 5. Fast-forward the local target directly to the exact (rewritten)
  // candidate. Local integration main is still at trunkSha, which is an
  // ancestor of both disjointSha and rewrittenSha, so one ff-only merge
  // covers the whole advance plus the rebased retained record.
  assert.equal(await revParse(integration, "main"), trunkSha);
  await git(integration, "merge", "--ff-only", rewrittenSha);
  assert.equal(await revParse(integration, "main"), rewrittenSha);

  // 6. Push that exact candidate -- the first and only push attempt, with no
  // separate approval question asked between the keep decision and this
  // push.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  // Candidate identity confirmed: origin's exact tip is the preparation's
  // rebased commit, on top of the other writer's commit. No execution
  // worktree applies to this caller (per "What keep does not do", keep never
  // establishes an execution identity), so this reuses the shared helper
  // without its optional execution-branch check.
  const originParents = (
    await git(origin, "log", "--format=%P", "-1", rewrittenSha)
  ).stdout.trim();
  assert.equal(
    originParents,
    disjointSha,
    "origin's published commit must still have the other writer's commit as its parent",
  );

  await assertPublicationAgreement(
    { origin, integration },
    rewrittenSha,
    "the integration checkout must be clean after publishing the retained record",
  );
});

test("an explicit no-push instruction leaves origin unchanged and the retained preparation record recoverable, unpublished, in the owned workspace", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-workspace-keep-");
  t.after(cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(origin);

  // The developer gave an explicit instruction to leave this preparation's
  // result unpublished. Per "Decide what happens to the written result",
  // "Keep and publish the retained result" is never entered: no fetch-driven
  // reconcile, rebase, integration-checkout merge, or push happens. The only
  // read below is an ordinary fetch to observe -- not mutate -- origin's
  // state for this assertion.
  await fetchAndAssertOriginMain(integration, disjointSha);

  // Origin still ends at the other writer's commit; the preparation's own
  // retained commit never reached it.
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), disjointSha);
  assert.notEqual(disjointSha, preparationSha);

  // The integration checkout's local main was never merged forward.
  assert.equal(await revParse(integration, "main"), trunkSha);

  // The retained record is still present, uncommitted-nothing-lost, at its
  // original position in the owned preparation workspace -- recoverable, not
  // rebased, not rewritten, not pushed.
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  const status = (await git(preparation, "status", "--porcelain")).stdout;
  assert.equal(
    status,
    "",
    "the preparation workspace holds the retained commit with no further uncommitted mutation",
  );
});
