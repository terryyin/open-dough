// The shared history chart's marks and readouts on Project Intent's scope
// timing history for the configured trunk, in the whole app: each build's
// timing or status by shape and readout under the observed trunk endpoint's
// words, painted readably in light and dark appearance, with whole duration
// labels at the narrowest supported width. The Done story's chart, its walk
// through every mark by keyboard, and touch are in
// ./intent-ci-history-chart-marks.spec.ts.
import {
  expectFocusedAndIndicated,
  zoomedWindow,
} from "../tests/accessibleReading.ts";
import {
  expectMarksByTab,
  expectMarksPainted,
  historyChart,
  inspectMark,
} from "../tests/ciHistoryChartPage.ts";
import { parts } from "../tests/dashboardPage.ts";
import { scopeHistory } from "../tests/intentScopeHistoryPage.ts";
import { openSummary } from "../tests/intentSummaryCiProofFixtures.ts";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";
import { openUntilRead } from "../tests/pageRequestNotes.ts";
import { expect, test } from "../tests/support/frontendApp.ts";
import {
  expectMarkedScopeHistoryDrawn,
  failedReadout,
  serveMarkedScopeHistory,
} from "../tests/support/scopeHistoryMarksScenario.ts";
import { setColorScheme } from "../tests/systemAppearanceReading.ts";
import type { Page } from "@playwright/test";

const endpoint = "Nov 8 · Endpoint · 1.5 s";

// Project Intent's Summary for the configured trunk with the retained
// history beside an unread live status.
async function openProjectChart(page: Page, revision: string) {
  await serveMarkedScopeHistory(page, revision);
  await page.route(/intent=ci-status/, (route) =>
    route.fulfill({ status: 502, json: { error: "Live proof unavailable" } }),
  );
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const summary = await openSummary(parts(page).intent, "dashboard/tests");
  return {
    history: scopeHistory(summary),
    chart: historyChart(
      summary,
      "Test execution time for test cases by build date; observed trunk endpoint marked",
    ),
  };
}

test("a Project Intent scope history chart marks the observed trunk endpoint's builds and reads them by pointer and keyboard in light and dark", async ({
  page,
  frontendServices,
}) => {
  const { chart } = await openProjectChart(page, frontendServices.revision);
  await expect(chart.readout).toHaveText(endpoint);
  await expectMarkedScopeHistoryDrawn(chart, endpoint);
  for (const scheme of ["light", "dark"] as const) {
    await setColorScheme(page, scheme);
    await expectMarksPainted(page, chart);
  }
  await inspectMark(chart, failedReadout, "pointer");
  await page.mouse.move(0, 0);
  // Tab reaches the endpoint's mark, whose readout and focus show.
  await expectMarksByTab(page, chart, [endpoint]);
  await expectFocusedAndIndicated(page, chart.mark(endpoint));
});

test("at the narrowest supported width the duration axis labels stay whole inside the chart", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize(zoomedWindow);
  const { history, chart } = await openProjectChart(
    page,
    frontendServices.revision,
  );
  await expect(chart.axisLabels.first()).toHaveText("0 ms");
  const drawn = await chart.drawing.boundingBox();
  if (drawn === null) throw new Error("chart is not drawn");
  for (const label of await chart.axisLabels.all()) {
    const box = await label.boundingBox();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(drawn.x);
  }
  await expectNoSidewaysScrollIn(page, history);
});
