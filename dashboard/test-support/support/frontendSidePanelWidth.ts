// The Taken story's review in the side panel, served by the Frontend
// substitutes (./frontendServiceState.ts, ./frontendStoryReview.ts), for the
// side-panel width checks in ../../frontend-tests/navigation/side-panel-* and
// the file sidebar width checks in
// ../../frontend-tests/review/story-review-files-divider*. Its divider and
// widths are read through ../sidePanelWidthPage.ts and ../filesDividerPage.ts.

import type { Locator, Page } from "@playwright/test";
import { reviewChanges } from "../storyCardControls.ts";
import { reviewRegion, showReviewDetails } from "./reviewControls.ts";
import {
  expect,
  openFrontendTakenBacklog,
  takenStoryCard,
} from "./frontendApp.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { keepTakenReviewLaunch } from "./frontendStoryReviewOpen.ts";
import {
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "./frontendStoryReview.ts";
import { expectSettledPage } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { panelDivider, split, wideWindow } from "../sidePanelWidthPage.ts";

export const widthKey = "open-dough.sidePanel.width";

// The Taken story keeps a story-branch launch, which offers Review changes.
// Returns the review's answers; `snapshot` overrides its default files.
export async function takenStoryWithReview(
  page: Page,
  services: FrontendServiceState,
  snapshot: Parameters<typeof frontendReviewSnapshot>[0] = {},
) {
  keepTakenReviewLaunch(services);
  const answers = await installFrontendStoryReview(
    page,
    frontendReviewSnapshot(snapshot),
  );
  await page.setViewportSize(wideWindow);
  await openFrontendTakenBacklog(page);
  return answers;
}

// Opens the Taken story's review, once the Board has settled.
export async function openReview(page: Page): Promise<Locator> {
  await showColumn(page, "Taken");
  await reviewChanges(takenStoryCard(page)).click();
  const review = reviewRegion(page, { exact: true });
  await expect(review.getByRole("heading", { level: 2 })).toBeVisible();
  return showReviewDetails(review);
}

export async function reloadAndOpenReview(page: Page): Promise<Locator> {
  await page.reload();
  await expectSettledPage(page);
  return openReview(page);
}

export async function expectHalfTheRoom(page: Page, panel: Locator) {
  await expect(panelDivider(page)).toBeVisible();
  const { pageColumn, sidePanel: width } = await split(page, panel);
  expect(width).toBeCloseTo((pageColumn + width) / 2, 0);
  await expect(panelDivider(page)).toHaveAttribute(
    "aria-valuenow",
    String(Math.round((pageColumn + width) / 2)),
  );
}

export const keptWidth = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), widthKey);
