// A scope history without measurements explains why without drawing an
// empty chart: no collected history at all, or only builds without timing,
// whose selected status and insufficient average the compact readout still
// shows. The collection-to-Summary journey owns actual retained evidence.
import {
  expectScopeReadout,
  scopeHistory,
  scopeHistoryReading,
} from "../tests/intentScopeHistoryPage.ts";
import { shortSha } from "../src/baseCiWording.ts";
import {
  expect,
  test,
  mountComparison,
} from "../tests/support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../tests/support/comparisonScopeFacts.ts";
import { expectComparisonScopeRows } from "../tests/intentScopeProofPage.ts";
import { entryComparisonRows } from "../tests/support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

for (const variant of ["empty", "all gaps"] as const) {
  test(`${variant} scope history explains the absence of measurements without drawing an empty chart`, async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const facts = summaryScopeFacts();
    serveComparison(comparisonServices, facts, facts.entries);
    const setup = { completion: facts.work.revision };
    const collected = makeMe.aScopeHistoryGlance
      .with({
        path: "dashboard/tests",
        selectedRevision: setup.completion,
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
                    endpoint: setup.completion,
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
      .please();
    await page.route(
      /\/__authenticated-read\?.*intent=ci-history.*scope=/,
      (route) => route.fulfill({ json: collected }),
    );
    await mountComparison(page, comparisonServer, {
      ...facts,
      doneEndpoint: { revision: setup.completion, at: "2026-11-09T00:00:00Z" },
    });
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const history = scopeHistory(summary);
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
        selected: `Selected landing ${shortSha(setup.completion)} · No timing · Partial: part 2 of 2 missing`,
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
