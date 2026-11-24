// A done story card's review state when a change could not be saved: the
// machine cannot write its local records, or the dashboard is not reached.
// The card keeps showing the state last saved, with the keyboard on the action
// still shown, and says the review state could not be saved; using the action
// again once saving works saves it and clears that. Keeping the state:
// ../../dashboard/frontend-tests/stories/recently-done-review-state-mount.spec.ts.

import { chmodSync, mkdirSync } from "node:fs";
import path from "node:path";
import { storyReviewStateEndpoint } from "../../dashboard/src/storyReviewState.ts";
import { doneStoryReview } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import {
  boardReviewRecords,
  keptReviewStates,
  reviewStatesFile,
} from "../../dashboard/test-support/recentlyDoneReviewState.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";

const notSaved = "The review state could not be saved.";

test("a change that could not be saved keeps the state last saved and says so until the action is used again and saved", async ({
  page,
  dashboard,
  origin,
}) => {
  await boardReviewRecords.publish(page, origin);
  const review = await doneStoryReview(page).open();
  const a = review.card(boardReviewRecords.storyA.title);
  await a.expectReviewed(false);
  // The directory holding this machine's local records, made read-only so no
  // record in it can be written.
  const records = path.dirname(reviewStatesFile(dashboard));
  mkdirSync(records, { recursive: true });

  await test.step("Mark as reviewed while this machine cannot write its local records: still Mark as reviewed, focused, saying it could not be saved", async () => {
    chmodSync(records, 0o555);
    try {
      await a.markAsReviewed.focus();
      await page.keyboard.press("Enter");
      await expect(a.saveFailure(notSaved)).toBeVisible();
    } finally {
      chmodSync(records, 0o755);
    }
    await a.expectReviewed(false);
    await expect(a.markAsReviewed).toBeFocused();
    expect(keptReviewStates(dashboard)).toBeUndefined();
  });

  await test.step("Mark as reviewed again once writing works: saved, and the message is gone", async () => {
    await page.keyboard.press("Enter");
    await a.expectReviewed(true);
    await expect(a.saveFailure(notSaved)).toHaveCount(0);
    await expect(a.reviewedButton).toBeFocused();
    expect(
      Object.keys(keptReviewStates(dashboard)?.["open-dough"] ?? {}),
    ).toEqual([boardReviewRecords.storyA.identity]);
  });

  await test.step("Unreview while the dashboard cannot be reached: still Reviewed, focused, saying it could not be saved", async () => {
    const endpoint = `**${storyReviewStateEndpoint}?*`;
    await page.route(endpoint, (route) =>
      route.request().method() === "POST" ? route.abort() : route.fallback(),
    );
    await a.unreview("Unreview this story?", "keyboard");
    await expect(a.saveFailure(notSaved)).toBeVisible();
    await a.expectReviewed(true);
    await expect(a.reviewedButton).toBeFocused();
    await page.unroute(endpoint);
  });

  await test.step("Unreview again once the dashboard is reached: not reviewed, and the message is gone", async () => {
    await a.unreview("Unreview this story?", "keyboard");
    await a.expectReviewed(false);
    await expect(a.saveFailure(notSaved)).toHaveCount(0);
    await expect(a.markAsReviewed).toBeFocused();
    expect(keptReviewStates(dashboard)?.["open-dough"]).toEqual({});
  });
});
