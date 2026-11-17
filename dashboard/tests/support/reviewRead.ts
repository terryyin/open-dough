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
import { closeSidePanel } from "../sidePanelFrame.ts";
import { reviewChanges } from "../storyCardControls.ts";
import {
  comparisonChoice,
  reviewRefresh,
  reviewRegion,
} from "./reviewControls.ts";
import { reviewFeedback } from "./reviewContextLine.ts";
const reading =
  /Reading the story's changes…|Refreshing the review…|Reading the chosen commits' changes…/;

// The review shows the answers to every read it has asked.
export async function expectReviewRead(review: Locator) {
  const feedback = reviewFeedback(review);
  await expect(feedback).toBeAttached();
  await expect(feedback).not.toContainText(reading);
}

// Opens the card's review from its Review changes action, once it has read
// the story's changes.
export async function openReview(page: Page, card: Locator) {
  await openStoryReview(page, card);
  const review = reviewRegion(page);
  await expectReviewRead(review);
  return review;
}

// Shows the review's Commits, once it has read the chosen commits' changes.
export async function showCommits(review: Locator) {
  await comparisonChoice(review, "Commits", { exact: true }).check();
  await expectReviewRead(review);
}

// Refreshes the review from its Refresh action, once it has read the story's
// changes again.
export async function refreshAndRead(review: Locator) {
  await reviewRefresh(review, { exact: true }).click();
  await expectReviewRead(review);
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

// Opens the card's review and answers the snapshot the review shows. A card
// still reading its facts (its agent profile, plan slices) grows as each
// arrives and moves its actions, so a press could land on the action and its
// release elsewhere on the card, which then opens no review; the action is
// pressed once the card reads nothing more.
export async function openStoryReview(page: Page, card: Locator) {
  await expect(card).not.toContainText(/Reading [^…]*…/);
  const snapshot = nextSnapshot(page);
  await reviewChanges(card).click();
  return snapshot;
}

// Refreshes the review and answers the snapshot it then shows.
export async function refreshReview(
  review: Locator,
  options: { exact?: boolean } = {},
) {
  const refreshed = nextSnapshot(review.page());
  await reviewRefresh(review, options).click();
  return refreshed;
}

// Closes the review and opens it again from the card, answering the fresh
// snapshot it shows.
export async function reopenStoryReview(page: Page, card: Locator) {
  await closeSidePanel(reviewRegion(page));
  await expect(reviewRegion(page)).toHaveCount(0);
  return openStoryReview(page, card);
}
