// On coarse input, a done story card's review actions and both confirmation
// choices offer the shared control height (moves with slice 9's touch proof).
// Offering and keeping the state:
// ./recently-done-review-state-mount.spec.ts.

import type { Locator } from "@playwright/test";
import { doneStoryReview } from "../../test-support/doneStoryReviewPage.ts";
import { boardReviewRecords } from "../../test-support/recentlyDoneReviewState.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendBoardReview } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";

test.describe("on coarse input", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("Review actions and both confirmation choices offer the shared 44px control height", async ({
    page,
    frontendServices,
  }) => {
    await openFrontendBoardReview(page, frontendServices);
    const card = doneStoryReview(page).card(boardReviewRecords.storyA.title);
    const height = async (control: Locator) =>
      (await control.boundingBox())?.height ?? 0;
    await expect(card.markAsReviewed).toBeVisible();
    expect(await height(card.markAsReviewed)).toBeGreaterThanOrEqual(44);
    await card.markAsReviewed.tap();
    await card.expectReviewed(true);
    expect(await height(card.reviewedButton)).toBeGreaterThanOrEqual(44);
    await card.reviewedButton.tap();
    const question = card.unreviewQuestion("Unreview this story?");
    await expect(question.group).toBeVisible();
    expect(await height(question.confirm)).toBeGreaterThanOrEqual(44);
    expect(await height(question.cancel)).toBeGreaterThanOrEqual(44);
    await question.cancel.tap();
    await card.expectReviewed(true);
  });
});
