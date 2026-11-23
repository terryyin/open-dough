// Session review feedback indicates when its requested comparison has settled.
// The opened panel hands the keyboard to its review body.

import { expect, type Locator } from "@playwright/test";
import { showReviewDetails } from "./reviewControls.ts";
import { reviewBody, reviewFeedback } from "./reviewContextLine.ts";
const reading =
  /Reading the story's changes…|Refreshing the review…|Reading the chosen commits' changes…/;

// The review shows the answers to every read it has asked.
export async function expectReviewRead(review: Locator) {
  const feedback = reviewFeedback(review);
  await expect(feedback).toBeAttached();
  await expect(feedback).not.toContainText(reading);
}

// The review as it opened holds the keyboard in its named content; from
// there its details are made readable.
export async function expectOpenedWithKeyboard(review: Locator) {
  await expect(reviewBody(review)).toBeFocused();
  return showReviewDetails(review);
}
