import { attemptLink } from "../ciEvidenceLabelsPage.ts";
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
  const collected = makeMe.aCiScopeHistory
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
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: true,
              provenance: "exact",
            },
          ],
          build: {
            revision: setup.completion,
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
            provenance: "exact",
          },
          readings: [],
          reason: "legacy unit unknown",
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
  const row = scopeHistoryReading(history).rows;
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("legacy unit unknown");
  await expect(row).toContainText("Selected landing");
  await expect(row).not.toContainText(/\d+(?:\.\d+)?\s*(?:ms|s)\b/);
  await expect(history).toContainText("0 measured builds");
  await expect(scopeHistoryReading(history).charts).toHaveCount(0);
  await expect(scopeHistoryUnit(history, "Test cases")).toHaveCount(0);
  await expect(scopeHistoryUnit(history, "Test files")).toHaveCount(0);
  await expect(attemptLink(row, "Run 42 · attempt 1")).toHaveAttribute(
    "href",
    "https://ci.invalid/runs/42",
  );
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
});
