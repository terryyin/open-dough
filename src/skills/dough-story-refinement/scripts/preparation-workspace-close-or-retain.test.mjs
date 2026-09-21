import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertPublicationAgreement,
  fetchAndAssertOriginMain,
  git,
  revParse,
} from "../../dough-execute-plan/scripts/trunk-publication-local-main-test-fixtures.mjs";
import {
  closeOrRetainWorkspace,
  createPreparationFixture,
} from "./preparation-keep-publish-test-fixtures.mjs";

// Git mechanics (not guidance-following): Slice 6 of
// .planning/quick/065-prepare-stories-in-owned-worktrees/PLAN.md
// proves preparation-workspace.md's "Close or retain the workspace" rule:
// cleanup runs only after a *confirmed* disposition, and even then only
// removes a workspace this session itself created; a reused or host-owned
// workspace is retained regardless of how clean it is. This file covers that
// confirmed-disposition half, using a keep-and-publish that reached
// publish-the-candidate.md step 6's own agreement check as the confirmed
// trigger. See preparation-workspace-unconfirmed-disposition.test.mjs for
// the never-without-confirmation half of the same rule. Both reuse
// closeOrRetainWorkspace and createPreparationFixture from
// preparation-keep-publish-test-fixtures.mjs -- the same preparation-workspace
// fixture shape slices 3 and 5 already established, rather than inventing a
// new one.

test("a confirmed keep-and-publish in a session-created workspace: cleanup removes only that workspace and its branch, and nothing else in the fixture", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-close-or-retain-");
  t.after(cleanup);

  // "Keep and publish the retained result": trunk is unchanged since this
  // workspace's recorded starting revision, so no rebase is needed -- fetch,
  // fast-forward, push (Publish the candidate steps 1-2-3-5-6).
  await fetchAndAssertOriginMain(integration, trunkSha);
  await git(integration, "merge", "--ff-only", preparationSha);
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  // Step 6's own agreement check: this is what "Close or retain the
  // workspace" treats as a confirmed keep-and-publish before any cleanup.
  await assertPublicationAgreement(
    { origin, integration },
    preparationSha,
    "the integration checkout must be clean after publishing",
  );
  assert.equal(
    (await git(preparation, "status", "--porcelain")).stdout,
    "",
    "the preparation workspace itself is clean before cleanup is even considered",
  );

  const result = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: true,
  });

  assert.equal(result.removed, true);
  assert.equal(
    existsSync(preparation),
    false,
    "the session-created workspace directory must be removed",
  );
  assert.equal(
    (
      await git(integration, "branch", "--list", preparationBranch)
    ).stdout.trim(),
    "",
    "the session-created branch must be removed",
  );

  // Nothing else in the fixture's repo/origin is disturbed: the published
  // record is still exactly what reached origin, and the integration
  // checkout remains clean and converged.
  await assertPublicationAgreement(
    { origin, integration },
    preparationSha,
    "the integration checkout must remain clean and converged after cleanup",
  );
});

test("a confirmed keep-and-publish in a reused/host-owned workspace: cleanup retains the workspace, and unrelated unfinished work is untouched", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-close-or-retain-");
  t.after(cleanup);

  // Model a reused/host-owned workspace: it already held another,
  // independent, unfinished committed draft belonging to a different
  // session/story before -- and unaffected by -- this session's own keep
  // decision, per "Select or reuse the workspace" and the same "other
  // in-progress work ... that must survive" concept "Discard an identified
  // draft" already establishes.
  writeFileSync(
    join(preparation, "other-story-draft.md"),
    "another session's own unfinished draft\n",
  );
  await git(preparation, "add", "other-story-draft.md");
  await git(
    preparation,
    "commit",
    "-m",
    "another session's own unfinished draft",
  );
  const otherSessionSha = await revParse(preparation, preparationBranch);
  assert.notEqual(otherSessionSha, preparationSha);

  // This session's own keep instruction names only its own retained commit
  // (preparationSha) -- "Keep and publish the retained result" step 3 of
  // "Publish the candidate": validating the candidate means reconfirming the
  // suffix is exactly the retained record named, nothing else. So the
  // integration checkout is fast-forwarded to preparationSha, not to the
  // workspace's current branch tip (which also carries the unrelated,
  // undecided commit).
  await fetchAndAssertOriginMain(integration, trunkSha);
  await git(integration, "merge", "--ff-only", preparationSha);
  await git(integration, "push", "origin", "main");
  await git(integration, "fetch", "origin");

  await assertPublicationAgreement(
    { origin, integration },
    preparationSha,
    "the integration checkout must be clean and published at exactly this session's own retained record",
  );
  // The unrelated commit was never part of the candidate and never reached
  // origin.
  assert.notEqual(
    (await git(origin, "log", "--format=%H", "-1", "main")).stdout.trim(),
    otherSessionSha,
  );

  // Recorded identity from "Select or reuse the workspace": this preparation
  // reused an already-existing host-owned workspace rather than creating one
  // itself, so sessionCreated is false regardless of the workspace's current
  // clean status.
  assert.equal(
    (await git(preparation, "status", "--porcelain")).stdout,
    "",
    "the workspace is clean -- cleanliness alone must not be read as proof of ownership",
  );

  const result = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: false,
  });

  assert.equal(result.removed, false);
  assert.match(result.reason, /reused or host-owned/);
  assert.equal(result.path, preparation);
  assert.equal(result.branch, preparationBranch);

  // The workspace, its branch, and the unrelated unfinished work all remain
  // present and untouched.
  assert.equal(
    existsSync(preparation),
    true,
    "the reused workspace directory must not be removed",
  );
  assert.equal(
    await revParse(preparation, preparationBranch),
    otherSessionSha,
    "the unrelated commit already on the branch is untouched -- not reset, rebased, or dropped",
  );
  assert.equal(
    existsSync(join(preparation, "other-story-draft.md")),
    true,
    "the unrelated session's draft file is still present",
  );
});
