// Touch reading of a genuine published session's comparison. The phone
// checks shared controls while each viewport checks its own arrangement.
import { changedFilesList, treeFolder } from "./reviewTreeRows.ts";
import { showColumn } from "../boardPage.ts";
import { expectSettledPage, parts } from "../dashboardPage.ts";
import { publishedSessionReviewChanges } from "../recentlyDoneColumn.ts";
import { assumeReviewChanges } from "../reviewChangesPage.ts";
import { publishWorktreeReviewSession } from "./publishedReviewSession.ts";
import type { Page } from "@playwright/test";
import { box, tapWhereShown } from "../pageLayout.ts";
import { scrollByTouch } from "../touchGestures.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import { largeReviewRevision, longA } from "./largeReviewFiles.ts";
import { expect } from "./preparationPage.ts";
import { fileBrowser } from "./reviewContextLine.ts";
import {
  boxes,
  overflows,
  pageFits,
  scrollLeftOf,
  scrollTopOf,
  codePane,
} from "./reviewPanes.ts";
import { expectOpenedWithKeyboard, expectReviewRead } from "./reviewRead.ts";
import {
  codePartGeometry,
  readCodePartByTouch,
  reachReviewControl,
  selectAddedFileByTouch,
  visibleShortCodeLine,
} from "./reviewTouchReading.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { reviewRegion } from "./reviewControls.ts";
import {
  commitAll,
  largeRepository,
  storyWorktree,
} from "./storyReviewWorktree.ts";
import { withLocalState } from "../../../Distribution/tests/support/repository-local-state.mjs";

// The comparison holds what the touch assertions distinguish, as the phone
// and the tablet arrange it in portrait, with a margin for another machine's
// fonts. One folder's files and the three files after them overflow the
// tablet's file browser, the tallest, with the first long file below its
// fold. The long files leave a 300 px reading place in the tablet's code
// pane, the tallest, with the wide line below its fold. The wide line's
// 15-character end starts beyond the tablet's code pane, the widest.
const filesInFolder = 15;
const longLines = 50;
const wideLine = `more ${"wide ".repeat(14)}`;

// The comparison, with one untracked file left uncommitted.
export const touchReviewRepository = withLocalState(
  largeRepository(
    largeReviewRevision({
      filesPerFolder: { many: filesInFolder },
      longLines,
      wideLine,
    }),
  ),
  { untracked: { "touch-uncommitted.txt": "uncommitted\n" } },
);

// Open the session's real published comparison by touch.
export async function openReviewByTouch(page: Page, origin: StartOrigin) {
  const { workspace, base } = storyWorktree(origin);
  const changedFiles = filesInFolder + 3;
  commitAll(workspace, "Complete the session");
  const session = publishWorktreeReviewSession(origin, workspace, base);
  await openBacklog(page, origin);
  await expectSettledPage(page);
  await showColumn(page, "Recently done");
  const action = publishedSessionReviewChanges(
    parts(page).recentlyDone,
    session,
  );
  await action.scrollIntoViewIfNeeded();
  await tapWhereShown(action);
  const review = reviewRegion(page);
  await expectOpenedWithKeyboard(review);
  await expectReviewRead(review);
  const browser = fileBrowser(review);
  await expect(
    changedFilesList(browser, `${String(changedFiles)} changed files`),
  ).toBeVisible();
  return { action, review, browser, changedFiles };
}

export type TouchReview = Awaited<ReturnType<typeof openReviewByTouch>>;

// Whether the journey runs where each observation that no arrangement changes
// has its one owner: the phone, as its portrait opens the review. Any other
// viewport repeats only what its own arrangement changes.
export function ownsSharedObservations(page: Page) {
  return page.viewportSize()?.width === phoneLaunchTouchViewport.portrait.width;
}

