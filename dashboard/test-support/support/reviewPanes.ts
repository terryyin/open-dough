// A published session's review as the developer meets
// its panes: the file browser and the selected file's diff, each measured by
// where it is scrolled and whether its content overflows it.

import { changedFilesList, fileDiff, listedFile } from "./reviewTreeRows.ts";
import { expect, type Locator, type Page } from "@playwright/test";
import { box } from "../pageLayout.ts";
import { largeReviewRevision, longA } from "./largeReviewFiles.ts";
import { expectOpenedWithKeyboard, expectReviewRead } from "./reviewRead.ts";
import { assumeReviewChanges } from "../reviewChangesPage.ts";
import { sidePanelPages } from "../sidePanelPages.ts";
import { publishWorktreeReviewSession } from "./publishedReviewSession.ts";
import { openBacklog } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  largeRepository,
  storyWorktree,
  wideLine,
} from "./storyReviewWorktree.ts";

// The selected diff's independently scrollable code and rendered lines.
export const codePane = (diff: Locator) => diff.locator(".story-review-code");

// The code pane stays busy while its omitted context is read; gap rows that
// arrive with that context move the printed lines below them.
export async function expectContextRead(code: Locator) {
  await expect(code).toHaveAttribute("aria-busy", "false");
}

export const diffLines = (
  scope: Locator,
  options: { hasText?: string | RegExp } = {},
) => scope.locator("li.story-review-line", options);

// One hunk of a diff, by its header, and its rendered lines.
export const diffHunk = (diff: Locator, hunk: string) =>
  diff.getByRole("list", { name: hunk });
export const hunkLines = (diff: Locator, hunk: string) =>
  diffLines(diffHunk(diff, hunk));

// The hunk's lines exactly, each leading marker and its spacing included.
export async function expectHunkLines(
  diff: Locator,
  hunk: string,
  expected: readonly string[],
) {
  const shown = hunkLines(diff, hunk);
  await expect(shown).toHaveCount(expected.length);
  expect(await shown.allTextContents()).toEqual(expected);
}

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

// The part spans the work area from top to bottom; answers the part's box.
export async function expectSpansWorkarea(part: Locator, workarea: Locator) {
  const [area, shown] = await Promise.all([box(workarea), box(part)]);
  expect(shown.y).toBeCloseTo(area.y, 0);
  expect(shown.height).toBeCloseTo(area.height, 0);
  return shown;
}

// A drawer spans the work area at its leading edge and leaves room beside it
// for an outside dismissal.
export async function expectDrawerOver(drawer: Locator, workarea: Locator) {
  const [area, shown] = await Promise.all([
    box(workarea),
    expectSpansWorkarea(drawer, workarea),
  ]);
  expect(shown.x).toBeCloseTo(area.x, 0);
  expect(shown.x + shown.width).toBeLessThan(area.x + area.width - 40);
}

// The large story: many files, a name wider than the browser and long diffs.
export const largeReviewRepository = largeRepository(
  largeReviewRevision({
    filesPerFolder: { many: 30, more: 30 },
    wideName: `a-file-named-${"at-length-".repeat(6)}.txt`,
    longLines: 200,
    wideLine,
  }),
);

// The review of an origin started from largeReviewRepository, open on the
// first long file, selected from the end of the browser's list, which the
// selection leaves scrolled there.
export async function openLargeReview(page: Page, origin: StartOrigin) {
  const { workspace, base } = storyWorktree(origin);
  const session = publishWorktreeReviewSession(origin, workspace, base);
  await openBacklog(page, origin);
  await sidePanelPages(page).phase(
    "open the published session review with the keyboard",
    ({ board }) => board.reviewPublishedSession(session, "keyboard"),
  );
  const opened = await assumeReviewChanges(page);
  const { panel, fileBrowser: browser } = opened.frame.partsToMeasure();
  await expectOpenedWithKeyboard(panel);
  await expectReviewRead(panel);
  await expect(changedFilesList(browser, "63 changed files")).toBeVisible();
  const diffOf = (name: string) => fileDiff(panel, name);
  const codeOf = (name: string) => codePane(diffOf(name));
  const select = async (name: string) => {
    await listedFile(browser, name).click();
    await expect(codeOf(name)).toBeVisible();
  };
  await scrollPane(browser, 100_000);
  await select(`Added ${longA}`);
  return { browser, diffOf, codeOf, select, opened, session };
}
