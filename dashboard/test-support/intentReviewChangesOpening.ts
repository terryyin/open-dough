// What opens a story's review in Intent: a Story card's Review changes, or a
// session entry's Review session changes, which opens it at that session.
import { expect, type Locator, type Page } from "@playwright/test";
import { IntentReviewChanges } from "./intentReviewChangesPage.ts";
import { reviewChanges } from "./storyCardControls.ts";
import { reviewAfter } from "./support/launchLandingReview.ts";

// The card offers Review changes once its startup enables the fieldset.
export async function expectReviewChangesOffered(card: Locator) {
  await expect(reviewChanges(card)).toBeEnabled();
}

export async function openIntentReviewChanges(page: Page, card: Locator) {
  const action = reviewChanges(card);
  // The card can display the action before its startup enables the fieldset.
  await expectReviewChangesOffered(card);
  const answer = await reviewAfter(page, action, "keyboard", "settled");
  return new IntentReviewChanges(page, answer);
}

export async function beginIntentReviewChanges(page: Page, card: Locator) {
  await expectReviewChangesOffered(card);
  const answer = await reviewAfter(page, reviewChanges(card), "keyboard");
  return new IntentReviewChanges(page, answer);
}

export const publishedSessionReviewControl = (entry: Locator) =>
  entry.getByRole("button", { name: "Review session changes", exact: true });

// A session entry's Review session changes opens Intent at that session.
export async function openPublishedSessionReviewChanges(
  page: Page,
  entry: Locator,
) {
  const answer = await reviewAfter(
    page,
    publishedSessionReviewControl(entry),
    "keyboard",
    "settled",
    "session",
  );
  return new IntentReviewChanges(page, answer);
}
