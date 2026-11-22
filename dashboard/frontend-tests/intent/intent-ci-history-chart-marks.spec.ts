// The shared history chart's marks and readouts on a Done story's scope
// timing history: each build's timing or status by shape, and a short readout
// by pointer, keyboard and touch. Project Intent's chart and both appearances
// are in ./intent-project-ci-history-chart-marks.spec.ts. Collection and
// retained projection belong to the integrated journeys; these routes supply
// one retained history to the mounted comparison.
import {
  expectMarksByTab,
  historyChart,
  inspectMark,
} from "../../test-support/historyChartPage.ts";
import { expectNoSidewaysScrollIn } from "../../test-support/pageLayout.ts";
import {
  expect,
  test,
  type ComparisonServices,
} from "../../test-support/support/comparisonMountPage.ts";
import type { FrontendAppServer } from "../../test-support/support/frontendAppServer.ts";
import {
  expectMarkedScopeHistoryDrawn,
  failedReadout,
  readoutsBefore,
  markedScopeHistory,
  unavailableReadout,
  zeroReadout,
} from "../../test-support/support/scopeHistoryMarksScenario.ts";
import { openSummaryScopeHistory } from "../../test-support/support/summaryScopeHistory.ts";
import type { Page } from "@playwright/test";

const selected = "Nov 8 · Selected landing · 1.5 s";

async function openDoneChart(
  page: Page,
  comparisonServer: FrontendAppServer,
  comparisonServices: ComparisonServices,
) {
  const { summary, history } = await openSummaryScopeHistory(
    page,
    comparisonServer,
    comparisonServices,
    markedScopeHistory,
  );
  return {
    history,
    chart: historyChart(
      summary,
      "Test execution time for test cases by build date; selected landing marked",
    ),
  };
}

test("a Done scope history chart marks each build's timing or status and reads it by pointer and keyboard", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const { chart } = await openDoneChart(
    page,
    comparisonServer,
    comparisonServices,
  );
  await expect(chart.readout).toHaveText(selected);
  await expectMarkedScopeHistoryDrawn(chart, selected);
  await inspectMark(chart, failedReadout, "pointer");
  await inspectMark(chart, unavailableReadout, "pointer");
  await inspectMark(chart, zeroReadout, "pointer");
  await page.mouse.move(0, 0);
  await expectMarksByTab(page, chart, [...readoutsBefore, selected]);
});

test.describe("on a touch phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("tapping a Done scope history mark shows its readout", async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const { history, chart } = await openDoneChart(
      page,
      comparisonServer,
      comparisonServices,
    );
    await inspectMark(chart, failedReadout, "touch");
    await inspectMark(chart, unavailableReadout, "touch");
    await inspectMark(chart, selected, "touch");
    await expectNoSidewaysScrollIn(page, history);
  });
});
