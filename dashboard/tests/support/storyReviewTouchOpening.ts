// Opening story A's large real comparison by touch and reaching its long
// file, for the touch review journeys in ./storyReviewTouchJourney.ts.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expectSettledPage } from "../dashboardPage.ts";
import { tapWhereShown } from "../pageLayout.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./preparationPage.ts";
import { fileBrowser, reviewBody } from "./reviewContextLine.ts";
import {
  chooseLargeChangesCommitByTouch,
  reachReviewControl,
  selectAddedFileByTouch,
} from "./reviewTouchReading.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import { largeWorktree, longA } from "./storyReviewWorktree.ts";

// Opens story A's large real comparison by touch, its review focused.
export async function openReviewByTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = largeWorktree(origin);
  writeFileSync(path.join(workspace, "touch-uncommitted.txt"), "uncommitted\n");
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await expectSettledPage(page);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.scrollIntoViewIfNeeded();
  await tapWhereShown(action);
  const review = page.getByRole("region", { name: "Story review" });
  await expect(reviewBody(review)).toBeFocused();
  const browser = fileBrowser(review);
  await expect(
    browser.getByRole("list", { name: "64 changed files" }),
  ).toBeVisible();
  const comparison = review.getByRole("radiogroup", { name: "Comparison" });
  const all = comparison.locator("label", { hasText: "All changes" });
  return { action, review, browser, comparison, all };
}

type TouchReview = Awaited<ReturnType<typeof openReviewByTouch>>;

// After the large-changes commit, All changes by touch, then the long file.
export async function chooseAllChangesFileByTouch({
  review,
  browser,
  comparison,
  all,
}: TouchReview) {
  await chooseLargeChangesCommitByTouch(review, browser);
  await reachReviewControl(review, all);
  await tapWhereShown(all);
  await expect(
    comparison.getByRole("radio", { name: "All changes" }),
  ).toBeChecked();
  return selectAddedFileByTouch(review, longA);
}
