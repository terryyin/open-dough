// The touch review journey that keeps its context: the chosen file and both
// panes' reading places through rotation and panel controls, on story A's
// comparison opened by touch (./storyReviewTouchJourney.ts), which also says
// which viewport owns what no arrangement changes.
import { comparisonChoice } from "./storyReviewMark.ts";
import type { Locator, Page } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import {
  control,
  expectCovering,
  resizeUntilArranged,
} from "../sidePanelWidthPage.ts";
import { scrollByTouch } from "../touchGestures.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { longA, longB } from "./largeReviewFiles.ts";
import { expect } from "./preparationPage.ts";
import { reviewFeedback } from "./reviewContextLine.ts";
import { pageFits, scrollTopOf } from "./reviewPanes.ts";
import { expectReviewRead } from "./reviewRead.ts";
import {
  chooseLargeChangesCommitByTouch,
  leaveUncommittedOutByTouchLabel,
  selectAddedFileByTouch,
} from "./reviewTouchReading.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  openReviewByTouch,
  ownsSharedObservations,
  type TouchReview,
} from "./storyReviewTouchJourney.ts";

type Viewport = { width: number; height: number };
// The chosen file's row, its code pane and the places both panes were moved to.
type ChosenFile = {
  selected: Locator;
  code: Locator;
  codeAt: number;
  browserAt: number;
};

// Rotation, Maximize and Restore, and Hide files and Show files each keep the
// chosen file, All changes and both panes' reading places.
async function expectKept(
  { browser, review }: TouchReview,
  { selected, code, codeAt, browserAt }: ChosenFile,
) {
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect(comparisonChoice(review, "All changes")).toBeChecked();
  expect(await scrollTopOf(code)).toBe(codeAt);
  expect(await scrollTopOf(browser)).toBe(browserAt);
}

// Every viewport chooses the long file under the comparison the review opens
// with, moves both panes by touch and rotates to landscape and back: the
// file, All changes and both reading places stay, with the panel covering the
// page up to 800 px wide and through Maximize and Restore beside it, and the
// review is read no further. The phone, owner of what no arrangement changes,
// goes on through the panel controls; any other viewport ends with the
// rotation.
export async function keepReviewContextThroughTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  portrait: Viewport,
  landscape: Viewport,
) {
  const opened = await openReviewByTouch(page, dashboard, origin);
  const { review, browser } = opened;
  const diff = await selectAddedFileByTouch(review, longA);
  const code = diff.locator(".story-review-code");
  await expect(code).toContainText("+first 0");
  await scrollByTouch(page, code, -300, "vertical", undefined, code);
  await expect.poll(() => scrollTopOf(code)).toBeGreaterThan(0);
  const browserBefore = await scrollTopOf(browser);
  await scrollByTouch(page, browser, 100, "vertical", undefined, browser);
  await expect.poll(() => scrollTopOf(browser)).toBeLessThan(browserBefore);
  const chosen = {
    selected: browser.getByRole("button", { name: `Added ${longA}` }),
    code,
    codeAt: await scrollTopOf(code),
    browserAt: await scrollTopOf(browser),
  };
  let reads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === storyReviewEndpoint) reads += 1;
  });
  for (const viewport of [landscape, portrait]) {
    await resizeUntilArranged(review, viewport);
    await expectKept(opened, chosen);
    expect((await box(code)).height).toBeGreaterThanOrEqual(40);
    expect(await pageFits(page)).toBe(true);
    if (viewport.width <= 800) await expectCovering(review);
    else {
      await tapWhereShown(control(review, "Maximize"));
      await expect(control(review, "Restore")).toBeVisible();
      await expectKept(opened, chosen);
      await tapWhereShown(control(review, "Restore"));
      await expect(control(review, "Maximize")).toBeVisible();
      await expectKept(opened, chosen);
    }
  }
  expect(reads).toBe(0);
  if (ownsSharedObservations(page))
    await keepReviewContextThroughPanelControls(
      page,
      opened,
      chosen,
      portrait,
      landscape,
    );
}

// What no arrangement changes, after the rotation: Hide files and Show files
// keep what the rotation kept, Next file opens at its top, Refresh keeps the
// chosen file, explicit Commits keeps its file and reading place through
// rotation, uncommitted changes stay left out, and Close returns focus to
// Review changes.
async function keepReviewContextThroughPanelControls(
  page: Page,
  opened: TouchReview,
  chosen: ChosenFile,
  portrait: Viewport,
  landscape: Viewport,
) {
  const { action, review, browser, changedFiles } = opened;
  await tapWhereShown(control(review, "Hide files"));
  await expect(browser).toBeHidden();
  expect(await scrollTopOf(chosen.code)).toBe(chosen.codeAt);
  await tapWhereShown(control(review, "Show files"));
  await expectKept(opened, chosen);
  await tapWhereShown(control(review, "Next file"));
  const next = review.getByRole("region", { name: `Added ${longB}` });
  await expect(next.locator(".story-review-code")).toContainText("+second 0");
  expect(await scrollTopOf(next.locator(".story-review-code"))).toBe(0);
  await tapWhereShown(control(review, "Refresh"));
  await expectReviewRead(review);
  await expect(reviewFeedback(review)).toHaveText(
    new RegExp(
      `^Review refreshed: ${String(changedFiles)} changed files against baseline [0-9a-f]{7}\\.$`,
    ),
  );
  await expect(
    browser.getByRole("button", { name: `Added ${longB}` }),
  ).toHaveAttribute("aria-pressed", "true");
  // Explicit Commits on the range that holds every changed file, chosen here
  // where it is read; with files hidden its reading place survives rotation.
  await chooseLargeChangesCommitByTouch(review, browser, changedFiles);
  await expect(reviewFeedback(review)).toHaveText(
    `Review refreshed: ${String(changedFiles)} changed files in the chosen range.`,
  );
  await selectAddedFileByTouch(review, longB);
  await tapWhereShown(control(review, "Hide files"));
  const nextCode = next.locator(".story-review-code");
  await scrollByTouch(page, nextCode, -180, "vertical", undefined, nextCode);
  await expect.poll(() => scrollTopOf(nextCode)).toBeGreaterThan(0);
  const nextAt = await scrollTopOf(nextCode);
  await resizeUntilArranged(review, landscape);
  await expect(
    comparisonChoice(review, "Commits", { exact: true }),
  ).toBeChecked();
  await expect(next.getByRole("heading")).toHaveText(`Added ${longB}`);
  expect(await scrollTopOf(nextCode)).toBe(nextAt);
  expect((await box(nextCode)).height).toBeGreaterThanOrEqual(44);
  expect(await pageFits(page)).toBe(true);
  // Every changed file but the uncommitted one.
  await leaveUncommittedOutByTouchLabel(
    review,
    browser,
    portrait,
    changedFiles - 1,
  );
  await tapWhereShown(control(review, "Close"));
  await expect(review).toHaveCount(0);
  await expect(action).toBeFocused();
  expect(await pageFits(page)).toBe(true);
}
