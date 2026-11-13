// Which done story cards in Recently done offer their review state, and how:
// the action is offered from the identity the done catalog names, so a card
// whose record could not be read, or is still being read, offers Mark as
// reviewed too and keeps Reviewed once its facts appear; on coarse input both
// actions offer the shared control height. Keeping the state:
// ./recently-done-review-state.spec.ts.

import { noConnection } from "../originAnswers.ts";
import {
  cancelUnreview,
  confirmUnreview,
  doneCard,
  expectReviewed,
  markAsReviewed,
  openRecentlyDone,
  publishDoneStories,
  recordPathOf,
  storyA,
  storyB,
  storyC,
  reviewedButton,
  unreviewQuestion,
} from "../recentlyDoneReviewState.ts";
import { expect, test } from "../support/preparationPage.ts";

test("a card whose record could not be read offers Mark as reviewed", async ({
  page,
  origin,
}) => {
  const published = await publishDoneStories(page, origin);
  published.answerWith(recordPathOf(storyC), noConnection);
  await openRecentlyDone(page);
  const failed = doneCard(page, storyC.identity);
  await expect(failed).toContainText("This done story could not be read.");
  await expectReviewed(failed, false);
});

test("a card whose record is still being read offers Mark as reviewed and keeps Reviewed once its facts appear", async ({
  page,
  origin,
}) => {
  const published = await publishDoneStories(page, origin);
  const release = published.hold(recordPathOf(storyB));
  await openRecentlyDone(page);
  const held = doneCard(page, storyB.identity);
  await expect(held).toContainText("Reading done story…");
  await markAsReviewed(held).click();
  await expectReviewed(held, true);
  await expect(held).toContainText("Reading done story…");
  release();
  const read = doneCard(page, storyB.title);
  await expect(read).toContainText(storyB.identity);
  await expectReviewed(read, true);
});

test.describe("on coarse input", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("Review actions and both confirmation choices offer the shared 44px control height", async ({
    page,
    origin,
  }) => {
    await publishDoneStories(page, origin);
    await openRecentlyDone(page);
    const card = doneCard(page, storyA.title);
    const height = async (control: ReturnType<typeof markAsReviewed>) =>
      (await control.boundingBox())?.height ?? 0;
    await expect(markAsReviewed(card)).toBeVisible();
    expect(await height(markAsReviewed(card))).toBeGreaterThanOrEqual(44);
    await markAsReviewed(card).tap();
    await expectReviewed(card, true);
    expect(await height(reviewedButton(card))).toBeGreaterThanOrEqual(44);
    await reviewedButton(card).tap();
    const question = unreviewQuestion(card, "Unreview this story?");
    await expect(question).toBeVisible();
    expect(await height(confirmUnreview(question))).toBeGreaterThanOrEqual(44);
    expect(await height(cancelUnreview(question))).toBeGreaterThanOrEqual(44);
    await cancelUnreview(question).tap();
    await expectReviewed(card, true);
  });
});
