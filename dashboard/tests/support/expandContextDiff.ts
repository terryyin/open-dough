// Locators for the expand-context story-review file after opening Review
// changes on a card prepared with expandContextWorktree.

import type { Locator, Page } from "@playwright/test";
import { expandContextFile } from "./storyReviewWorktree.ts";

export const expandFirstHunk = "@@ -51,7 +51,7 @@ line 50";
export const expandSecondHunk = "@@ -124,7 +124,7 @@ line 123";
export const expandFirstHunkPrinted = [
  " line 51",
  " line 52",
  " line 53",
  "-line 54",
  "+changed fifty-four",
  " line 55",
  " line 56",
  " line 57",
];

export async function openExpandDiff(page: Page, card: Locator) {
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Story review" });
  const fileName = `Modified ${expandContextFile}`;
  const diff = review.getByRole("region", { name: fileName });
  const gap = (name: string) => diff.getByRole("list", { name });
  return {
    review,
    fileName,
    diff,
    beforeGap: gap("Omitted lines before the next change"),
    betweenGap: gap("Omitted lines between changes"),
    afterGap: gap("Omitted lines after the previous change"),
    hunkLines: (header: string) =>
      diff.getByRole("list", { name: header }).locator("li.story-review-line"),
  };
}
