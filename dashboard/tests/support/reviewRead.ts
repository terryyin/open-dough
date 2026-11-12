// A story review's reads as a reader waits for them: the snapshot its
// opening, Refresh or reopening reads, a landed run's comparison, and the
// chosen commits' range. Each read says so in the review's feedback from
// the render that asks it until the render that shows its answer, and the
// boundary may take up to its read bound to answer.

import { expect, type Locator, type Page } from "@playwright/test";
import { reviewFeedback } from "./reviewContextLine.ts";
import {
  openStoryReview,
  reviewRegion,
  comparisonChoice,
} from "./storyReviewMark.ts";

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
  await review.getByRole("button", { name: "Refresh", exact: true }).click();
  await expectReviewRead(review);
}
