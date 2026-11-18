// A review's Files divider between its file sidebar and its diff
// (../src/StoryReviewWorkarea.tsx), and the two panes' widths as shown.

import type { Locator } from "@playwright/test";
import { box } from "./pageLayout.ts";
import { expect } from "./support/frontendApp.ts";

// CSS px at the dashboard's 16px root size.
export const rem = 16;
const preferredWidthKey = "open-dough.storyReview.filesWidth";

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
    // The shown sidebar's and the diff's widths, and the work area's.
    async widths() {
      const [shownSidebar, shownDiff, shownWorkarea] = await Promise.all([
        box(sidebar),
        box(diff),
        box(workarea),
      ]);
      return {
        sidebar: shownSidebar.width,
        diff: shownDiff.width,
        workarea: shownWorkarea.width,
        sideBySide: Math.abs(shownSidebar.y - shownDiff.y) < 1,
      };
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
