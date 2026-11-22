// A story review's reads as a reader waits for them: the snapshot its
// opening, Refresh or reopening reads, a landed run's comparison, and the
// chosen commits' range. Each read says so in the review's feedback from
// the render that asks it until the render that shows its answer, and the
// boundary may take up to its read bound to answer.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type TakenStoryReview,
} from "../../src/storyReviewContract.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { reviewRegion, showReviewDetails } from "./reviewControls.ts";
import { reviewBody, reviewFeedback } from "./reviewContextLine.ts";
const reading =
  /Reading the story's changes…|Refreshing the review…|Reading the chosen commits' changes…/;

// The review shows the answers to every read it has asked.
export async function expectReviewRead(review: Locator) {
  const feedback = reviewFeedback(review);
  await expect(feedback).toBeAttached();
  await expect(feedback).not.toContainText(reading);
}

// Opens the card's review from its Review changes action, once it has read
// the story's changes, its details readable.
export async function openReview(page: Page, card: Locator) {
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  await expectReviewRead(review);
  return review;
}

// The review as it opened holds the keyboard in its named content; from
// there its details are made readable.
export async function expectOpenedWithKeyboard(review: Locator) {
  await expect(reviewBody(review)).toBeFocused();
  return showReviewDetails(review);
}

// The same opening as the reader first meets it, before any step of theirs.
export async function openReviewAsOpened(page: Page, card: Locator) {
  await (
    await pressReviewChanges(page, card)
  ).snapshot;
  const review = reviewRegion(page);
  await expectReviewRead(review);
  return review;
}

// The snapshot the page's next review read answers.
async function nextSnapshot(page: Page): Promise<TakenStoryReview> {
  const response = await page.waitForResponse(
    (answered) => new URL(answered.url()).pathname === storyReviewEndpoint,
  );
  const review = storyReviewSchema.parse(await response.json());
  if (review.kind !== "snapshot") throw new Error("No snapshot was taken.");
  return review;
}

// Opens the card's review, its details readable, and answers the snapshot
// the review shows.
export async function openStoryReview(page: Page, card: Locator) {
  const { snapshot } = await pressReviewChanges(page, card);
  await showReviewDetails(reviewRegion(page));
  return snapshot;
}

// Presses the card's Review changes, answering the snapshot it reads. A card
// still reading its facts (its agent profile, plan slices) grows as each
// arrives and moves its actions, so a press could land on the action and its
// release elsewhere on the card, which then opens no review; the action is
// pressed once the card reads nothing more.
async function pressReviewChanges(page: Page, card: Locator) {
  await expect(card).not.toContainText(/Reading [^…]*…/);
  const snapshot = nextSnapshot(page);
  await reviewChanges(card).click();
  return { snapshot };
}
