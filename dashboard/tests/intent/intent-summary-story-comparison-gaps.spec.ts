// Gap and selection variants for Intent Summary CI timing comparison
// (../../src/IntentScopeProof.tsx): baseline without file breakdown, running
// Landed, Trunk Mode Branch N/A, Taken provisional, and selecting another
// story replaces the figures (SEED-245#compare-story-intent-entry-folder-and-file-summaries
// examples 3, 5 and Taken). The happy-path drill lives in
// ./intent-summary-story-comparison.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributed } from "../../src/storyCiComparisonWording.ts";
import { wall } from "../support/storyCiComparisonFixture.ts";
import {
  breakdownProofs,
  noBreakdownBaselineProofs,
  publishSummaryComparisonStory,
  publishSummaryComparisonTrunkStory,
  publishTakenSummaryComparisonStory,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
  selectTakenStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  comparisonScopeColumns,
  expectComparisonScopeRows,
  scopeTable,
} from "../intentScopeProofPage.ts";
import { entryComparisonRows } from "../support/summaryComparisonExpectedRows.ts";
import {
  noBreakdownEntryRows,
  runningLandedEntryRows,
  trunkEntryRows,
} from "../support/summaryComparisonGapExpectedRows.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";
import { expectSelected } from "../storyCardSelection.ts";

test.setTimeout(240_000);

test("a baseline without file breakdown compares the entry and explains folder and file rows", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSummaryComparisonStory(page, origin);
  setup.serveProofs(
    noBreakdownBaselineProofs({
      baseline: setup.baseline,
      branchSide: setup.branchSide,
      completion: setup.completion,
    }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(summary.locator(".intent-ci-comparison-framing")).toContainText(
    observedNotAttributed,
  );
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    noBreakdownEntryRows,
  );
});

test("a running landed build leaves the branch comparison readable in the Summary", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSummaryComparisonStory(page, origin);
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.branchSide]: [
      wall(
        setup.branchSide,
        102,
        "2026-11-05T13:00:00Z",
        "2026-11-05T13:03:20Z",
      ),
    ],
    [setup.completion]: [
      wall(
        setup.completion,
        103,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
        undefined,
        "in_progress",
      ),
    ],
  });
  setup.serveProofs(
    breakdownProofs({
      baseline: setup.baseline,
      branchSide: setup.branchSide,
      completion: setup.completion,
    }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    runningLandedEntryRows,
  );
});

test("a Trunk Mode done story marks Branch not applicable at every Summary scope", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSummaryComparisonTrunkStory(page, origin);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    "not applicable",
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.baseline),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.branchSide),
  );
  await expectComparisonScopeRows(summary, "dashboard/tests", trunkEntryRows);
});

test("a Taken Story Branch story's Summary comparison is labelled provisional", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishTakenSummaryComparisonStory(page, origin);
  const { intent } = await selectTakenStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    "CI timing comparison for Story A (provisional)",
  );
  await expect(summary.locator(".intent-ci-comparison-framing")).toContainText(
    observedNotAttributed,
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.baseline),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.branchTip),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    "has not landed yet",
  );
  await expect(scopeTable(summary, "dashboard/tests")).toBeVisible();
});

test("selecting another story replaces the Summary comparison figures", async ({
  page,
  origin,
}) => {
  test.slow();
  const first = await publishSummaryComparisonStory(page, origin);
  const { intent, card: storyA } =
    await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    first.identity,
  );
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expect(summary.getByRole("table").getByRole("columnheader")).toHaveText(
    [...comparisonScopeColumns],
  );

  // Leave Intent so Board paging can bring Backlog into view, select queued
  // Story B, then return: the Summary must drop Story A's comparison.
  const { development, intentChoice } = parts(page);
  await development.click();
  await showColumn(page, "Backlog");
  const storyB = parts(page).backlog.getByRole("article", {
    name: "Story B",
    exact: true,
  });
  await storyB.getByRole("heading", { level: 3 }).click();
  await expectSelected(storyB, true);
  await expectSelected(storyA, false);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  await openSummary(intent, "dashboard/tests");
  // Queued Story B has no story CI comparison: no framing, no Baseline column,
  // and no evidence line naming the previous story.
  await expect(summary.locator(".intent-ci-comparison-framing")).toHaveCount(0);
  await expect(
    summary.getByRole("columnheader", { name: "Baseline" }),
  ).toHaveCount(0);
  await expect(summary).not.toContainText(first.identity);
});
