// Which done story cards in Recently done offer their review state, and how:
// the action is offered from the identity the done catalog names, so a card
// whose record could not be read, or is still being read, offers Mark as
// reviewed too and keeps Reviewed once its facts appear; on coarse input both
// actions offer the shared control height. Keeping the state:
// ./recently-done-review-state.spec.ts.

import type { Locator } from "@playwright/test";
import { doneStoryReview } from "../../tests/doneStoryReviewPage.ts";
import { boardReviewRecords } from "../../tests/recentlyDoneReviewState.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { openFrontendBoardReview } from "../../tests/support/frontendRecentlyDoneBoardReview.ts";

test("a card whose record could not be read offers Mark as reviewed", async ({
  page,
  frontendServices,
}) => {
  await openFrontendBoardReview(page, frontendServices, {
    prepare: (bodies) => {
      bodies.failNext(boardReviewRecords.recordFile(boardReviewRecords.storyC));
    },
  });
  const failed = doneStoryReview(page).card(boardReviewRecords.storyC.identity);
  await expect(failed.article).toContainText(
    "This done story could not be read.",
  );
  await failed.expectReviewed(false);
});

test("a card whose record is still being read offers Mark as reviewed and keeps Reviewed once its facts appear", async ({
  page,
  frontendServices,
}) => {
  let release: () => void = () => undefined;
  await openFrontendBoardReview(page, frontendServices, {
    prepare: (bodies) => {
      release = bodies.hold(
        boardReviewRecords.recordFile(boardReviewRecords.storyB),
      ).release;
    },
  });
  const held = doneStoryReview(page).card(boardReviewRecords.storyB.identity);
  await expect(held.article).toContainText("Reading done story…");
  await held.markAsReviewed.click();
  await held.expectReviewed(true);
  await expect(held.article).toContainText("Reading done story…");
  release();
  const read = doneStoryReview(page).card(boardReviewRecords.storyB.title);
  await expect(read.article).toContainText(boardReviewRecords.storyB.identity);
  await read.expectReviewed(true);
});

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
