// Observe actual text inside the code pane and reach it with native movement.
import type { Locator, Page } from "@playwright/test";
import { tapWhereShown } from "../pageLayout.ts";
import { resizeUntilArranged } from "../sidePanelWidthPage.ts";
import { scrollByTouch } from "../touchGestures.ts";
import { expect } from "./preparationPage.ts";
import { contextValues, fileBrowser } from "./reviewContextLine.ts";
import { chooseCommit } from "./storyReviewCommitChoice.ts";
import { uncommittedCheck, uncommittedLabel } from "./storyReviewMark.ts";

// Read a particular part of rendered code, including clipping by its pane.
// Adjacent React text nodes carry the marker and the file's original text.
export async function codePartGeometry(
  line: Locator,
  start: number,
  end: number,
) {
  return line.evaluate(
    (element, { start, end }) => {
      const range = document.createRange();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let read = 0;
      let from = false;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const length = node.textContent?.length ?? 0;
        if (!from && start < read + length) {
          range.setStart(node, start - read);
          from = true;
        }
        if (from && end <= read + length) {
          range.setEnd(node, end - read);
          break;
        }
        read += length;
      }
      const pane = element.closest(".story-review-code") as HTMLElement;
      const box = pane.getBoundingClientRect();
      const part = range.getBoundingClientRect();
      const left = box.left + pane.clientLeft;
      const top = box.top + pane.clientTop;
      const right = left + pane.clientWidth;
      const bottom = top + pane.clientHeight;
      return {
        text: range.toString(),
        visible:
          part.left >= left &&
          part.right <= right &&
          part.top >= top &&
          part.bottom <= bottom,
        horizontal:
          part.left < left ? left - part.left : Math.min(0, right - part.right),
        vertical:
          part.top < top ? top - part.top : Math.min(0, bottom - part.bottom),
      };
    },
    { start, end },
  );
}

export async function readCodePartByTouch(
  page: Page,
  code: Locator,
  line: Locator,
  start: number,
  end: number,
  axis: "vertical" | "horizontal",
) {
  for (let stroke = 0; stroke < 32; stroke += 1) {
    const part = await codePartGeometry(line, start, end);
    const remaining = part[axis];
    if (remaining === 0) break;
    await scrollByTouch(
      page,
      code,
      // The native helper already splits movement into feasible in-view
      // strokes. Send the observed distance rather than imposing a second,
      // shorter cap and sampling geometry after every 300 pixels.
      Math.sign(remaining) * (Math.abs(remaining) + 24),
      axis,
    );
    // Observe the browser's completed movement before choosing another stroke.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => {
            resolve();
          }),
        ),
    );
  }
}

export async function readContextByTouch(review: Locator, workspace: string) {
  const values = contextValues(review);
  await tapWhereShown(values);
  await expect(values).toHaveAttribute("aria-expanded", "true");
  const workspaceValue = values.locator(
    ".story-review-context-worktree > code",
  );
  await workspaceValue.scrollIntoViewIfNeeded();
  await expect(workspaceValue).toHaveText(workspace);
  expect(
    await workspaceValue.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await values.scrollIntoViewIfNeeded();
  await tapWhereShown(values);
  await expect(values).toHaveAttribute("aria-expanded", "false");
}

// A scrolling review region may first reach a control beyond its fold.
// Native scrolling keeps the Side panel and document stationary.
export async function reachReviewControl(review: Locator, row: Locator) {
  const panel = await review.boundingBox();
  const page = review.page();
  const documentTop = await page.evaluate(() => scrollY);
  expect(documentTop).toBe(0);
  await row.scrollIntoViewIfNeeded();
  expect(await review.boundingBox()).toEqual(panel);
  expect(await page.evaluate(() => scrollY)).toBe(documentTop);
  const clipped = await row.evaluate((element) => {
    const at = element.getBoundingClientRect();
    const result = [];
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      const style = getComputedStyle(parent);
      const area = parent.getBoundingClientRect();
      if (
        style.overflowY !== "visible" &&
        (at.top < area.top - 1 || at.bottom > area.bottom + 1)
      )
        result.push({
          region: parent.className,
          top: area.top,
          bottom: area.bottom,
          rowTop: at.top,
          rowBottom: at.bottom,
          rowHeight: at.height,
          clientHeight: parent.clientHeight,
        });
    }
    return result;
  });
  expect(
    clipped,
    "the reached control fits its real scrolling regions",
  ).toEqual([]);
}

