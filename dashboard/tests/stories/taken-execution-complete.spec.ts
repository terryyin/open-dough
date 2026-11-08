// A Taken card whose plan, where its progress is published, records the
// execution as complete says "Execution complete, awaiting wrap-up" and how
// long ago the plan's last commit there -- the completion commit -- was made,
// instead of the current slice's clock; the detail shows the recorded advice.
// All slices done without the record is ordinary slice progress, a record
// without advice is the record's gap, and queued work shows no progress at
// all. The fake GitHub only publishes trunk, one story branch, profiles
// spelled by the shared profile renderer, when each plan was last committed,
// and the commit adding each profile; the page clock is paused. The local
// read boundary, the shared readers, and the page decide everything shown.

import { expect, test } from "../dashboardTest.ts";
import {
  adviceless,
  allDone,
  branch,
  branchHead,
  noChange,
  onBranch,
  onTrunk,
  openTakenExecutionComplete,
  queued,
} from "./takenExecutionCompleteFixture.ts";

const complete = "Execution complete, awaiting wrap-up";

test("a Taken card whose plan records its execution as complete shows it awaiting wrap-up and since when, or the record's gap", async ({
  page,
}) => {
  const { taken: takenColumn, backlog: backlogColumn } =
    await openTakenExecutionComplete(page);
  const card = (title: string) =>
    takenColumn.getByRole("article", { name: title });
  const progress = (title: string) =>
    card(title).locator(".story-card-progress");

  await test.step("a Story Branch Mode plan completed 40 min ago on its branch is complete there, not in trunk, with no current slice clock", async () => {
    await expect(progress(onBranch)).toContainText(complete);
    await expect(progress(onBranch)).toContainText("Completed 40 min ago");
    await expect(progress(onBranch)).toContainText(
      "From story branch; not in trunk.",
    );
    await expect(progress(onBranch)).not.toContainText("Current slice started");
    await expect(progress(onBranch)).not.toContainText("0 of 3");
    // The exact branch and revision are the detail's.
    await expect(card(onBranch)).not.toContainText(branch);
    await card(onBranch).getByRole("button", { name: "Inspect story" }).click();
    await expect(
      card(onBranch).getByRole("region", { name: `Detail for ${onBranch}` }),
    ).toContainText(
      `From branch ${branch} at ${branchHead.slice(0, 7)}; not in trunk.`,
    );
  });

  await test.step("a Trunk Mode record of no product change is complete, and the detail shows that advice", async () => {
    await expect(progress(onTrunk)).toContainText(complete);
    await expect(progress(onTrunk)).toContainText("Completed 15 min ago");
    await expect(progress(onTrunk).locator(".progress-source")).toHaveCount(0);
    await card(onTrunk).getByRole("button", { name: "Inspect story" }).click();
    const detail = card(onTrunk).getByRole("region", {
      name: `Detail for ${onTrunk}`,
    });
    await expect(detail.locator(".product-advice")).toHaveText(noChange);
  });

  await test.step("all slices done without the record is slice progress and its clock, not complete", async () => {
    await expect(
      progress(allDone).getByRole("img", {
        name: "2 of 2 slices recorded complete",
      }),
    ).toBeVisible();
    await expect(progress(allDone)).toContainText(
      "Current slice started 20 min ago",
    );
    await expect(progress(allDone)).not.toContainText("Execution complete");
    await expect(progress(allDone)).not.toContainText("Completed");
  });

  await test.step("a record without advice is the record's gap on the card, not complete", async () => {
    await expect(progress(adviceless)).toContainText(
      "This plan’s “## Execution complete” record has no readable “Product advice:” entry.",
    );
    await expect(progress(adviceless)).not.toContainText(complete);
    await expect(progress(adviceless)).not.toContainText("Completed");
  });

  await test.step("a queued entry whose plan records completion shows no complete state", async () => {
    const queuedCard = backlogColumn.getByRole("article", { name: queued });
    await expect(queuedCard).toBeVisible();
    await expect(queuedCard).not.toContainText("Execution complete");
    await expect(queuedCard).not.toContainText("Completed");
  });

  await test.step("page time passing advances the waiting time", async () => {
    await page.clock.fastForward("02:00:00");
    await expect(progress(onBranch)).toContainText("Completed 2 h 40 min ago");
  });
});