// Show the session's facts and exercise the same folder control by touch.
async function observeSharedControlsByTouch({ review }: TouchReview) {
  const opened = await assumeReviewChanges(review.page());
  await opened.expectComparisonNamed("Published changes");
  await opened.details.expectRevealed();
  const folder = treeFolder(review, /^many\b/);
  expect((await box(folder)).height).toBeGreaterThanOrEqual(44);
  await reachReviewControl(review, folder);
  await tapWhereShown(folder);
  await expect(folder).toHaveAttribute("aria-expanded", "false");
  await reachReviewControl(review, folder);
  await tapWhereShown(folder);
  await expect(folder).toHaveAttribute("aria-expanded", "true");
}

// Every viewport chooses the long file and reads within each pane. The phone,
// owner of what no arrangement changes, first observes the controls and
// inspects its published comparison and folder before reading.
export async function chooseComparisonAndReadByTouch(
  page: Page,
  origin: StartOrigin,
) {
  const opened = await openReviewByTouch(page, origin);
  const { review, browser } = opened;
  if (ownsSharedObservations(page)) await observeSharedControlsByTouch(opened);
  const diff = await selectAddedFileByTouch(review, longA);
  const code = codePane(diff);
  await expect(code).toContainText("+first 0");
  await expect(code).toContainText(`+${wideLine}`);
  expect((await box(code)).height).toBeGreaterThanOrEqual(44);
  expect((await overflows(code)).sideways).toBe(true);
  const fixed = [
    review.locator(".side-panel-header"),
    review.locator(".story-review-top"),
    diff.getByRole("heading"),
  ];
  const before = await boxes(fixed);
  const browserAt = await scrollTopOf(browser);
  const wide = code.locator(".story-review-line", { hasText: wideLine });
  await readCodePartByTouch(page, code, wide, 0, 11, "vertical");
  const beginning = await codePartGeometry(wide, 0, 11);
  expect(beginning.text).toBe(`+${wideLine}`.slice(0, 11));
  expect(
    beginning.visible,
    "the long line's beginning is read within the diff",
  ).toBe(true);
  await expect.poll(() => scrollTopOf(code)).toBeGreaterThan(0);
  const renderedLine = await wide.innerText();
  expect(renderedLine).toBe(`+${wideLine}`);
  const length = renderedLine.length;
  expect((await codePartGeometry(wide, length - 15, length)).visible).toBe(
    false,
  );
  await readCodePartByTouch(
    page,
    code,
    wide,
    length - 15,
    length,
    "horizontal",
  );
  const ending = await codePartGeometry(wide, length - 15, length);
  expect(ending.text).toBe(wideLine.slice(-15));
  expect(ending.visible, "the long line's ending is read within the diff").toBe(
    true,
  );
  await expect.poll(() => scrollLeftOf(code)).toBeGreaterThan(0);
  expect(await scrollTopOf(browser)).toBe(browserAt);
  expect(await boxes(fixed)).toEqual(before);
  expect(await pageFits(page)).toBe(true);
  await readCodePartByTouch(page, code, wide, 0, 11, "horizontal");
  expect(
    (await codePartGeometry(wide, 0, 11)).visible,
    "the long line's beginning is read again within the diff",
  ).toBe(true);
  // One stroke back toward the lines the read passed, no further than the
  // pane has moved: half the pane's height fits a single in-view stroke.
  const back = Math.min(await scrollTopOf(code), (await box(code)).height / 2);
  await scrollByTouch(page, code, back, "vertical", undefined, code);
  const readLine = await visibleShortCodeLine(code);
  const readText = readLine.text ?? "";
  expect(readText).toMatch(/^\+first [0-9]+$/);
  expect(
    (
      await codePartGeometry(
        code.locator(`[data-new="${readLine.number}"]`),
        0,
        readText.length,
      )
    ).visible,
  ).toBe(true);
  const codeBeforeBrowserScroll = await scrollTopOf(code);
  await scrollByTouch(page, browser, 100);
  await expect.poll(() => scrollTopOf(browser)).toBeLessThan(browserAt);
  expect(await scrollTopOf(code)).toBe(codeBeforeBrowserScroll);
  expect(await boxes(fixed)).toEqual(before);
}
