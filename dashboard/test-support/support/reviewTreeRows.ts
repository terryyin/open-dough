// A story review's file browser as its rows read on screen: each folder's or
// file's visible text, indented two spaces per folder that holds it, in the
// order shown. A row is its list item's first element, a folder's disclosure
// or a file's control; a folder's own rows follow in its nested list unless
// the folder is collapsed and the list hidden. A file's line counts are left
// out (../../../e2e/review/story-review-line-counts.spec.ts reads them).

import { expect, type Locator } from "@playwright/test";
import { storyReviewWaitMs } from "../../src/storyReviewContract.ts";
import { fileBrowser } from "./reviewContextLine.ts";

// The changed-file list, named by the count the scenario expects.
export const changedFilesList = (
  review: Locator,
  name: string | RegExp,
  options: { exact?: boolean } = {},
) => review.getByRole("list", { name, ...options });

// One named file in a supplied list or file-browser pane. Matching remains
// the caller's choice; accessibility contracts keep their exact option.
export const listedFile = (
  files: Locator,
  name: string | RegExp,
  options: { exact?: boolean } = {},
) => files.getByRole("button", { name, ...options });

export const fileLineCounts = (file: Locator) =>
  file.locator(".story-review-line-counts");

// The selected file's diff, named by its kind and full path. This accessor
// neither selects the file nor makes a pending read finish.
export const fileDiff = (
  review: Locator,
  name: string | RegExp,
  options: { exact?: boolean } = {},
) => review.getByRole("region", { name, ...options });

const treeRows = (list: Locator) =>
  list.evaluate((root) => {
    const rows: string[] = [];
    const walk = (folder: Element, depth: number) => {
      for (const item of folder.children) {
        const row = item.firstElementChild?.cloneNode(true);
        if (!(row instanceof Element)) continue;
        row.querySelector(".story-review-line-counts")?.remove();
        const text = row.textContent;
        rows.push(`${"  ".repeat(depth)}${text.replace(/\s+/g, " ").trim()}`);
        const nested = item.querySelector(":scope > ul");
        if (nested && !nested.hasAttribute("hidden")) walk(nested, depth + 1);
      }
    };
    walk(root, 0);
    return rows;
  });

// The file browser `list` shows `rows`. The list is named by its count of
// changed files, so it appears once the review has read that comparison,
// which the boundary may take up to its read bound to answer; its rows then
// follow the folders' disclosures.
export async function expectTreeRows(list: Locator, rows: readonly string[]) {
  await expect(list).toBeAttached({ timeout: storyReviewWaitMs });
  await expect.poll(() => treeRows(list)).toEqual(rows);
}

// A folder's disclosure in the review, by its accessible name: the folder's
// name, followed by its count while collapsed.
export const treeFolder = (review: Locator, name: string | RegExp) =>
  review
    .getByRole("listitem")
    .getByRole("button", { name, exact: true })
    .and(review.locator("button[aria-expanded]"));

// A file's control in the review's file browser, by its accessible name: its
// kind and name, as in “Added story.txt”.
export const fileRow = (review: Locator, name: string) =>
  listedFile(fileBrowser(review), name, { exact: true });

// The file's line counts as its row shows them, as in “+1 −0”.
export const expectLineCounts = (
  review: Locator,
  name: string,
  shown: string,
) =>
  expect(fileLineCounts(fileRow(review, name))).toHaveText(shown, {
    useInnerText: true,
  });

// The file is the one selected: its row says so and its diff is shown.
export async function expectFileSelected(review: Locator, name: string) {
  await expect(fileRow(review, name)).toHaveAttribute("aria-pressed", "true");
  await expect(fileDiff(review, name)).toBeVisible();
}

// The rows of the nested worktree's review (./storyReviewWorktree.ts) with
// every folder expanded; the rename's old folder shows nothing for it.
export const nestedTreeRows = [
  "dashboard",
  "  server",
  "    c.ts",
  "  src",
  "    a.tsx",
  "    b.ts",
  "docs/adrs/drafts",
  "  0009-tree.md",
  "new",
  "  a.ts",
  "README.md",
];
