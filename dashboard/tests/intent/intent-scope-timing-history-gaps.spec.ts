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
import { scopeHistoryGlanceOf } from "../../server/ciHistoryGlance.ts";
import { scopeHistoryOf } from "../../server/ciScopeHistory.ts";

test("unverified local landing order explains the partial cohort while the selected known measurement remains readable", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const unknownRevision = "e".repeat(40);
  const collected = makeMe.aScopeHistoryGlance
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
          landings: [{ selected: true, provenance: "exact" }],
          readings: [{ kind: "point", unit: "case", ms: 0, segment: "case/1" }],
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
  await expect(chart.readout).toHaveText("Nov 8 · Selected landing · 0 ms");
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
  // The selected landing's build is queued or running, as the server's glance
  // projection of its retained history answers it.
  const receivedAt = "2026-11-06T10:00:00Z";
  const retained = makeMe.aLandedCiHistory
    .pendingLanding({
      receipt: "10000000-0000-4000-8000-000000000051",
      revision: setup.completion,
      receivedAt,
      waitsFor: "build",
      runId: 51,
    })
    .please();
  const collected = scopeHistoryGlanceOf(
    scopeHistoryOf(
      retained,
      "dashboard/tests",
      { revision: setup.completion, at: receivedAt },
      [setup.completion],
    ),
  );
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
