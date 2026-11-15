import {
  chooseTimingUnit,
  scopeHistoryChart,
  scopeHistoryReading,
  scopeHistoryUnit,
} from "../tests/intentScopeHistoryPage.ts";
// Supplemental receiving/presentation proof, including legacy evidence of
// unknown unit (its normalization is observed at the store boundary). Actual
// collection and retained unit projection belong to the collector-to-Summary
// journey.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectComparisonScopeRows } from "../tests/intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";
import { expect, test } from "../tests/support/comparisonMountPage.ts";
import { openSummaryScopeHistory } from "../tests/support/summaryScopeHistory.ts";
import { entryComparisonRows } from "../tests/support/summaryComparisonExpectedRows.ts";

test("one collected attempt charts case and file timing one unit at a time, each with its own values and selected gap", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const { summary, history } = await openSummaryScopeHistory(
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
              kind: "point",
              key: "run/41/1",
              date: "2026-11-04T10:00:00Z",
              selected: false,
              landings: [{ selected: false, provenance: "exact" }],
              readings: [
                {
                  kind: "point",
                  unit: "case",
                  ms: 100,
                  segment: "case/1",
                },
                {
                  kind: "point",
                  unit: "file",
                  ms: 1000,
                  segment: "file/1",
                },
              ],
            },
            {
              kind: "point",
              key: "run/42/1",
              date: "2026-11-05T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "exact" }],
              readings: [
                {
                  kind: "point",
                  unit: "case",
                  ms: 0,
                  segment: "case/1",
                },
                {
                  kind: "gap",
                  unit: "file",
                  status: "unavailable",
                  reason: "Part 2 untimed",
                },
              ],
            },
          ],
        })
        .please(),
  );

  // One chart at a time; neither unit is summed into the other.
  const reading = scopeHistoryReading(history);
  await expect(reading.charts).toHaveCount(1);
  await expect(reading.unit("Test cases")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(reading.unit("Test files")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(history.getByRole("combobox")).toHaveCount(0);
  const cases = scopeHistoryChart(
    scopeHistoryUnit(history, "Test cases"),
    "test cases",
  );
  await expect(cases.measured).toHaveCount(1);
  await expect(cases.selected).toHaveCount(1);
  await expect(cases.mark("Nov 4 · 100 ms")).toHaveCount(1);
  await expect(cases.readout).toHaveText("Nov 5 · Selected landing · 0 ms");
  // No prior-build reference was answered, so no compact readout is shown.
  await expect(reading.readout).toHaveCount(0);

  await chooseTimingUnit(history, "Test files", "pointer");
  await expect(reading.charts).toHaveCount(1);
  await expect(scopeHistoryUnit(history, "Test cases")).toHaveCount(0);
  const files = scopeHistoryChart(
    scopeHistoryUnit(history, "Test files"),
    "test files",
  );
  await expect(files.measured).toHaveCount(1);
  await expect(files.selected).toHaveCount(0);
  await expect(files.unavailable).toHaveCount(1);
  await expect(files.mark("Nov 4 · 1.0 s")).toHaveCount(1);
  await expect(files.readout).toHaveText(
    "Nov 5 · Selected landing · No timing · Part 2 untimed",
  );
  await expect(files.mark("Nov 4 · 1.1 s")).toHaveCount(0);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expectNoSidewaysScrollIn(page, history);
});

test("legacy-only collected evidence states its unknown unit without declaring a case or file history", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const { summary, history } = await openSummaryScopeHistory(
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
        .please(),
  );
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
