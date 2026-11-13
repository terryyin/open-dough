import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryUnit,
} from "../intentScopeHistoryPage.ts";
// Supplemental legacy-unit presentation; actual normalization is observed at the store boundary.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { entryComparisonRows } from "../support/summaryComparisonExpectedRows.ts";

test("legacy-only collected evidence states its unknown unit without declaring a case or file history", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const collected = makeMe.aScopeHistoryGlance
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          kind: "gap",
          key: "run/42/1",
          date: "2026-11-05T10:00:00Z",
          selected: true,
          landings: [{ selected: true, provenance: "exact" }],
          readings: [],
          gap: { status: "unavailable", reason: "legacy unit unknown" },
        },
      ],
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  // Its unknown unit as the brief status, with no declared history or timing.
  await expect(scopeHistoryReading(history).status).toHaveText(
    "legacy unit unknown",
  );
  await expect(history).not.toContainText(/\d+(?:\.\d+)?\s*(?:ms|s)\b/);
  await expect(scopeHistoryReading(history).charts).toHaveCount(0);
  await expect(scopeHistoryReading(history).units).toHaveCount(0);
  await expect(scopeHistoryUnit(history, "Test cases")).toHaveCount(0);
  await expect(scopeHistoryUnit(history, "Test files")).toHaveCount(0);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
});
