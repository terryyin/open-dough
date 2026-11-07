// Entry and folder Summary CI timing and counted-results comparison for a
// selected done story (../../src/IntentScopeProof.tsx, ../../src/ciScopeComparison.ts):
// baseline, branch and landed precise durations with signed differences,
// each from its own build (Branch measures an extra folder/a.spec.ts test),
// Counts with signed differences (entry 4 → 6 tests (+2) → 5 tests (+1)), each child's Change, added /
// removed / renamed / later-trunk gaps, and drill into a nested folder
// (SEED-245#compare-story-intent-entry-folder-and-file-summaries examples 1,
// 2 timing, 3–4, 6). An owning integration merge that edits an Intent test file
// marks it as a story change (SEED-253 key example 1). Gap, Trunk Mode,
// running Landed and Taken variants live in
// ./intent-summary-story-comparison-gaps.spec.ts. The file summary journey
// is ./intent-summary-story-comparison-file.spec.ts. Without a selected
// story, ./intent-summary-ci-proof*.spec.ts stay the Summary consumers.

import { test } from "../support/preparationPage.ts";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectObservedNotAttributed,
} from "../ciEvidenceLabelsPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  drillComparisonChild,
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import {
  expectScopeRowCues,
  summaryEntryComparisonCues,
  summaryFolderComparisonCues,
} from "../support/expectCiComparisonCues.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
  mergeEditedNestedComparisonRows,
  nestedComparisonRows,
} from "../support/summaryComparisonExpectedRows.ts";

test.setTimeout(240_000);

for (const variant of [undefined, "own-conflict-extra"] as const) {
  const label =
    variant === undefined
      ? "clean merges"
      : "owning merge-resolution edits to a test file";
  test(`a selected done story with ${label}: entry and folder Summaries compare precise baseline, branch and landed times with each child's Change`, async ({
    page,
    origin,
  }) => {
    test.slow();
    // Fixture already deletes the branch and advances trunk (example 6).
    const setup = await publishSummaryComparisonStory(page, origin, variant);
    const { intent } = await selectDoneStoryForSummaryComparison(page);
    const summary = await openSummaryComparison(intent, "dashboard/tests");

    // Baseline, Branch and Landed read as labels, framed as observed builds.
    await expectEvidenceLabels(comparisonLabels(summary, setup.identity), [
      `Baseline No build ${shortSha(setup.baseline)}`,
      `Branch ${shortSha(setup.branchSide)}`,
      `Landed ${shortSha(setup.completion)}`,
      "Observed, not attributed",
    ]);
    await expectObservedNotAttributed(summary);

    await expectComparisonScopeRows(
      summary,
      "dashboard/tests",
      entryComparisonRows,
    );
    if (variant === undefined) {
      await expectScopeRowCues(
        summary,
        "dashboard/tests",
        summaryEntryComparisonCues,
      );
    }
    await drillComparisonChild(
      summary,
      "folder/",
      "dashboard/tests/folder",
      folderComparisonRows,
    );
    if (variant === undefined) {
      await expectScopeRowCues(
        summary,
        "dashboard/tests/folder",
        summaryFolderComparisonCues,
      );
    }
    await drillComparisonChild(
      summary,
      "nested/",
      "dashboard/tests/folder/nested",
      variant === undefined
        ? nestedComparisonRows
        : mergeEditedNestedComparisonRows,
    );
  });
}
