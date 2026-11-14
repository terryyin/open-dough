import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../tests/intentScopeHistoryPage.ts";
// Supplemental UI recovery proof for the locally collected scope history.
// The collection-to-Summary journey owns actual retained evidence; this
// substitute fails only the local history read beside an existing comparison.

import {
  expect,
  test,
  mountComparison,
} from "../tests/support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../tests/support/comparisonScopeFacts.ts";
import {
  expectComparisonScopeRows,
  scopeTable,
} from "../tests/intentScopeProofPage.ts";
import { expectStackedInOrder } from "../tests/partArrangement.ts";
import { entryComparisonRows } from "../tests/support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";

test("a failed local entry history read keeps the selected Done story and comparison and offers its own retry", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  const setup = { completion: facts.work.revision };
  const previous = "1".repeat(40);
  const adapterAttemptId = "opaque-attempt+#";
  const collected = makeMe.aScopeHistoryGlance
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          key: `adapter/${JSON.stringify(["run-a", adapterAttemptId, previous])}`,
          kind: "point",
          date: "2026-11-05T10:00:00Z",
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
          date: "2026-11-06T10:00:00Z",
          selected: true,
          landings: [{ selected: true, provenance: "exact" }],
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 0,
              segment: "case/1",
            },
          ],
        },
      ],
    })
    .please();
  let reads = 0;
  let available = false;
  let releaseHistory: () => void = () => undefined;
  const heldHistory = new Promise<void>((resolve) => {
    releaseHistory = resolve;
  });
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    async (route) => {
      reads += 1;
      if (available) await heldHistory;
      await route.fulfill(
        available
          ? { json: collected }
          : { status: 503, json: { error: "Local history unavailable" } },
      );
    },
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await mountComparison(page, comparisonServer, {
    ...facts,
    doneEndpoint: { revision: setup.completion, at: "2026-11-09T00:00:00Z" },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const history = scopeHistory(summary);
  await expect(scopeHistoryReading(history).failure).toContainText(
    "Local history unavailable",
  );
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  expect(reads).toBe(1);
  available = true;
  try {
    await scopeHistoryReading(history).retry.click();
    await expect.poll(() => reads).toBe(2);
    await expect(history).toContainText(
      "Reading collected test execution times…",
    );
    await expect(scopeHistoryReading(history).failure).toHaveCount(0);
    await expectComparisonScopeRows(
      summary,
      "dashboard/tests",
      entryComparisonRows,
    );
  } finally {
    releaseHistory();
  }
  await expect(scopeHistoryReading(history).failure).toHaveCount(0);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  // The history reads above the comparison it leaves intact.
  const chart = scopeHistoryChart(history, "test cases");
  await expect(chart.readout).toHaveText("Nov 6 · Selected landing · 0 ms");
  await expect(chart.mark("Nov 5 · 1.2 s")).toHaveCount(1);
  await expect(chart.marks).toHaveCount(2);
  await expectStackedInOrder([history, scopeTable(summary, "dashboard/tests")]);
  await expectNoSidewaysScrollIn(page, history);
});
