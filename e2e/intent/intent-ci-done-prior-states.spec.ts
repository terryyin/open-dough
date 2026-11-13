import { priorBuildReferenceReading } from "../../dashboard/tests/priorBuildReferencePage.ts";
import { comparisonReading } from "../../dashboard/tests/intentCiComparisonPage.ts";
// Missing local selected evidence leaves the existing Done comparison readable.
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { publishComparedStoryBranch } from "../../dashboard/tests/support/storyCiComparisonDoneFixture.ts";
import { doneWallReferenceHistory } from "../../dashboard/tests/support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../../dashboard/tests/support/landedCiHistory.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/tests/support/selectDoneStoryForCiComparison.ts";

test("uncollected and incomplete selected evidence retain the prior reference, while an evicted Done endpoint explains historical unavailability", async ({
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
  const history = panel.getByRole("region", {
    name: "Done CI wall time reference",
    exact: true,
  });
  await expect(history).toContainText(
    "The selected landing has no matching collected observation",
  );
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect(history).toContainText(
    "Difference unavailable: selected measurement unavailable",
  );
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
  await history
    .getByRole("button", { name: "Refresh history", exact: true })
    .click();
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect(history).toContainText(
    "Difference unavailable: Validated CI proof summary is not retained",
  );
  await expect(priorBuildReferenceReading(history).selected).toContainText(
    "Validated CI proof summary is not retained",
  );
  await keepLandedCiHistory(
    dashboard.home,
    doneWallReferenceHistory(origin, setup, { drop: 6, later: true }),
  );
  await history
    .getByRole("button", { name: "Refresh history", exact: true })
    .click();
  await expect(history).toContainText(
    "The selected landing is outside the retained history. Its historical comparison is unavailable.",
  );
  await expect(history).toContainText("0 prior builds used");
  await expect(history).toContainText("Insufficient comparable history");
  await expect(history).not.toContainText("Prior-build average · 1 min 43 s");
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("4 min");
  expect(github.calls).toHaveLength(before);
});
