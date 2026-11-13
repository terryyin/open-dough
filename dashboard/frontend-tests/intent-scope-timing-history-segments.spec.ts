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
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";

test("earlier supported owning-entry segments stay readable beside a selected proof gap and the line does not join incompatible segments", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  const setup = { completion: facts.work.revision };
  const older = "1".repeat(40);
  const changed = "2".repeat(40);
  const collected = makeMe.aCiScopeHistory
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
          landings: [
            {
              revision: older,
              receivedAt: "2026-11-04T10:00:00Z",
              selected: false,
            },
          ],
          build: {
            revision: older,
            runId: 41,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/41",
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 1200,
              entry: "dashboard/tests",
              segment: "case/1",
            },
          ],
        },
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-05T10:00:00Z",
          selected: false,
          landings: [
            {
              revision: changed,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: false,
            },
          ],
          build: {
            revision: changed,
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 2400,
              entry: "dashboard",
              segment: "case/owner-2",
            },
          ],
        },
        {
          key: "run/43/1",
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
          build: {
            revision: setup.completion,
            runId: 43,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/43",
            provenance: "exact",
          },
          readings: [
            { kind: "gap", unit: "case", reason: "CI proof summary expired" },
          ],
          reason: "CI proof summary expired",
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
    "Nov 6 · Selected · No timing · CI proof summary expired",
  );
  await expect(chart.unavailable).toHaveCount(1);
  await expect(chart.selected).toHaveCount(0);
  // Two owning-entry segments: two strokes, never joined.
  await expect(chart.line).toHaveAttribute("d", /^M[^ML]+M[^ML]+$/);
  await expect(chart.measured).toHaveCount(2);
  await expectNoSidewaysScrollIn(page, history);
});
