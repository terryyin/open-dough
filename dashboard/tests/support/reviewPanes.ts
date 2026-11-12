// A large story's review (./storyReviewWorktree.ts) as the developer meets
// its panes: the file browser and the selected file's diff, each measured by
// where it is scrolled and whether its content overflows it.

import { changedFilesList, fileDiff, listedFile } from "./reviewTreeRows.ts";
import { expect, type Locator, type Page } from "@playwright/test";
import { box } from "../pageLayout.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { largeReviewRevision, longA } from "./largeReviewFiles.ts";
import { fileBrowser, reviewBody } from "./reviewContextLine.ts";
import { openReview } from "./reviewRead.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import { largeWorktree, wideLine } from "./storyReviewWorktree.ts";

// The selected diff's independently scrollable code and rendered lines.
export const codePane = (diff: Locator) => diff.locator(".story-review-code");

export const diffLines = (
  scope: Locator,
  options: { hasText?: string | RegExp } = {},
) => scope.locator("li.story-review-line", options);

export const diffHeading = (
  diff: Locator,
  options: { level?: number; name?: string | RegExp; exact?: boolean } = {},
) => diff.getByRole("heading", options);

export const scrollTopOf = (pane: Locator) =>
  pane.evaluate((element) => element.scrollTop);

export const scrollLeftOf = (pane: Locator) =>
  pane.evaluate((element) => element.scrollLeft);
export const pageFits = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

// Scrolls a pane down to `to` px, or as far as it goes, and says where it is.
export const scrollPane = (pane: Locator, to: number) =>
  pane.evaluate((element, top) => {
    element.scrollTo(0, top);
    return element.scrollTop;
  }, to);

export const overflows = (pane: Locator) =>
  pane.evaluate((element) => ({
    down: element.scrollHeight > element.clientHeight,
    sideways: element.scrollWidth > element.clientWidth,
  }));

// Whether a row lies wholly within its pane's visible box, inside its
// borders.
export async function shownInPane(pane: Locator, row: Locator) {
  const shown = await pane.evaluate((element) => {
    const top = element.getBoundingClientRect().top + element.clientTop;
    return { top, bottom: top + element.clientHeight };
  });
  const placed = await box(row);
  return placed.y >= shown.top && placed.y + placed.height <= shown.bottom;
}

export const boxes = (parts: readonly Locator[]) =>
  Promise.all(parts.map((part) => box(part)));

// The large story's review, open on the first long file, selected from the
// end of the browser's list, which the selection leaves scrolled there. Many
// files, a name wider than the browser and long diffs.
export async function openLargeReview(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = largeWorktree(
    origin,
    largeReviewRevision({
      filesPerFolder: { many: 30, more: 30 },
      wideName: `a-file-named-${"at-length-".repeat(6)}.txt`,
      longLines: 200,
      wideLine,
    }),
  );
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const review = await openReview(page, card);
  // The keyboard lands in the review's named content.
  await expect(reviewBody(review)).toBeFocused();
  const browser = fileBrowser(review);
  await expect(changedFilesList(browser, "63 changed files")).toBeVisible();
  const diffOf = (name: string) => fileDiff(review, name);
  const codeOf = (name: string) => codePane(diffOf(name));
  const select = async (name: string) => {
    await listedFile(browser, name).click();
    await expect(codeOf(name)).toBeVisible();
  };
  await scrollPane(browser, 100_000);
  await select(`Added ${longA}`);
  return { review, browser, diffOf, codeOf, select };
}
