import { reviewRegion, showReviewDetails } from "./reviewControls.ts";
// The review the server answers for any launch's story, read as the page
// receives it.
import { reviewChanges } from "../storyCardControls.ts";
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

// The review a card's "Review changes" opens, its details readable.
export async function readReview(page: Page, card: Locator) {
  const answer = await reviewAfter(page, reviewChanges(card));
  await showReviewDetails(reviewRegion(page));
  return answer;
}
