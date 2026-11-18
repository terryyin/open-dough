// Locators for the expand-context story-review file after opening Review
// changes on a card prepared with expandContextWorktree.

import { diffLines } from "./reviewPanes.ts";
import { fileDiff } from "./reviewTreeRows.ts";
import type { Locator, Page } from "@playwright/test";
import { openReview } from "./reviewRead.ts";
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

// Context expansion keeps its direction/count and activation modality at
// the call site, while the gap owns where that control is found.
export const contextExpansion = (gap: Locator, name: RegExp) =>
  gap.getByRole("button", { name });

export const diffHunk = (diff: Locator, header: string) =>
  diff.getByRole("list", { name: header });

export async function openExpandDiff(page: Page, card: Locator) {
  const review = await openReview(page, card);
  const fileName = `Modified ${expandContextFile}`;
  const diff = fileDiff(review, fileName);
  const gap = (name: string) => diff.getByRole("list", { name });
  return {
    review,
    fileName,
    diff,
    beforeGap: gap("Omitted lines before the next change"),
    betweenGap: gap("Omitted lines between changes"),
    afterGap: gap("Omitted lines after the previous change"),
    hunkLines: (header: string) => diffLines(diffHunk(diff, header)),
  };
}
