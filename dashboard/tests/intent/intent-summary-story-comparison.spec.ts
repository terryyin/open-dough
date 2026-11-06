// Entry and folder Summary CI timing and counted-results comparison for a
// selected done story (../../src/IntentScopeProof.tsx, ../../src/ciScopeComparison.ts):
// baseline, branch and landed precise durations with signed differences,
// Counts with signed differences (entry 4 → 5 +1), change markers, added /
// removed / renamed / later-trunk gaps, and drill into a nested folder
// (SEED-245#compare-story-intent-entry-folder-and-file-summaries examples 1,
// 2 timing, 3–4, 6). Gap, Trunk Mode, running Landed and Taken variants live
// in ./intent-summary-story-comparison-gaps.spec.ts. The file Purpose/Proof
// comparison journey is ./intent-summary-story-comparison-file.spec.ts.
// Without a selected story, ./intent-summary-ci-proof*.spec.ts stay the
// Summary consumers.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributed } from "../../src/storyCiComparisonWording.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  drillComparisonChild,
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
  nestedComparisonRows,
} from "../support/summaryComparisonExpectedRows.ts";

test.setTimeout(240_000);

test("a selected done story's entry and folder Summaries compare precise baseline, branch and landed times with change markers", async ({
  page,
  origin,
}) => {
  test.slow();
  // Fixture already deletes the branch and advances trunk (example 6).
  const setup = await publishSummaryComparisonStory(page, origin);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");

  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    `CI timing comparison for ${setup.identity}`,
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.baseline),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.branchSide),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.completion),
  );
  await expect(summary.locator(".intent-ci-comparison-framing")).toContainText(
    observedNotAttributed,
  );
  await expect
    .soft(summary.locator(".intent-summary-evidence"))
    .not.toContainText("provisional");

  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await drillComparisonChild(
    summary,
    "folder/",
    "dashboard/tests/folder",
    folderComparisonRows,
  );
  await drillComparisonChild(
    summary,
    "nested/",
    "dashboard/tests/folder/nested",
    nestedComparisonRows,
  );
});
