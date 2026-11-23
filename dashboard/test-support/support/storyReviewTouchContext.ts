import {
  closeSidePanel,
  maximizeSidePanel,
  restoreSidePanel,
} from "../sidePanelFrame.ts";
// The touch review journey that keeps its context: the chosen file and both
// panes' reading places through rotation and panel controls, on the session's
// comparison opened by touch (./storyReviewTouchJourney.ts), which also says
// which viewport owns what no arrangement changes.
import { listedFile, fileDiff } from "./reviewTreeRows.ts";

import { reviewRefresh, detailsToggle, filesToggle } from "./reviewControls.ts";
import type { Locator, Page } from "@playwright/test";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import {
  control,
  expectCovering,
  resizeUntilArranged,
} from "../sidePanelWidthPage.ts";
import { scrollByTouch } from "../touchGestures.ts";
import { longA, longB } from "./largeReviewFiles.ts";
import { expect } from "./preparationPage.ts";
import { reviewFeedback } from "./reviewContextLine.ts";
import { pageFits, scrollTopOf, codePane } from "./reviewPanes.ts";
import { expectReviewRead } from "./reviewRead.ts";
import { selectAddedFileByTouch } from "./reviewTouchReading.ts";
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
// chosen file, published comparison and both panes' reading places.
async function expectKept(
  { browser, review }: TouchReview,
  { selected, code, codeAt, browserAt }: ChosenFile,
) {
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect(review).toContainText("Published changes");
  expect(await scrollTopOf(code)).toBe(codeAt);
  expect(await scrollTopOf(browser)).toBe(browserAt);
}

// Every viewport chooses the long file under the comparison the review opens
// with, moves both panes by touch and rotates to landscape and back: the
// file, published comparison and both reading places stay, with the panel covering the
// page up to 800 px wide and through Maximize and Restore beside it, and the
// review is read no further. The phone, owner of what no arrangement changes,
// goes on through the panel controls; any other viewport ends with the
// rotation.
export async function keepReviewContextThroughTouch(
  page: Page,
  origin: StartOrigin,
  portrait: Viewport,
  landscape: Viewport,
) {
  const opened = await openReviewByTouch(page, origin);
  const { review, browser } = opened;
  const diff = await selectAddedFileByTouch(review, longA);
  const code = codePane(diff);
  await expect(code).toContainText("+first 0");
  await scrollByTouch(page, code, -300, "vertical", undefined, code);
  await expect.poll(() => scrollTopOf(code)).toBeGreaterThan(0);
  const browserBefore = await scrollTopOf(browser);
  await scrollByTouch(page, browser, 100, "vertical", undefined, browser);
  await expect.poll(() => scrollTopOf(browser)).toBeLessThan(browserBefore);
  const chosen = {
    selected: listedFile(browser, `Added ${longA}`),
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
      await maximizeSidePanel(review, "touch");
      await expect(control(review, "Restore")).toBeVisible();
      await expectKept(opened, chosen);
      await restoreSidePanel(review, "touch");
      await expect(control(review, "Maximize")).toBeVisible();
      await expectKept(opened, chosen);
    }
  }
  expect(reads).toBe(0);
  if (ownsSharedObservations(page))
    await keepReviewContextThroughPanelControls(page, opened, chosen);
}

// What no arrangement changes, after the rotation: Hide files and Show files
// keep what the rotation kept, Next file opens at its top, Refresh keeps the
// chosen file and Close returns focus to the session review action.
async function keepReviewContextThroughPanelControls(
  page: Page,
  opened: TouchReview,
  chosen: ChosenFile,
) {
  const { action, review, browser, changedFiles } = opened;
  // The toolbar's two toggles are tap-sized; the sidebar's keeps its place.
  const toggleAt = await box(filesToggle(review));
  for (const at of [toggleAt, await box(detailsToggle(review))]) {
    expect(at.width).toBeGreaterThanOrEqual(44);
    expect(at.height).toBeGreaterThanOrEqual(44);
  }
  await tapWhereShown(filesToggle(review));
  await expect(browser).toBeHidden();
  expect(await scrollTopOf(chosen.code)).toBe(chosen.codeAt);
  expect(await box(filesToggle(review, "Show files"))).toEqual(toggleAt);
  await tapWhereShown(filesToggle(review, "Show files"));
  await expectKept(opened, chosen);
  await tapWhereShown(control(review, "Next file"));
  const next = fileDiff(review, `Added ${longB}`);
  await expect(codePane(next)).toContainText("+second 0");
  expect(await scrollTopOf(codePane(next))).toBe(0);
  await tapWhereShown(reviewRefresh(review, { exact: true }));
  await expectReviewRead(review);
  await expect(reviewFeedback(review)).toHaveText(
    `Review refreshed: ${String(changedFiles)} changed files in the published changes.`,
  );
  await expect(listedFile(browser, `Added ${longB}`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await closeSidePanel(review, { using: "touch" });
  await expect(review).toHaveCount(0);
  await expect(action).toBeFocused();
  expect(await pageFits(page)).toBe(true);
}
