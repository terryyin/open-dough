import {
  scopeHistory,
  scopeHistoryChart,
} from "../tests/intentScopeHistoryPage.ts";
// Supplemental presentation of owning-entry segments in the locally collected
// scope history. The collection-to-Summary journey owns actual retained
// evidence; this substitute supplies one retained history.

import {
  expect,
  test,
  mountComparison,
} from "../tests/support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../tests/support/comparisonScopeFacts.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";

test("earlier supported owning-entry segments stay readable beside a selected proof gap and the line does not join incompatible segments", async ({
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
      availability: "retained",
      entries: [
        {
          key: "run/41/1",
          kind: "point",
          date: "2026-11-04T10:00:00Z",
          selected: false,
          landings: [{ selected: false, provenance: "exact" }],
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 1200,
              segment: "case/1",
            },
          ],
        },
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-05T10:00:00Z",
          selected: false,
          landings: [{ selected: false, provenance: "exact" }],
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 2400,
              segment: "case/owner-2",
            },
          ],
        },
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
              reason: "CI proof summary expired",
            },
          ],
          gap: { status: "unavailable", reason: "CI proof summary expired" },
        },
      ],
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await mountComparison(page, comparisonServer, {
    ...facts,
    doneEndpoint: { revision: setup.completion, at: "2026-11-09T00:00:00Z" },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const history = scopeHistory(summary);
  const chart = scopeHistoryChart(history, "test cases");
  await expect(chart.mark("Nov 4 · 1.2 s")).toHaveCount(1);
  await expect(chart.mark("Nov 5 · 2.4 s")).toHaveCount(1);
  await expect(chart.readout).toHaveText(
    "Nov 6 · Selected landing · No timing · CI proof summary expired",
  );
  await expect(chart.unavailable).toHaveCount(1);
  await expect(chart.selected).toHaveCount(0);
  // Two owning-entry segments: two strokes, never joined.
  await expect(chart.line).toHaveAttribute("d", /^M[^ML]+M[^ML]+$/);
  await expect(chart.measured).toHaveCount(2);
  await expectNoSidewaysScrollIn(page, history);
});
