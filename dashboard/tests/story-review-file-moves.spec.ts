// Previous file and Next file beside a story review's diff heading move the
// selection in the browser's order, of Story A's worktree changing nested
// files (./support/storyReviewWorktree.ts). Next walks from the opening file
// to the last; Previous is unavailable on the first file and Next on the
// last, each still focusable. A move into a collapsed folder expands it and
// the folders holding it, and brings the selected row into the browser's
// view; each move shows the diff from the top. In a large review, Next to a
// file below the browser's fold scrolls the browser, not the page, to it.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/preparationPage.ts";
import { fileBrowser } from "./support/reviewContextLine.ts";
import {
  openLargeReview,
  scrollPane,
  scrollTopOf,
  shownInPane,
} from "./support/reviewPanes.ts";
import { treeFolder } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { longA, longB, nestedWorktree } from "./support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";

// The nested worktree's files in the browser's order.
const nestedOrder = [
  "Deleted dashboard/server/c.ts",
  "Added dashboard/src/a.tsx",
  "Modified dashboard/src/b.ts",
  "Added docs/adrs/drafts/0009-tree.md",
  "Renamed old/a.ts → new/a.ts",
  "Modified README.md",
];

const moves = (review: Locator) => ({
  previous: review.getByRole("button", { name: "Previous file", exact: true }),
  next: review.getByRole("button", { name: "Next file", exact: true }),
});

// The selected file: pressed in the browser, and its diff shown from the top.
async function expectSelected(review: Locator, name: string) {
  const row = fileBrowser(review).getByRole("button", { name, exact: true });
  await expect(row).toHaveAttribute("aria-pressed", "true");
  const diff = review.getByRole("region", { name, exact: true });
  await expect(diff.getByRole("heading", { level: 3 })).toHaveText(name);
  const code = diff.locator(".story-review-code");
  if ((await code.count()) > 0) expect(await scrollTopOf(code)).toBe(0);
  return row;
}

const pageScroll = (page: Page) =>
  page.evaluate(() => document.scrollingElement?.scrollTop ?? 0);

test("Previous file and Next file move through the browser's order", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = nestedWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  const browser = fileBrowser(review);
  const { previous, next } = moves(review);
  await expectSelected(review, nestedOrder[0] ?? "");

  await test.step("Previous file is unavailable on the first file, yet focusable", async () => {
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await expect(next).toHaveAttribute("aria-disabled", "false");
    await previous.focus();
    await expect(previous).toBeFocused();
    await page.keyboard.press("Enter");
    await expectSelected(review, nestedOrder[0] ?? "");
  });

  await test.step("Next file walks the files in the browser's order to the last", async () => {
    for (const name of nestedOrder.slice(1)) {
      await next.click();
      await expectSelected(review, name);
    }
    await expect(previous).toHaveAttribute("aria-disabled", "false");
  });

  await test.step("Next file is unavailable on the last file, yet focusable", async () => {
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await next.focus();
    await expect(next).toBeFocused();
    await page.keyboard.press("Enter");
    await expectSelected(review, nestedOrder.at(-1) ?? "");
  });

  await test.step("Next file into a collapsed folder expands it and brings its first file into view", async () => {
    await browser
      .getByRole("button", { name: "Modified dashboard/src/b.ts" })
      .click();
    await treeFolder(review, "docs/adrs/drafts").click();
    const folder = treeFolder(review, "docs/adrs/drafts 1 changed file");
    await expect(folder).toHaveAttribute("aria-expanded", "false");
    await next.click();
    const row = await expectSelected(review, nestedOrder[3] ?? "");
    await expect(treeFolder(review, "docs/adrs/drafts")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(await shownInPane(browser, row)).toBe(true);
  });

  await test.step("Previous file into a folder collapsed inside another expands both", async () => {
    await treeFolder(review, "src").click();
    await treeFolder(review, "dashboard").click();
    await expect(
      treeFolder(review, "dashboard 3 changed files"),
    ).toHaveAttribute("aria-expanded", "false");
    await previous.click();
    const row = await expectSelected(review, nestedOrder[2] ?? "");
    for (const name of ["dashboard", "src"])
      await expect(treeFolder(review, name)).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    expect(await shownInPane(browser, row)).toBe(true);
  });
});

test("Next file to a file below the browser's fold scrolls the browser to it", async ({
  page,
  dashboard,
  origin,
}) => {
  const { review, browser, codeOf, select } = await openLargeReview(
    page,
    dashboard,
    origin,
  );
  const { previous, next } = moves(review);
  const nameA = `Added ${longA}`;
  const nameB = `Added ${longB}`;

  await test.step("each move shows the diff from the top", async () => {
    expect(await scrollPane(codeOf(nameA), 1500)).toBe(1500);
    await next.click();
    await expectSelected(review, nameB);
    expect(await scrollPane(codeOf(nameB), 1500)).toBe(1500);
    await previous.click();
    await expectSelected(review, nameA);
  });

  await test.step("Next file brings a row below the fold into view, the page unscrolled", async () => {
    await select("Added more/file-29.txt");
    expect(await scrollPane(browser, 0)).toBe(0);
    await next.click();
    const row = await expectSelected(
      review,
      `Added a-file-named-${"at-length-".repeat(6)}.txt`,
    );
    await expect.poll(() => scrollTopOf(browser)).toBeGreaterThan(0);
    expect(await shownInPane(browser, row)).toBe(true);
    expect(await pageScroll(page)).toBe(0);
  });
});
