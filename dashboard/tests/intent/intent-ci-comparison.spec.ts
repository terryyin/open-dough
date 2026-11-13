import { comparisonReading } from "../intentCiComparisonPage.ts";
// Real GitHub acquisition reaches the named, historical comparison and entry rows.
// Fast presentation rules live in ./intent-ci-comparison-mounted-*.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributedInFull } from "../../src/storyCiComparisonWording.ts";
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

for (const variant of [undefined] as readonly (
  undefined | "own-conflict-extra" | "non-owning-story-file"
)[]) {
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

    await expect(panel.getByRole("heading")).toHaveText([
      /^Baseline compared with /,
      "CI wall time history",
      "CI entry timing comparison",
    ]);
    await expect(panel).toContainText(observedNotAttributedInFull);
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
    await expect(comparisonReading(panel).overallCounts).toHaveText(
      "2,090 → 2,092 test cases (+2); 5 → 8 test files (+3)",
    );
    // Checks 5 → 8 (+60%) make the overall count cue strong even though
    // tests only move +2 of 2,090.
    await expectCueState(comparisonReading(panel).overallCounts, {
      count: "more-strong",
    });
    if (landedJobsUnavailable) {
      await expect(comparisonReading(panel).overallTiming).toHaveCount(0);
    } else {
      await expect(comparisonReading(panel).overallTiming).toHaveText("+17 s");
      await expectCueState(comparisonReading(panel).overallTiming, {
        duration: "none",
        durationReason: "below threshold",
      });
    }
    await expect(comparisonReading(panel).overallWallTime).toHaveText("+22 s");
    // One signed change per comparable summary metric, each under its label.
    await expect(panel.locator(".intent-ci-comparison-metrics dt")).toHaveText(
      landedJobsUnavailable
        ? ["Counts", "CI wall time"]
        : ["Counts", "CI time without runner waits", "CI wall time"],
    );
    const baselineIdentity = comparisonReading(panel).identities.nth(0);
    const branchIdentity = comparisonReading(panel).identities.nth(1);
    const landedIdentity = comparisonReading(panel).identities.nth(2);
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
    await expect(comparisonReading(panel).wallTimes).toHaveText([
      "4 min 57 s",
      "13 min 27 s",
      "5 min 19 s",
    ]);
    await expect(comparisonReading(panel).timesWithoutWaits).toHaveText([
      "4 min 55 s",
      "4 min 47 s",
      landedJobsUnavailable
        ? "Unavailable. The build's attempt jobs could not be read."
        : "5 min 12 s",
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
