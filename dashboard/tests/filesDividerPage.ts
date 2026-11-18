// A review's Files divider between its file sidebar and its diff
// (../src/StoryReviewWorkarea.tsx), and the two panes' widths as shown.

import type { Locator, Page } from "@playwright/test";
import { box } from "./pageLayout.ts";
import { expect } from "./support/frontendApp.ts";

// CSS px at the dashboard's 16px root size.
export const rem = 16;
const preferredWidthKey = "open-dough.storyReview.filesWidth";

// Keeps `value` as this browser's preferred width, as a reviewer's earlier
// choice or a damaged one would have left it.
export const keepFilesWidth = (page: Page, value: string) =>
  page.evaluate(
    ([key, kept]) => {
      window.localStorage.setItem(key, kept);
    },
    [preferredWidthKey, value] as const,
  );

export function filesDividerOf(review: Locator) {
  const divider = review.getByRole("separator", {
    name: "Files divider",
    exact: true,
  });
  const sidebar = review.locator(".story-review-files");
  const diff = review.locator(".story-review-diff");
  const workarea = review.locator(".story-review-workarea");
  const page = review.page();
  const files = {
    divider,
    // The shown sidebar's and the diff's widths, the work area's, and the
    // room the two panes share: the work area less the gap between them.
    async widths() {
      const [shownSidebar, shownDiff, shownWorkarea, paneGap] =
        await Promise.all([
          box(sidebar),
          box(diff),
          box(workarea),
          workarea.evaluate(
            (area) => parseFloat(getComputedStyle(area).columnGap) || 0,
          ),
        ]);
      return {
        sidebar: shownSidebar.width,
        diff: shownDiff.width,
        workarea: shownWorkarea.width,
        room: shownWorkarea.width - paneGap,
        sideBySide: Math.abs(shownSidebar.y - shownDiff.y) < 1,
      };
    },
    // The divider's upper bound, in CSS px.
    async upperBound() {
      return Number(await divider.getAttribute("aria-valuemax"));
    },
    // Stacked: the sidebar spans the work area above the diff, at most two
    // fifths of its height, and no divider shows.
    async isStackedAboveTheDiff() {
      await expect(divider).toBeHidden();
      const [shownSidebar, shownDiff, shownWorkarea] = await Promise.all([
        box(sidebar),
        box(diff),
        box(workarea),
      ]);
      expect(shownSidebar.width).toBeCloseTo(shownWorkarea.width, 0);
      expect(shownSidebar.y + shownSidebar.height).toBeLessThanOrEqual(
        shownDiff.y,
      );
      expect(shownSidebar.height).toBeLessThanOrEqual(
        shownWorkarea.height * 0.4 + 1,
      );
      return files;
    },
    // While the sidebar is hidden: the diff's and the work area's widths.
    async hiddenSidebarWidths() {
      await expect(sidebar).toBeHidden();
      const [shownDiff, shownWorkarea] = await Promise.all([
        box(diff),
        box(workarea),
      ]);
      return { diff: shownDiff.width, workarea: shownWorkarea.width };
    },
    // Drags the divider sideways by `by` px and releases it there.
    async drag(by: number) {
      const { x, y, width, height } = await box(divider);
      const from = { x: x + width / 2, y: y + height / 2 };
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(from.x + by, from.y, { steps: 8 });
      await page.mouse.up();
      return files;
    },
    async press(key: "ArrowLeft" | "ArrowRight", count = 1) {
      await divider.focus();
      for (let press = 0; press < count; press += 1)
        await page.keyboard.press(key);
      return files;
    },
    async showsSidebarWidth(width: number) {
      await expect
        .poll(async () => Math.round((await box(sidebar)).width))
        .toBe(width);
      await expect(divider).toHaveAttribute("aria-valuenow", String(width));
      await expect(divider).toHaveAttribute(
        "aria-valuetext",
        `${String(width)} pixels wide`,
      );
      return files;
    },
    // The review offers this one Files divider.
    async isTheOnlyFilesDivider() {
      await expect(
        page.getByRole("separator", { name: "Files divider" }),
      ).toHaveCount(1);
      return files;
    },
    async setFilesShown(shown: boolean) {
      await review
        .getByRole("button", {
          name: shown ? "Show files" : "Hide files",
          exact: true,
        })
        .click();
      return files;
    },
    keptWidth: () =>
      page.evaluate(
        (key) => window.localStorage.getItem(key),
        preferredWidthKey,
      ),
  };
  return files;
}
