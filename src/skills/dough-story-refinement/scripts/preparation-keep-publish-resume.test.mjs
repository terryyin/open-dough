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

// Git mechanics (not guidance-following): Slice 5 of
// .planning/quick/065-prepare-stories-in-owned-worktrees/PLAN.md
// proves preparation-disposition.md's "Resume an interrupted
// keep-and-publish" rule: a resumed preparation session classifies its own
// actual state -- never a stored status field -- through the shared
// publish-the-candidate.md#resume-an-interrupted-publication table, the same
// table Slice 2 extracted for execution's claim/increment callers. This
// reuses preparation-workspace-keep-publish.test.mjs's own fixture (an
// "integration" checkout plus a separately branched "preparation" worktree
// holding one retained-record commit) and the low-level Git fixture helpers
// publish-the-candidate.test.mjs already shares, rather than inventing new
// ones or a preparation-specific recovery state machine.

// Counts registered worktrees (the integration checkout itself plus any
// `git worktree add` entries) so a test can assert resuming never adds a
// replacement.
async function worktreeCount(integration) {
  const { stdout } = await git(integration, "worktree", "list", "--porcelain");
  return stdout.split("\n\n").filter((block) => block.trim() !== "").length;
}

test("resuming after interruption between local integration and push, trunk unchanged, completes the single push with no duplicate commit and no replacement worktree", async (t) => {
  const {
    origin,
    integration,
    preparation,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-keep-publish-resume-");
  t.after(cleanup);

  // Before the interruption: "Publish the candidate" steps 1-5 already ran
  // -- fetch/reconcile found trunk unchanged, so the retained-record commit
  // (step 1) was left unchanged, and the integration checkout was
  // fast-forwarded to the candidate (step 5) -- but the session stopped
  // before step 6's push.
  await fetchAndAssertOriginMain(integration, trunkSha);
  await git(integration, "merge", "--ff-only", preparationSha);
  assert.equal(await revParse(integration, "main"), preparationSha);

  const worktreesBeforeResume = await worktreeCount(integration);

  // Resume: classify against
  // publish-the-candidate.md#resume-an-interrupted-publication's table.
  // Local target tip (preparationSha) is the owned candidate; fetched remote
  // trunk does not yet contain it -- "Integrated locally". Continue with:
  // default-checkout access, then candidate push (step 6) directly. Do not
  // rebase or commit again.
  await fetchAndAssertOriginMain(integration, trunkSha);
  assert.equal(
    await revParse(integration, "main"),
    preparationSha,
    "resume must find local main already at the candidate -- no re-merge, no re-commit",
  );

  // The single resumed push.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  await assertPublicationAgreement(
    { origin, integration },
    preparationSha,
    "the integration checkout must be clean after the resumed push",
  );

  assert.equal(
    await revParse(preparation, "prep/seed-1-refinement"),
    preparationSha,
    "no duplicate commit: the preparation branch's own tip is unchanged by resuming",
  );
  assert.equal(
    await worktreeCount(integration),
    worktreesBeforeResume,
    "resuming must not create a replacement worktree",
  );
});

test("resuming after interruption between local integration and push, trunk advanced during the interruption, recovers the rejected push and republishes the rebased candidate once", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-keep-publish-resume-");
  t.after(cleanup);

  // Local integration happened before the interruption, exactly as above.
  await fetchAndAssertOriginMain(integration, trunkSha);
  await git(integration, "merge", "--ff-only", preparationSha);
  assert.equal(await revParse(integration, "main"), preparationSha);

  // While the session was interrupted, another writer advanced origin with a
  // disjoint commit -- not built on top of the preparation's candidate.
  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  assert.notEqual(disjointSha, trunkSha);

  const worktreesBeforeResume = await worktreeCount(integration);

  // Resume: "Integrated locally"'s continue-with is default-checkout access
  // then candidate push (step 6) directly -- not a proactive fetch/rebase.
  // The push genuinely races the disjoint advance and must be rejected.
  await assert.rejects(
    () => git(integration, "push", "origin", "main"),
    /! \[rejected\]\s+main -> main \(fetch first\)/,
    "the resumed push must be genuinely rejected by Git as non-fast-forward",
  );

  // "Recover a rejected push": fetch, then rebase only the owned suffix
  // (previously published base trunkSha..main) onto the fetched trunk.
  await git(integration, "fetch", "origin");
  assert.equal(await revParse(integration, "origin/main"), disjointSha);

  await git(integration, "rebase", "--onto", disjointSha, trunkSha, "main");
  const rewrittenSha = await revParse(integration, "main");

  assert.notEqual(
    rewrittenSha,
    preparationSha,
    "the rebase must produce a genuinely new candidate SHA, not reuse the rejected one",
  );
  assert.equal(
    (
      await git(integration, "log", "--format=%P", "-1", rewrittenSha)
    ).stdout.trim(),
    disjointSha,
    "the rewritten candidate's parent must be the other writer's commit -- candidate identity correctly updated after the required rebase",
  );

  // Move the preparation worktree's own branch to the rewritten candidate,
  // mirroring "Recover a rejected push" step 3's execution-branch move --
  // preparation's own owned branch plays that role for this caller.
  await git(
    preparation,
    "rebase",
    "--onto",
    "main",
    preparationSha,
    preparationBranch,
  );
  assert.equal(await revParse(preparation, preparationBranch), rewrittenSha);

  // Push once -- the second and only successful push attempt.
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  await assertPublicationAgreement(
    { origin, integration },
    rewrittenSha,
    "the integration checkout must be clean after recovery and the resumed push",
  );

  assert.equal(
    await worktreeCount(integration),
    worktreesBeforeResume,
    "recovering a rejected push must not create a replacement worktree",
  );
});

test("resuming after a push whose confirmation was lost recognizes the already-published candidate from fetched remote state alone and pushes nothing further", async (t) => {
  const { origin, integration, trunkSha, preparationSha, cleanup } =
    await createPreparationFixture("preparation-keep-publish-resume-");
  t.after(cleanup);

  // The full publication actually completed -- local integration and one
  // successful push -- but the resuming session's own record of that never
  // arrived (a lost or unknown push response), so it cannot assume success
  // and must reclassify from actual state. This is the only `git push` call
  // in this test.
  await fetchAndAssertOriginMain(integration, trunkSha);
  await git(integration, "merge", "--ff-only", preparationSha);
  await git(integration, "push", "origin", "main");
  const originShaAfterTheOnlyPush = await lsRemoteSha(
    origin,
    "refs/heads/main",
  );
  assert.equal(originShaAfterTheOnlyPush, preparationSha);

  // Resume with no memory of that success: fetch the authorized remote and
  // classify from it alone, per "A lost or unknown push response is not
  // unpublished. If the exact candidate is already an ancestor of fetched
  // remote trunk, treat it as already published."
  await git(integration, "fetch", "origin");
  assert.equal(
    await revParse(integration, "origin/main"),
    preparationSha,
    "resume must observe the candidate already on fetched remote trunk",
  );

  // "Already published" -- continue with: append the SHA to retained
  // published revisions if identity omitted it. Do not push again.
  await assertPublicationAgreement(
    { origin, integration },
    preparationSha,
    "the integration checkout must remain clean; no second push was attempted",
  );
  assert.equal(
    await lsRemoteSha(origin, "refs/heads/main"),
    originShaAfterTheOnlyPush,
    "the remote tip must be exactly what the single earlier push produced -- unchanged by resuming",
  );
});
