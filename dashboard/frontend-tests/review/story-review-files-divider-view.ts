// The Review changes panel's Files divider between its file sidebar and its
// diff (../../src/StoryReviewWorkarea.tsx) as a reviewer meets it
// (./story-review-panel-page.ts): the two panes' widths, the divider's
// bounds and words, dragging it by pointer and moving it by key, and the
// width this browser keeps.
import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { browserSession } from "./browser-session.ts";
import { box } from "./story-review-details-view.ts";

// CSS px at the dashboard's 16px root size.
export const rem = 16;
const keptWidthKey = "open-dough.storyReview.filesWidth";

// This browser's kept file sidebar width, as a reviewer's earlier choice or
// a damaged one left it; null when nothing is kept.
export const keptFilesWidth = () => window.localStorage.getItem(keptWidthKey);

export const keepFilesWidth = (value: string) => {
  window.localStorage.setItem(keptWidthKey, value);
};

export const forgetFilesWidth = () => {
  window.localStorage.removeItem(keptWidthKey);
};

// The left button's moves, press and release; a move holds it down.
type MouseEventParams = {
  type: "mouseMoved" | "mousePressed" | "mouseReleased";
  x: number;
  y: number;
};
const mouse = (params: MouseEventParams) =>
  browserSession().send("Input.dispatchMouseEvent", {
    ...params,
    button: "left",
    buttons: params.type === "mouseReleased" ? 0 : 1,
    clickCount: params.type === "mouseMoved" ? 0 : 1,
  });

export function reviewFilesDivider(region: Locator) {
  const divider = region.getByRole("separator", {
    name: "Files divider",
    exact: true,
  });
  const part = (name: string) => region.element().querySelector(name);

  const files = {
    // The shown sidebar's and the diff's widths, the work area's, and the
    // room the two panes share: the work area less the gap between them.
    async filesWidths() {
      await expect.element(divider).toBeVisible();
      const workarea = part(".story-review-workarea");
      const [sidebar, diff, area] = [
        box(part(".story-review-files")),
        box(part(".story-review-diff")),
        box(workarea),
      ];
      const gap =
        parseFloat(getComputedStyle(workarea as Element).columnGap) || 0;
      return {
        sidebar: sidebar.width,
        diff: diff.width,
        room: area.width - gap,
        sideBySide: Math.abs(sidebar.y - diff.y) < 1,
      };
    },

    // The sidebar is `width` px wide, and the divider says so.
    async expectSidebarWidth(width: number) {
      await expect
        .poll(() => Math.round(box(part(".story-review-files")).width))
        .toBe(width);
      await expect
        .element(divider)
        .toHaveAttribute("aria-valuenow", String(width));
      await expect
        .element(divider)
        .toHaveAttribute("aria-valuetext", `${String(width)} pixels wide`);
      return files;
    },

    // The divider's bounds, its how-to tooltip, and that it is the only one.
    async expectFilesDividerBounds(minimum: number, maximum: number) {
      await expect
        .element(divider)
        .toHaveAttribute("aria-valuemin", String(minimum));
      await expect
        .element(divider)
        .toHaveAttribute("aria-valuemax", String(maximum));
      await expect
        .element(divider)
        .toHaveAttribute(
          "title",
          "Drag, or use Left and Right, to resize the file sidebar",
        );
      expect(
        document.querySelectorAll(
          '[role="separator"][aria-label="Files divider"]',
        ).length,
      ).toBe(1);
      return files;
    },

    async expectNoFilesDivider() {
      await expect.poll(() => divider.query()).toBeNull();
      return files;
    },

    // While the sidebar is hidden: the diff's and the work area's widths.
    async hiddenSidebarWidths() {
      await expect
        .poll(() => part(".story-review-files")?.checkVisibility() ?? false)
        .toBe(false);
      return {
        diff: box(part(".story-review-diff")).width,
        workarea: box(part(".story-review-workarea")).width,
      };
    },

    // Drags the divider sideways by `by` px with the pointer, releasing it
    // there.
    async dragFilesDivider(by: number) {
      // Measured inside the Vitest frame, which the containing page may
      // scale; the pointer moves in that page.
      await expect.element(divider).toBeVisible();
      const frame = window.frameElement?.getBoundingClientRect();
      const scale = frame ? frame.width / window.innerWidth : 1;
      const { x, y, width, height } = box(divider.element());
      const at = (inside: { x: number; y: number }) => ({
        x: (frame?.left ?? 0) + inside.x * scale,
        y: (frame?.top ?? 0) + inside.y * scale,
      });
      const start = { x: x + width / 2, y: y + height / 2 };
      const from = at(start);
      await mouse({ type: "mousePressed", ...from });
      for (let step = 1; step <= 8; step += 1)
        await mouse({
          type: "mouseMoved",
          ...at({ x: start.x + (by * step) / 8, y: start.y }),
        });
      await mouse({
        type: "mouseReleased",
        ...at({ x: start.x + by, y: start.y }),
      });
      return files;
    },

    async pressOnFilesDivider(key: "ArrowLeft" | "ArrowRight", count = 1) {
      await expect.element(divider).toBeVisible();
      (divider.element() as HTMLElement).focus();
      for (let press = 0; press < count; press += 1)
        await userEvent.keyboard(`{${key}}`);
      return files;
    },
  };
  return files;
}
