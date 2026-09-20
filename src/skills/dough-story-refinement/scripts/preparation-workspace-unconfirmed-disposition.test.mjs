import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  fetchAndAssertOriginMain,
  git,
  revParse,
} from "../../dough-execute-plan/scripts/trunk-publication-local-main-test-fixtures.mjs";
import {
  closeOrRetainWorkspace,
  createPreparationFixture,
} from "./preparation-keep-publish-test-fixtures.mjs";

// Slice 6 of .planning/quick/065-prepare-stories-in-owned-worktrees/PLAN.md
// proves preparation-workspace.md's "Close or retain the workspace" rule:
// "Failed or unconfirmed publication never triggers cleanup." This file
// covers that never-without-confirmation half -- whether a keep-and-publish
// was interrupted mid-flight or no keep decision was ever made, the session
// simply ending must never itself fire cleanup. See
// preparation-workspace-close-or-retain.test.mjs for the confirmed-disposition
// half of the same rule. Both reuse closeOrRetainWorkspace and
// createPreparationFixture from preparation-keep-publish-test-fixtures.mjs --
// the same preparation-workspace fixture shape slices 3 and 5 already
// established, rather than inventing a new one.

test("an interrupted keep-and-publish (local integration done, push not completed): cleanup does not run and the workspace is retained and reported", async (t) => {
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

  // "Publish the candidate" steps 1-5 happened, but the session was
  // interrupted before step 6's push -- exactly the state "Resume an
  // interrupted keep-and-publish" and preparation-keep-publish-resume.test.mjs
  // already cover for resuming. This test's own concern is different: the
  // session ends here, without resuming and without reaching step 6's
  // agreement, so cleanup must never fire merely because the session ends.
  await fetchAndAssertOriginMain(integration, trunkSha);
  await git(integration, "merge", "--ff-only", preparationSha);
  assert.equal(await revParse(integration, "main"), preparationSha);

  const result = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: false,
    sessionCreated: true,
  });

  assert.equal(result.removed, false);
  assert.match(result.reason, /no confirmed disposition/);

  // Nothing was cleaned up: the workspace, its branch, and the local
  // integration checkout's own interrupted state are exactly as found, and
  // origin never received the push -- the resume/retry path stays reachable.
  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(await revParse(integration, "main"), preparationSha);
  assert.notEqual(
    (await git(origin, "log", "--format=%H", "-1", "main")).stdout.trim(),
    preparationSha,
    "origin must not have received the interrupted push",
  );
});

test("no keep decision was ever made: cleanup does not run and the retained draft stays exactly as written", async (t) => {
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

  // No explicit keep, discard, or no-publish-and-finished instruction was
  // ever given for this session's retained record -- the "Decide what
  // happens to the written result" default: leave the draft isolated. There
  // is nothing to resume here (unlike the interrupted-push case above); the
  // session simply ends with an undecided draft.
  const result = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: false,
    sessionCreated: true,
  });

  assert.equal(result.removed, false);
  assert.match(result.reason, /no confirmed disposition/);

  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(
    await revParse(integration, "main"),
    trunkSha,
    "the integration checkout was never advanced -- no partial publication of an undecided draft",
  );
  assert.notEqual(
    (await git(origin, "log", "--format=%H", "-1", "main")).stdout.trim(),
    preparationSha,
  );
});
