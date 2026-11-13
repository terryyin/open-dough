import { shortSha } from "../../src/baseCiWording.ts";
import {
  doneHistoryRead,
  doneWallTimeHistory,
} from "../priorBuildReferencePage.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
// A selected landing collected without its proof summary leaves the existing
// Done comparison readable through the real retained read of the Done story
// the worker keeps (../support/keptPublishedStory.ts). Each history state's
// readout is in ../../frontend-tests/intent-ci-compact-readout.spec.ts.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, queuedClaudePreviewTest } from "../support/preparationPage.ts";
import { declaredSummaryComparisonEndpointsIn } from "../support/intentSummaryStoryComparisonRepository.ts";
import { serveSummaryComparisonStory } from "../support/intentSummaryStoryComparisonServing.ts";
import { startingFromKeptSummaryComparisonStory } from "../support/keptPublishedStory.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

const test = queuedClaudePreviewTest.extend(
  startingFromKeptSummaryComparisonStory,
);

test("a collected selected landing without its proof summary keeps the prior average without a change beside the readable comparison, read without CI", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await serveSummaryComparisonStory(
    page,
    origin,
    declaredSummaryComparisonEndpointsIn(origin.project),
  );
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup),
  );
  const { panel } = await selectDoneStoryForCiComparison(page);
  const history = doneWallTimeHistory(panel);
  await expect(history.status).toHaveText("Selected landing not collected");
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
  const refreshed = doneHistoryRead(page);
  await history.refresh.click();
  await refreshed;
  await expect(history.status).toHaveCount(0);
  await expect(history.selected).toHaveText(
    `Selected landing ${shortSha(setup.completion)} · No timing · Validated CI proof summary is not retained`,
  );
  await expect(history.average).toHaveText(
    "Prior-build average · 1 min 43 s · 5 prior builds used",
  );
  await expect(history.change).toHaveCount(0);
  await expect(comparisonReading(panel).entryTable).toBeVisible();
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  expect(github.calls).toHaveLength(before);
});
