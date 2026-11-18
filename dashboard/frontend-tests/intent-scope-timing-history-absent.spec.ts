// A scope history without measurements explains why without drawing an
// empty chart: no collected history at all, or only builds without timing,
// whose selected status and insufficient average the compact readout still
// shows. The collection-to-Summary journey owns actual retained evidence.
import {
  expectScopeReadout,
  scopeHistoryReading,
} from "../test-support/intentScopeHistoryPage.ts";
import { shortSha } from "../src/baseCiWording.ts";
import { expect, test } from "../test-support/support/comparisonMountPage.ts";
import { openSummaryScopeHistory } from "../test-support/support/summaryScopeHistory.ts";
import { expectComparisonScopeRows } from "../test-support/intentScopeProofPage.ts";
import { entryComparisonRows } from "../test-support/support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

for (const variant of ["empty", "all gaps"] as const) {
  test(`${variant} scope history explains the absence of measurements without drawing an empty chart`, async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const { completion, summary, history } = await openSummaryScopeHistory(
      page,
      comparisonServer,
      comparisonServices,
      (selectedRevision) =>
        makeMe.aScopeHistoryGlance
          .with({
            path: "dashboard/tests",
            selectedRevision,
            availability: variant === "empty" ? "empty" : "retained",
            entries:
              variant === "empty"
                ? []
                : [
                    {
                      key: "run/43/1",
                      kind: "gap",
                      date: "2026-11-06T10:00:00Z",
                      selected: true,
                      landings: [{ selected: true, provenance: "exact" }],
                      readings: [
                        {
                          kind: "gap",
                          unit: "case",
                          status: "unavailable",
                          reason: "Partial: part 2 of 2 missing",
                        },
                      ],
                      gap: {
                        status: "unavailable",
                        reason: "Partial: part 2 of 2 missing",
                      },
                    },
                  ],
            ...(variant === "empty"
              ? {}
              : {
                  references: [
                    {
                      unit: "case" as const,
                      reference: {
                        endpoint: selectedRevision,
                        selected: {
                          key: "run/43/1",
                          date: "2026-11-06T10:00:00Z",
                          reason: "Partial: part 2 of 2 missing",
                        },
                        sampleCount: 0,
                      },
                    },
                  ],
                }),
          })
          .please(),
    );
    const reading = scopeHistoryReading(history);
    await expect(reading.charts).toHaveCount(0);
    if (variant === "empty") {
      await expect(reading.status).toHaveText("No collected history");
      await expect(history).toContainText(
        "No complete test execution times are available for this scope.",
      );
      await expect(reading.readout).toHaveCount(0);
    } else {
      // The selected build's status and an insufficient average, no change.
      await expect(reading.status).toHaveCount(0);
      await expect(history).toContainText(
        "No complete test execution times are available for test cases.",
      );
      await expectScopeReadout(history, {
        selected: `Selected landing ${shortSha(completion)} · No timing · Partial: part 2 of 2 missing`,
        average:
          "Prior-build average · Insufficient history · 0 prior builds used",
      });
    }
    await expect(history.getByRole("list")).toHaveCount(0);
    await expectComparisonScopeRows(
      summary,
      "dashboard/tests",
      entryComparisonRows,
    );
  });
}
