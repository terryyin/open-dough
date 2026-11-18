// Story review state survives page reload and a real dashboard restart.
// Keyboard Unreview after restart preserves card order, selection and repository bytes. The card-interaction journey remains in
// ../../dashboard/frontend-tests/stories/recently-done-review-state.spec.ts.

import { doneStoryReview } from "../../dashboard/tests/doneStoryReviewPage.ts";
import { expectEntries } from "../../dashboard/tests/recentlyDoneColumn.ts";
import {
  boardReviewRecords,
  keptReviewStates,
  repositoryState,
} from "../../dashboard/tests/recentlyDoneReviewState.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { sidePanelContents } from "../../dashboard/tests/support/sidePanelContents.ts";
import {
  emptyArea,
  expectSelected,
} from "../../dashboard/tests/storyCardSelection.ts";

const titles = boardReviewRecords.doneStories.map(({ title }) => title);

test("review state survives reload and restart, with keyboard Unreview preserving the selected story", async ({
  page,
  dashboard,
  origin,
}) => {
  await boardReviewRecords.publish(page, origin);
  const repository = await repositoryState(origin);
  const review = await doneStoryReview(page).open();
  const a = review.card(boardReviewRecords.storyA.title);
  const b = review.card(boardReviewRecords.storyB.title);
  const c = review.card(boardReviewRecords.storyC.title);
  const count = review.column.getByText("3 entries", { exact: true });
  await a.markAsReviewed.click();
  await a.expectReviewed(true);

  await test.step("after a reload A is still reviewed; marking B then keeps both reviewed", async () => {
    await page.reload();
    await expectEntries(review.column, titles);
    await a.expectReviewed(true);
    await b.expectReviewed(false);
    await expect(a.actions.getByRole("status")).toHaveText("");
    await b.markAsReviewed.click();
    await page.reload();
    await a.expectReviewed(true);
    await b.expectReviewed(true);
  });

  await test.step("after the dashboard restarts the same holds", async () => {
    const port = Number(new URL(dashboard.baseURL).port);
    await dashboard.close();
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      machine: origin.machine,
      github: dashboard.github,
      projectFolders: ["open-dough"],
      port,
    });
    try {
      await page.reload();
      await expectEntries(review.column, titles);
      await a.expectReviewed(true);
      await b.expectReviewed(true);
      await c.expectReviewed(false);

      // Unreview restores Mark as reviewed, with the keyboard on it, C
      // selected again.
      await emptyArea(c.article).click();
      await expectSelected(c.article, true);
      await a.unreview("Unreview this story?", "keyboard");
      await a.expectReviewed(false);
      await expect(a.markAsReviewed).toBeFocused();
      await expect(a.actions.getByRole("status")).toHaveText(
        "Marked as not reviewed.",
      );
      await expectEntries(review.column, titles);
      await expect(count).toBeVisible();
      await expectSelected(c.article, true);
      await expectSelected(a.article, false);
      await expect(sidePanelContents(page)).toHaveCount(0);
      expect(
        Object.keys(keptReviewStates(dashboard)?.["open-dough"] ?? {}),
      ).toEqual([boardReviewRecords.storyB.identity]);

      await page.reload();
      await a.expectReviewed(false);
      await b.expectReviewed(true);
      expect(await repositoryState(origin)).toEqual(repository);
    } finally {
      await restarted.close();
    }
  });
});
