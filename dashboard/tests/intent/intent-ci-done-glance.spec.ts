// A Done story's CI comparison reads its landing against recent builds at a
// glance: the wall-time history between the endpoints and the entry table,
// with the compact readout and the shared chart through the published
// landing, from real retained history through the authenticated read.
import { shortSha } from "../../src/baseCiWording.ts";
import { inspectMark } from "../ciHistoryChartPage.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
import { expectStackedInOrder } from "../partArrangement.ts";
import {
  doneWallTimeHistory,
  expectChangeCue,
  priorBuildReferenceReading,
} from "../priorBuildReferencePage.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { expect, test } from "../support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";

test("a Done landing's CI wall time reads against its recent builds between the endpoints and the entry table", async ({
  page,
  dashboard,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  // Six comparable priors average 8 min 24 s around a failed build and a
  // build that published no proof; later landings follow the selected one.
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, {
      priors: [
        500000,
        "failed",
        502000,
        "missing",
        504000,
        506000,
        508000,
        504000,
      ],
      selectedMs: 484000,
      later: true,
    }),
  );
  const { panel } = await selectDoneStoryForCiComparison(page);
  const comparison = comparisonReading(panel);
  const history = doneWallTimeHistory(panel);
  await expect(history.selected).toHaveText(
    `Selected landing ${shortSha(setup.completion)} · 8 min 4 s`,
  );
  await expect(history.average).toHaveText(
    "Prior-build average · 8 min 24 s · 6 prior builds used",
  );
  await expect(history.change).toHaveText("vs. prior average · −20 s (−4%)");
  await expectChangeCue(page, history.region, "faster");
  await expect(history.status).toHaveCount(0);
  await expect(history.refresh).toBeVisible();
  await expect(comparison.entryTable).toBeVisible();
  await expectStackedInOrder([
    comparison.endpointTable,
    history.region,
    comparison.entryTable,
  ]);
  await expect(comparison.wallTimes.nth(2)).toHaveText("4 min");
  await expect(
    comparison.endpointTable.getByRole("columnheader", {
      name: "CI time without runner waits",
    }),
  ).toBeVisible();

  const { chart } = history;
  // Eight priors and the selected landing; the later landings stay out.
  await expect(chart.marks).toHaveCount(9);
  await expect(chart.selected).toHaveCount(1);
  await expect(chart.average).toHaveCSS("stroke-dasharray", /\d/);
  await expect(chart.averageLabel).toHaveText("Prior-build average 8 min 24 s");
  await expect(chart.failed).toHaveCount(1);
  await expect(chart.unavailable).toHaveCount(1);
  await expect(chart.readout).toHaveText(
    "Nov 9 · Selected landing · 8 min 4 s",
  );
  await inspectMark(chart, "Nov 2 · Failed build", "pointer");
  await inspectMark(
    chart,
    "Nov 4 · No timing · No CI proof summary",
    "pointer",
  );
  await expect(chart.mark("Nov 8 · 1 min 40 s")).toHaveCount(0);

  await expect(priorBuildReferenceReading(panel).evidence).toHaveCount(0);
  for (const removed of [
    "Builds and reference evidence",
    "Median",
    "calibration",
    "retention can change its prior sample",
  ])
    await expect(panel).not.toContainText(removed);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(history.change).toHaveText("vs. prior average · −20 s (−4%)");
  await expectChangeCue(page, history.region, "faster");
});
