// The touch review journey that keeps its context: the chosen file and both
// panes' reading places through rotation and panel controls, on story A's
// large comparison opened by touch (./storyReviewTouchJourney.ts).
import type { Page } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import {
  control,
  expectCovering,
  resizeUntilArranged,
} from "../sidePanelWidthPage.ts";
import { scrollByTouch } from "../touchGestures.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { expect } from "./preparationPage.ts";
import { reviewFeedback } from "./reviewContextLine.ts";
import { pageFits, scrollTopOf } from "./reviewPanes.ts";
import { expectReviewRead } from "./reviewRead.ts";
import {
  chooseCommitsByTouch,
  leaveUncommittedOutByTouchLabel,
  selectAddedFileByTouch,
} from "./reviewTouchReading.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  chooseAllChangesFileByTouch,
  openReviewByTouch,
} from "./storyReviewTouchJourney.ts";
import { longA, longB } from "./storyReviewWorktree.ts";

type Viewport = { width: number; height: number };

// The chosen file and both panes' reading places, each reached by touch,
// survive rotation, Maximize, hidden files, Next file and Refresh; explicit
// Commits keeps its reading place through rotation too.
export async function keepReviewContextThroughTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  portrait: Viewport,
  landscape: Viewport,
) {
  const opened = await openReviewByTouch(page, dashboard, origin);
  const { action, review, browser, comparison } = opened;
  const diff = await chooseAllChangesFileByTouch(opened);
  const code = diff.locator(".story-review-code");
  await expect(code).toContainText("+first 0");
  await scrollByTouch(page, code, -300);
  await expect.poll(() => scrollTopOf(code)).toBeGreaterThan(0);
  const browserAt = await scrollTopOf(browser);
  await scrollByTouch(page, browser, 100);
  await expect.poll(() => scrollTopOf(browser)).toBeLessThan(browserAt);
  const selected = browser.getByRole("button", { name: `Added ${longA}` });
  const codeAt = await scrollTopOf(code);
  let reads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === storyReviewEndpoint) reads += 1;
  });
  for (const viewport of [landscape, portrait]) {
    await resizeUntilArranged(review, viewport);
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(
      comparison.getByRole("radio", { name: "All changes" }),
    ).toBeChecked();
    expect(await scrollTopOf(code)).toBe(codeAt);
    expect((await box(code)).height).toBeGreaterThanOrEqual(40);
    expect(await pageFits(page)).toBe(true);
    if (viewport.width <= 800) await expectCovering(review);
    else {
      await tapWhereShown(control(review, "Maximize"));
      await expect(control(review, "Restore")).toBeVisible();
      expect(await scrollTopOf(code)).toBe(codeAt);
      await tapWhereShown(control(review, "Restore"));
      await expect(control(review, "Maximize")).toBeVisible();
      expect(await scrollTopOf(code)).toBe(codeAt);
    }
  }
  expect(reads).toBe(0);
  const browserBeforeHide = await scrollTopOf(browser);
  await tapWhereShown(control(review, "Hide files"));
  await expect(browser).toBeHidden();
  expect(await scrollTopOf(code)).toBe(codeAt);
  await tapWhereShown(control(review, "Show files"));
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  expect(await scrollTopOf(browser)).toBe(browserBeforeHide);
  expect(await scrollTopOf(code)).toBe(codeAt);
  await tapWhereShown(control(review, "Next file"));
  const next = review.getByRole("region", { name: `Added ${longB}` });
  await expect(next.locator(".story-review-code")).toContainText("+second 0");
  expect(await scrollTopOf(next.locator(".story-review-code"))).toBe(0);
  await tapWhereShown(control(review, "Refresh"));
  await expectReviewRead(review);
  await expect(reviewFeedback(review)).toHaveText(
    /^Review refreshed: 64 changed files against baseline [0-9a-f]{7}\.$/,
  );
  await expect(
    browser.getByRole("button", { name: `Added ${longB}` }),
  ).toHaveAttribute("aria-pressed", "true");
  // Hidden files: explicit Commits and its reading place survive rotation.
  await chooseCommitsByTouch(review);
  await expect(reviewFeedback(review)).toHaveText(
    "Review refreshed: 64 changed files in the chosen range.",
  );
  await selectAddedFileByTouch(review, longB);
  await tapWhereShown(control(review, "Hide files"));
  const nextCode = next.locator(".story-review-code");
  await scrollByTouch(page, nextCode, -180);
  await expect.poll(() => scrollTopOf(nextCode)).toBeGreaterThan(0);
  const nextAt = await scrollTopOf(nextCode);
  await resizeUntilArranged(review, landscape);
  await expect(
    comparison.getByRole("radio", { name: "Commits", exact: true }),
  ).toBeChecked();
  await expect(next.getByRole("heading")).toHaveText(`Added ${longB}`);
  expect(await scrollTopOf(nextCode)).toBe(nextAt);
  expect((await box(nextCode)).height).toBeGreaterThanOrEqual(44);
  expect(await pageFits(page)).toBe(true);
  await leaveUncommittedOutByTouchLabel(review, browser, portrait);
  await tapWhereShown(control(review, "Close"));
  await expect(review).toHaveCount(0);
  await expect(action).toBeFocused();
  expect(await pageFits(page)).toBe(true);
}
