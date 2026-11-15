// A scope history whose selected landing has no measured build of its own:
// a later trunk build standing in for a selected gap, unverified landing
// order, and a pending selected build. The collection-to-Summary journey owns
// actual retained evidence; landed-ci-history-gaps proves the collected
// metadata. These routes supply one retained history to the mounted
// comparison.
import {
  expectScopeReadout,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../tests/intentScopeHistoryPage.ts";
import { expectComparisonScopeRows } from "../tests/intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";
import { expect, test } from "../tests/support/comparisonMountPage.ts";
import { entryComparisonRows } from "../tests/support/summaryComparisonExpectedRows.ts";
import { openSummaryScopeHistory } from "../tests/support/summaryScopeHistory.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { shortSha } from "../src/baseCiWording.ts";
import { scopeHistoryGlanceOf } from "../server/ciHistoryGlance.ts";
import { scopeHistoryOf } from "../server/ciScopeHistory.ts";

test("a selected proof gap from a later trunk build reads its status and stand-in without counting it as measured", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const later = "d".repeat(40);
  await page.setViewportSize({ width: 390, height: 844 });
  const { completion, history } = await openSummaryScopeHistory(
    page,
    comparisonServer,
    comparisonServices,
    (selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path: "dashboard/tests",
          selectedRevision,
          availability: "retained",
          entries: [
            {
              key: "landing/expired",
              kind: "gap",
              date: "2026-11-07T10:00:00Z",
              selected: true,
              gap: {
                status: "unavailable",
                reason: "Expired CI proof summary",
              },
              readings: [
                {
                  kind: "gap",
                  unit: "case",
                  status: "unavailable",
                  reason: "Expired CI proof summary",
                },
              ],
              landings: [{ selected: true, provenance: "later" }],
            },
          ],
          references: [
            {
              unit: "case",
              reference: {
                endpoint: selectedRevision,
                selected: {
                  key: "landing/expired",
                  date: "2026-11-07T10:00:00Z",
                  reason: "Expired CI proof summary",
                },
                sampleCount: 0,
              },
            },
          ],
        })
        .please(),
  );
  // Its status and the later build standing for the landing, no change.
  await expectScopeReadout(history, {
    selected: `Selected landing ${shortSha(completion)} · No timing · Expired CI proof summary · Later trunk build, includes later changes`,
    average: "Prior-build average · Insufficient history · 0 prior builds used",
  });
  await expect(history).toContainText(
    "No complete test execution times are available for test cases.",
  );
  await expect(scopeHistoryReading(history).charts).toHaveCount(0);
  await expect(history).not.toContainText(shortSha(later));
  await expectNoSidewaysScrollIn(page, history);
});

test("unverified local landing order explains the partial cohort while the selected known measurement remains readable", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const unknownRevision = "e".repeat(40);
  const { summary, history } = await openSummaryScopeHistory(
    page,
    comparisonServer,
    comparisonServices,
    (selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path: "dashboard/tests",
          selectedRevision,
          availability: "order-unavailable",
          entries: [
            {
              key: "run/42/1",
              kind: "point",
              date: "2026-11-08T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "exact" }],
              readings: [
                { kind: "point", unit: "case", ms: 0, segment: "case/1" },
              ],
            },
          ],
        })
        .please(),
  );
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
  comparisonServer,
  comparisonServices,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // The selected landing's build is queued or running, as the server's glance
  // projection of its retained history answers it.
  const receivedAt = "2026-11-06T10:00:00Z";
  const { summary, history } = await openSummaryScopeHistory(
    page,
    comparisonServer,
    comparisonServices,
    (revision) =>
      scopeHistoryGlanceOf(
        scopeHistoryOf(
          makeMe.aLandedCiHistory
            .pendingLanding({
              receipt: "10000000-0000-4000-8000-000000000051",
              revision,
              receivedAt,
              waitsFor: "build",
              runId: 51,
            })
            .please(),
          "dashboard/tests",
          { revision, at: receivedAt },
          [revision],
        ),
      ),
  );
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
