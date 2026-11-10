// Missing local selected evidence leaves the existing Done comparison readable.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { doneWallReferenceHistory } from "../support/doneWallReferenceHistory.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("uncollected and incomplete selected evidence retain the prior reference, while an evicted Done endpoint explains historical unavailability", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  keepLandedCiHistory(dashboard.home, doneWallReferenceHistory(origin, setup));
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
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible();
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
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
  keepLandedCiHistory(
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
  await expect(
    history
      .getByRole("group", { name: "Prior-build reference evidence" })
      .getByText(/◆ Selected/),
  ).toContainText("Validated CI proof summary is not retained");
  keepLandedCiHistory(
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
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
  expect(github.calls).toHaveLength(before);
});
