// A story review's file browser as its rows read on screen: each folder's or
// file's visible text, indented two spaces per folder that holds it, in the
// order shown. A row is its list item's first element, a folder's name or a
// file's control; a folder's own rows follow in its nested list.

import type { Locator } from "@playwright/test";

export const treeRows = (list: Locator) =>
  list.evaluate((root) => {
    const rows: string[] = [];
    const walk = (folder: Element, depth: number) => {
      for (const item of folder.children) {
        const text = item.firstElementChild?.textContent ?? "";
        rows.push(`${"  ".repeat(depth)}${text.replace(/\s+/g, " ").trim()}`);
        const nested = item.querySelector(":scope > ul");
        if (nested) walk(nested, depth + 1);
      }
    };
    walk(root, 0);
    return rows;
  });
