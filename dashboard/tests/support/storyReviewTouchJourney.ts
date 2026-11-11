// Touch review journeys: opening story A's comparison by touch, then
// tap-sized controls and pane reading. Kept context through rotation and
// panel controls is ./storyReviewTouchContext.ts; uncommitted comparison
// ownership stays with story-review-uncommitted-check.spec.ts.
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expectSettledPage } from "../dashboardPage.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import { scrollByTouch } from "../touchGestures.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { largeReviewRevision, longA } from "./largeReviewFiles.ts";
import { expect } from "./preparationPage.ts";
import { contextValues, fileBrowser, reviewBody } from "./reviewContextLine.ts";
import {
  boxes,
  overflows,
  pageFits,
  scrollLeftOf,
  scrollTopOf,
} from "./reviewPanes.ts";
import { expectReviewRead } from "./reviewRead.ts";
import {
  chooseLargeChangesCommitByTouch,
  codePartGeometry,
  readCodePartByTouch,
  readContextByTouch,
  reachReviewControl,
  selectAddedFileByTouch,
  visibleShortCodeLine,
} from "./reviewTouchReading.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import { uncommittedLabel } from "./storyReviewMark.ts";
import { largeWorktree } from "./storyReviewWorktree.ts";

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

// Opens story A's real comparison by touch, its review focused.
export async function openReviewByTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = largeWorktree(
    origin,
    largeReviewRevision({
      filesPerFolder: { many: filesInFolder },
      longLines,
      wideLine,
    }),
  );
  writeFileSync(path.join(workspace, "touch-uncommitted.txt"), "uncommitted\n");
  // The folder's files, both long files and the uncommitted one.
  const changedFiles = filesInFolder + 3;
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await expectSettledPage(page);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.scrollIntoViewIfNeeded();
  await tapWhereShown(action);
  const review = page.getByRole("region", { name: "Story review" });
  await expect(reviewBody(review)).toBeFocused();
  await expectReviewRead(review);
  const browser = fileBrowser(review);
  await expect(
    browser.getByRole("list", {
      name: `${String(changedFiles)} changed files`,
    }),
  ).toBeVisible();
  const comparison = review.getByRole("radiogroup", { name: "Comparison" });
  const all = comparison.locator("label", { hasText: "All changes" });
  return { action, review, browser, comparison, all, changedFiles };
}

export type TouchReview = Awaited<ReturnType<typeof openReviewByTouch>>;

// After the large-changes commit, All changes by touch, then the long file.
export async function chooseAllChangesFileByTouch({
  review,
  browser,
  comparison,
  all,
  changedFiles,
}: TouchReview) {
  await chooseLargeChangesCommitByTouch(review, browser, changedFiles);
  await reachReviewControl(review, all);
  await tapWhereShown(all);
  await expect(
    comparison.getByRole("radio", { name: "All changes" }),
  ).toBeChecked();
  return selectAddedFileByTouch(review, longA);
}

export async function chooseComparisonAndReadByTouch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const opened = await openReviewByTouch(page, dashboard, origin);
  const { review, browser, comparison, all } = opened;
  const commits = comparison.locator("label", { hasText: "Commits" });
  const folder = browser.getByRole("button", { name: /^many\b/ });
  const label = uncommittedLabel(review);
  for (const target of [contextValues(review), all, commits, folder, label]) {
    expect(
      (await box(target)).height,
      await target.innerText(),
    ).toBeGreaterThanOrEqual(44);
  }
  await readContextByTouch(review, "~/git/open-dough/.worktrees/story-a");
  await reachReviewControl(review, folder);
  await tapWhereShown(folder);
  await expect(folder).toHaveAttribute("aria-expanded", "false");
  await reachReviewControl(review, folder);
  await tapWhereShown(folder);
  await expect(folder).toHaveAttribute("aria-expanded", "true");
  const diff = await chooseAllChangesFileByTouch(opened);
  const code = diff.locator(".story-review-code");
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
  const length = wideLine.length + 1;
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
