// Intent's CI timing comparison for a selected done story
// (../../src/IntentCiComparison.tsx, ../../server/intentCiComparisonRead.ts):
// baseline, branch and landed wall times against the pre-story build, with
// measured-ancestor labelling, persistence after trunk advance and branch
// delete, SEED-236 earlier landing, and mixed entry rows
// (SEED-244#compare-story-ci-timing-changes examples 1–4, 8 and
// observed-not-attributed / whole-second). Unrecoverable history and its
// recovery live in ./intent-ci-comparison-retry.spec.ts; SEED-248
// fast-forward landings live in
// ./intent-ci-comparison-fast-forward.spec.ts; entry-proof expiry
// and missing durations live in ./intent-ci-comparison-entries.spec.ts;
// Trunk Mode, running, failed and missing builds live in
// ./intent-ci-comparison-gaps.spec.ts. Taken-story provisional journeys live
// in ./intent-ci-comparison-taken.spec.ts; no-selection homepage consumers
// stay in ./intent-ci-status*.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributed } from "../../src/storyCiComparisonWording.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import { comparisonWorkflowPath } from "../support/storyCiComparisonFixture.ts";
import { serveObservedComparisonAttempts } from "../support/storyCiObservedJobs.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import {
  expectCueState,
  expectEntryRowCues,
} from "../support/expectCiComparisonCues.ts";
import {
  comparedStoryEntryCues,
  comparedStoryEntryRows,
  expectCiComparisonEntryRows,
} from "../support/expectCiComparisonEntryRows.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";
import { commitAll, writeAt } from "../support/storyReviewWorktree.ts";

for (const variant of [
  undefined,
  "own-conflict-extra",
  "non-owning-story-file",
] as const) {
  const label =
    variant === undefined
      ? "clean landing"
      : variant === "own-conflict-extra"
        ? "owning merge-resolution edits"
        : "non-owning merge resolution on a story file";
  test(`a selected done Story Branch story with ${label} compares named builds by CI time without runner waits and compares entry rows`, async ({
    page,
    origin,
  }) => {
    const setup = await publishComparedStoryBranch(page, origin, variant);
    // An incompatible workflow at the local tip cannot supply historical
    // dependencies. The selected path exists in each build's own revision.
    writeAt(origin.project, comparisonWorkflowPath, "jobs: {}\n");
    commitAll(origin.project, "change the workflow after the compared builds");
    const landedJobsUnavailable = variant === "non-owning-story-file";
    serveObservedComparisonAttempts(
      setup,
      landedJobsUnavailable ? "jobs-unavailable" : "rerun",
    );
    const { panel } = await selectDoneStoryForCiComparison(page);

    await expect(panel.getByRole("heading")).toHaveText(
      `CI timing changes for ${setup.identity}`,
    );
    await expect(panel).toContainText(observedNotAttributed);
    await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
      "Baseline compared with Landed",
    );
    await expect(
      panel.locator(".intent-ci-comparison-overall-counts"),
    ).toHaveText("2,090 → 2,092 tests (+2); 5 → 8 checks (+3)");
    // Checks 5 → 8 (+60%) make the overall count cue strong even though
    // tests only move +2 of 2,090.
    await expectCueState(
      panel.locator(".intent-ci-comparison-overall-counts"),
      {
        count: "more-strong",
      },
    );
    if (landedJobsUnavailable) {
      await expect(
        panel.locator(".intent-ci-comparison-overall-timing"),
      ).toHaveCount(0);
    } else {
      await expect(
        panel.locator(".intent-ci-comparison-overall-timing"),
      ).toHaveText("4 min 55 s → 5 min 12 s (+17 s, +6%)");
      await expectCueState(
        panel.locator(".intent-ci-comparison-overall-timing"),
        {
          duration: "none",
          durationReason: "below threshold",
        },
      );
    }
    await expect(
      panel.locator(".intent-ci-comparison-overall-wall"),
    ).toHaveText("CI wall time 4 min 59 s → 5 min 19 s (+20 s, +7%)");
    const baselineIdentity = panel
      .locator(".intent-ci-comparison-identity")
      .nth(0);
    const branchIdentity = panel
      .locator(".intent-ci-comparison-identity")
      .nth(1);
    const landedIdentity = panel
      .locator(".intent-ci-comparison-identity")
      .nth(2);
    await expect(baselineIdentity).toContainText("No build at");
    await expect(baselineIdentity).toContainText(
      "the workflow at that revision could not be read",
    );
    await expect(baselineIdentity).toContainText(shortSha(setup.baseline));
    await expectAncestorSourceCue(
      baselineIdentity,
      `ancestor: ${String(setup.laterWithoutBuild)} later revision`,
    );
    await expect(branchIdentity).toContainText(shortSha(setup.branchSide));
    await expectExactSourceCue(branchIdentity);
    await expect(landedIdentity).toContainText(shortSha(setup.completion));
    await expectExactSourceCue(landedIdentity);
    await expectNoRunOrAttemptIds(baselineIdentity);
    await expectNoRunOrAttemptIds(branchIdentity);
    await expectNoRunOrAttemptIds(landedIdentity);
    await expect(
      panel.getByRole("columnheader", { name: "CI wall time" }),
    ).toBeVisible();
    await expect(
      panel.getByRole("columnheader", { name: "CI time without runner waits" }),
    ).toBeVisible();
    await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
      "4 min 59 s",
      "13 min 27 s",
      "5 min 19 s",
    ]);
    await expect(
      panel.locator(".intent-ci-comparison-without-waits"),
    ).toHaveText([
      "4 min 55 s",
      "4 min 47 s −8 s",
      landedJobsUnavailable
        ? "Unavailable. The build's attempt jobs could not be read."
        : "5 min 12 s +17 s",
    ]);
    await expect(panel).not.toContainText("Entry comparison is not yet shown.");
    await expect(panel).not.toContainText(
      "merge resolutions whose story changes cannot be attributed safely",
    );
    await expect(panel).not.toContainText(
      "merge resolutions affecting this story's files whose changes cannot be attributed safely",
    );
    await expectCiComparisonEntryRows(panel, comparedStoryEntryRows);
    await expectEntryRowCues(panel, comparedStoryEntryCues);
  });
}

test("code landed before completion uses the merge branch-side ancestor and the landing merge build (SEED-236)", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const branchBuild = setup.branchAncestor ?? setup.branchSide;
  const landed = setup.landingMerge ?? setup.completion;

  await expect(panel.getByRole("heading")).toHaveText(
    `CI timing changes for ${setup.identity}`,
  );
  const branchIdentity = panel.locator(".intent-ci-comparison-identity").nth(1);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(branchIdentity).toContainText(shortSha(branchBuild));
  await expectAncestorSourceCue(branchIdentity);
  await expect(branchIdentity).not.toContainText(shortSha(setup.completion));
  await expect(landedIdentity).toContainText(shortSha(landed));
  await expectExactSourceCue(landedIdentity);
  // Completion D and trunk-side parent of M must not replace Landed.
  await expect(landedIdentity).not.toContainText(shortSha(setup.completion));
  if (setup.trunkSide !== undefined) {
    await expect(landedIdentity).not.toContainText(shortSha(setup.trunkSide));
  }
  await expectNoRunOrAttemptIds(branchIdentity);
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
  // Completion's later run and later trunk must not replace Branch or Landed.
  await expect(panel).not.toContainText("10 min");
});