export async function selectAddedFileByTouch(review: Locator, file: string) {
  const browser = fileBrowser(review);
  const row = browser.getByRole("button", { name: `Added ${file}` });
  // A long file list is ordinary independently scrolling content.
  await reachReviewControl(review, row);
  await tapWhereShown(row);
  await expect(row).toHaveAttribute("aria-pressed", "true");
  return review.getByRole("region", { name: `Added ${file}` });
}

// The large worktree fixture has short lines around its one wide line.
export async function visibleShortCodeLine(code: Locator) {
  return code.locator(".story-review-line").evaluateAll((lines) => {
    const pane = lines[0]?.closest(".story-review-code") as HTMLElement;
    const room = pane.getBoundingClientRect();
    const top = room.top + pane.clientTop;
    const bottom = top + pane.clientHeight;
    const shown = lines.find((line) => {
      const box = line.getBoundingClientRect();
      return (
        /^\+first [0-9]+$/.test(line.textContent) &&
        box.top >= top &&
        box.bottom <= bottom
      );
    });
    return {
      number: shown?.getAttribute("data-new"),
      text: shown?.textContent,
    };
  });
}

// Tap the Commits comparison and confirm it is the chosen one.
export async function chooseCommitsByTouch(review: Locator) {
  const comparison = review.getByRole("radiogroup", { name: "Comparison" });
  const commits = comparison.locator("label", { hasText: "Commits" });
  await reachReviewControl(review, commits);
  await tapWhereShown(commits);
  await expect(
    comparison.getByRole("radio", { name: "Commits", exact: true }),
  ).toBeChecked();
}

// Choose Commits, then by touch the commit whose range holds every changed
// file, once the anchored range's answer has moved the list.
export async function chooseLargeChangesCommitByTouch(
  review: Locator,
  browser: Locator,
) {
  await chooseCommitsByTouch(review);
  const commits = review.getByRole("region", { name: "Story commits" });
  await expect(commits).toBeVisible();
  const commit = commits.getByRole("button", { name: /large changes/ });
  await chooseCommit(review, commit, async (row) => {
    await row.scrollIntoViewIfNeeded();
    await tapWhereShown(row);
  });
  await expect(commit).toHaveAttribute("aria-pressed", "true");
  await expect(
    browser.getByRole("list", { name: "64 changed files" }),
  ).toBeVisible();
}

// Tap the uncommitted-check label off; that state survives a viewport restore.
export async function leaveUncommittedOutByTouchLabel(
  review: Locator,
  browser: Locator,
  portrait: { width: number; height: number },
) {
  const all = review
    .getByRole("radiogroup", { name: "Comparison" })
    .locator("label", { hasText: "All changes" });
  const uncommitted = uncommittedCheck(review);
  const label = uncommittedLabel(review);
  await tapWhereShown(
    review.getByRole("button", { name: "Show files", exact: true }),
  );
  await reachReviewControl(review, all);
  await tapWhereShown(all);
  await expect(uncommitted).toBeChecked();
  await label.scrollIntoViewIfNeeded();
  await tapWhereShown(label);
  await expect(uncommitted).not.toBeChecked();
  await expect(
    browser.getByRole("list", { name: "63 changed files" }),
  ).toBeVisible();
  await resizeUntilArranged(review, portrait);
  await expect(uncommitted).not.toBeChecked();
}
