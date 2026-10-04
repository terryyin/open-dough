// A story review's file browser as its rows read on screen: each folder's or
// file's visible text, indented two spaces per folder that holds it, in the
// order shown. A row is its list item's first element, a folder's disclosure
// or a file's control; a folder's own rows follow in its nested list unless
// the folder is collapsed and the list hidden.

import type { Locator } from "@playwright/test";

export const treeRows = (list: Locator) =>
  list.evaluate((root) => {
    const rows: string[] = [];
    const walk = (folder: Element, depth: number) => {
      for (const item of folder.children) {
        const text = item.firstElementChild?.textContent ?? "";
        rows.push(`${"  ".repeat(depth)}${text.replace(/\s+/g, " ").trim()}`);
        const nested = item.querySelector(":scope > ul");
        if (nested && !nested.hasAttribute("hidden")) walk(nested, depth + 1);
      }
    };
    walk(root, 0);
    return rows;
  });

// A folder's disclosure in the review, by its accessible name: the folder's
// name, followed by its count while collapsed.
export const treeFolder = (review: Locator, name: string) =>
  review
    .getByRole("listitem")
    .getByRole("button", { name, exact: true })
    .and(review.locator("button[aria-expanded]"));

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
