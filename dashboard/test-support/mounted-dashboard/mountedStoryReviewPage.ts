// The mounted story review: the Playwright review cues a mounted case uses
// (../support/frontendStoryReviewOpen.ts, ../support/reviewTreeRows.ts and
// ../sidePanelFrame.ts) under the same names, reading the same names
// (../storyReviewNames.ts).
import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { storyReviewNames as n } from "../storyReviewNames.ts";
import { click } from "./mountedActInput.ts";

export const reviewRegion = () => page.getByRole("region", { name: n.region });

// The selected file's diff, named by its kind and full path.
export const fileDiff = (review: Locator, name: string) =>
  review.getByRole("region", { name });

// Opens Review changes on a card with the review's details readable.
export async function openStoryReview(card: Locator) {
  await click(card.getByRole("button", { name: n.cardAction }));
  const review = reviewRegion();
  await expect.element(review).toBeVisible();
  const eye = review
    .getByRole("group", { name: n.toolbar, exact: true })
    .getByRole("button", { name: n.detailsToggle });
  if (eye.element().getAttribute("aria-expanded") !== "true") await click(eye);
  return review;
}

export async function closeSidePanel(panel: Locator) {
  await click(panel.getByRole("button", { name: "Close", exact: true }));
  await expect.element(panel).not.toBeInTheDocument();
}
