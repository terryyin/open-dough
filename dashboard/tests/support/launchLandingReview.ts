// The review the server answers for any launch's story, read as the page
// receives it.
import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

// The review the server answers once `control` is activated.
export async function reviewAfter(page: Page, control: Locator) {
  const answer = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await control.click();
  return storyReviewSchema.parse(await (await answer).json());
}

// The review a card's "Review changes" opens.
export const readReview = (page: Page, card: Locator) =>
  reviewAfter(page, card.getByRole("button", { name: "Review changes" }));

// The review an open review's Refresh reads again.
export const refreshReview = (page: Page, review: Locator) =>
  reviewAfter(page, review.getByRole("button", { name: "Refresh" }));
