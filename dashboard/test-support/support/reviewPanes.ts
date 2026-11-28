// A review as the developer meets its panes: the file browser and the
// selected file's diff, each measured by where it is scrolled and whether its
// content overflows it.

import { expect, type Locator } from "@playwright/test";
import { box } from "../pageLayout.ts";
import { largeReviewRevision } from "./largeReviewFiles.ts";
import { largeRepository, wideLine } from "./storyReviewWorktree.ts";

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

export const diffHeading = (
  diff: Locator,
  options: { level?: number; name?: string | RegExp; exact?: boolean } = {},
) => diff.getByRole("heading", options);

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

// The large story: many files, a name wider than the browser and long diffs.
export const largeReviewRepository = largeRepository(
  largeReviewRevision({
    filesPerFolder: { many: 30, more: 30 },
    wideName: `a-file-named-${"at-length-".repeat(6)}.txt`,
    longLines: 200,
    wideLine,
  }),
);
