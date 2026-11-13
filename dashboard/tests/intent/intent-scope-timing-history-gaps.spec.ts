import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../intentScopeHistoryPage.ts";
// Supplemental UI recovery proof for the locally collected scope history.
// The collection-to-Summary journey owns actual retained evidence; this
// substitute fails only the local history read beside an existing comparison.

import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import { entryComparisonRows } from "../support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { shortSha } from "../../src/baseCiWording.ts";

test("unverified local landing order explains the partial cohort while the selected known measurement remains readable", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const unknownRevision = "e".repeat(40);
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "order-unavailable",
      entries: [
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-08T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-08T10:00:00Z",
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
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 0,
              entry: "dashboard/tests",
              segment: "case/1",
            },
          ],
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
  // A brief status for the partial cohort; the selected measurement charts.
  await expect(scopeHistoryReading(history).status).toHaveText(
    "Landing order unverified",
  );
  const chart = scopeHistoryChart(history, "test cases");
  await expect(chart.marks).toHaveCount(1);
  await expect(chart.readout).toHaveText("Nov 8 · Selected · 0 ms");
  await expect(history).not.toContainText(shortSha(unknownRevision));
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
});

test("a pending selected build reads its brief status without presenting a measured build or execution time", async ({
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
          key: "pending/51/2",
          kind: "gap",
          date: "2026-11-06T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-06T10:00:00Z",
              selected: true,
            },
          ],
          readings: [],
          reason: "Pending · CI queued or running",
          run: {
            runId: 51,
            runAttempt: 2,
            runUrl: "https://ci.invalid/runs/51",
          },
        },
      ],
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  await expect(scopeHistoryReading(history).status).toHaveText(
    "Pending · CI queued or running",
  );
  await expect(history).not.toContainText(
    /(?:\d[\d.]*\s*(?:ms|s|min)\b|(?:Exact|Measured|Reused|Later trunk) build)/,
  );
  await expect(history).toContainText(
    "No complete test execution times are available for this scope.",
  );
  await expect(scopeHistoryReading(history).charts).toHaveCount(0);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expectNoSidewaysScrollIn(page, history);
});
