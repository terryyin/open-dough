// A large story's review (./storyReviewWorktree.ts) as the developer meets
// its panes: the file browser and the selected file's diff, each measured by
// where it is scrolled and whether its content overflows it.

import { expect, type Locator, type Page } from "@playwright/test";
import { box } from "../pageLayout.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { fileBrowser, reviewBody } from "./reviewContextLine.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import { largeWorktree, longA } from "./storyReviewWorktree.ts";

export const scrollTopOf = (pane: Locator) =>
  pane.evaluate((element) => element.scrollTop);

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

export const boxes = (parts: readonly Locator[]) =>
  Promise.all(parts.map((part) => box(part)));

// The large story's review, open on the first long file, selected from the
// end of the browser's list, which the selection leaves scrolled there.
export async function openLargeReview(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = largeWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  // The keyboard lands in the review's named content.
  await expect(reviewBody(review)).toBeFocused();
  const browser = fileBrowser(review);
  await expect(
    browser.getByRole("list", { name: "63 changed files" }),
  ).toBeVisible();
  const diffOf = (name: string) => review.getByRole("region", { name });
  const codeOf = (name: string) => diffOf(name).locator(".story-review-code");
  const select = async (name: string) => {
    await browser.getByRole("button", { name }).click();
    await expect(codeOf(name)).toBeVisible();
  };
  await scrollPane(browser, 100_000);
  await select(`Added ${longA}`);
  return { review, browser, diffOf, codeOf, select };
}
