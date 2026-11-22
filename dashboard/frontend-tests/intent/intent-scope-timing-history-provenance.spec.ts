// How a reused equivalent or later trunk build stands for the landings its
// timing represents. The collection-to-Summary journey owns actual retained
// evidence; this route supplies one retained history to the mounted
// comparison.
import {
  scopeHistoryChart,
  scopeHistoryReading,
} from "../../test-support/intentScopeHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../../test-support/pageLayout.ts";
import {
  expect,
  test,
} from "../../test-support/support/comparisonMountPage.ts";
import { openSummaryScopeHistory } from "../../test-support/support/summaryScopeHistory.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";

test("a later trunk build that supplies the selected timing stays named in the readout and each mark names its build's role", async ({
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
              key: "run/41/1",
              kind: "point",
              date: "2026-11-04T10:00:00Z",
              selected: false,
              // A preparation and a skipped landing share one equivalent build.
              landings: [
                { selected: false, provenance: "equivalent" },
                { selected: false, provenance: "equivalent" },
              ],
              readings: [
                { kind: "point", unit: "case", ms: 1200, segment: "case/1" },
              ],
            },
            {
              key: "run/42/1",
              kind: "point",
              date: "2026-11-08T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "later" }],
              readings: [
                { kind: "point", unit: "case", ms: 2400, segment: "case/1" },
              ],
            },
          ],
          references: [
            {
              unit: "case",
              reference: {
                endpoint: selectedRevision,
                selected: {
                  key: "run/42/1",
                  date: "2026-11-08T10:00:00Z",
                  ms: 2400,
                },
                sampleCount: 1,
              },
            },
          ],
        })
        .please(),
  );
  await expect(scopeHistoryReading(history).selected).toHaveText(
    `Selected landing ${shortSha(completion)} · 2.4 s · Later trunk build, includes later changes`,
  );
  // Each measured build by its date, timing and role.
  const chart = scopeHistoryChart(history, "test cases");
  await expect(chart.drawing.locator("title")).toHaveText([
    "Nov 4 · 1.2 s · test cases · Reused equivalent first-parent build",
    "Nov 8 · 2.4 s · test cases · Later trunk build, includes later changes · Selected landing",
  ]);
  await expect(chart.readout).toHaveText("Nov 8 · Selected landing · 2.4 s");
  await expect(history).not.toContainText(shortSha(later));
  await expectNoSidewaysScrollIn(page, history);
});
