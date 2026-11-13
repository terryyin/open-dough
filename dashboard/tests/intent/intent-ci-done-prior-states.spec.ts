import { shortSha } from "../../src/baseCiWording.ts";
import {
  doneHistoryRead,
  doneWallTimeHistory,
} from "../priorBuildReferencePage.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
// Missing local selected evidence leaves the existing Done comparison readable.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("uncollected and incomplete selected evidence keep the prior average without a change, while an evicted Done endpoint says it is outside retained history", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup),
  );
  const { panel } = await selectDoneStoryForCiComparison(page);
  const history = doneWallTimeHistory(panel);
  const landing = `Selected landing ${shortSha(setup.completion)}`;
  await expect(history.status).toHaveText("Selected landing not collected");
  await expect(history.selected).toHaveText(`${landing} · No timing`);
  await expect(history.average).toHaveText(
    "Prior-build average · 1 min 43 s · 5 prior builds used",
  );
  await expect(history.change).toHaveCount(0);
  await expect(comparisonReading(panel).entryTable).toBeVisible();
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  const before = github.calls.length;
  const selected = makeMe.aLandedCiHistory
    .measuredLanding({
      receipt: "selected",
      revision: setup.completion,
      receivedAt: "2026-11-07T10:00:00Z",
      runId: 103,
      startedAt: "2026-11-07T10:00:00Z",
      completedAt: "2026-11-07T10:04:00Z",
    })
    .please().builds["run/103/1"];
  if (selected === undefined)
    throw new Error("Selected raw measurement is missing");
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, { selected }),
  );
  let refreshed = doneHistoryRead(page);
  await history.refresh.click();
  await refreshed;
  await expect(history.status).toHaveCount(0);
  await expect(history.selected).toHaveText(
    `${landing} · No timing · Validated CI proof summary is not retained`,
  );
  await expect(history.average).toHaveText(
    "Prior-build average · 1 min 43 s · 5 prior builds used",
  );
  await expect(history.change).toHaveCount(0);
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, { drop: 6, later: true }),
  );
  refreshed = doneHistoryRead(page);
  await history.refresh.click();
  await refreshed;
  await expect(history.status).toHaveText("Outside retained history");
  await expect(history.average).toHaveText(
    "Prior-build average · Insufficient history · 0 prior builds used",
  );
  await expect(history.chart.box).toHaveCount(0);
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  expect(github.calls).toHaveLength(before);
});
