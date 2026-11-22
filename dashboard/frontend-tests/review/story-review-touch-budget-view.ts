// The Review changes panel's room above its code on a short touch screen
// (./story-review-panel-page.ts): the one height budget revealed details and
// status share above the work area, reaching the status by native scrolling,
// and the code pane left below them.
import { expect } from "vitest";
import type { Locator } from "vitest/browser";
import { box } from "./story-review-details-view.ts";

export function reviewTouchBudget(region: Locator) {
  const part = (name: string) => {
    const found = region.element().querySelector(name);
    if (!found) throw new Error(`The review shows no ${name}.`);
    return found;
  };
  const codeOf = (file: string) =>
    region
      .getByRole("region", { name: file, exact: true })
      .element()
      .querySelector(".story-review-code");
  const inView = (element: Element) => {
    const at = element.getBoundingClientRect();
    return at.height > 0 && at.top >= 0 && at.bottom <= window.innerHeight + 1;
  };

  const budget = {
    // Visible height from the toolbar's bottom to the work area's top, the
    // budget the details and status share there, and their height.
    measureAboveBody() {
      const above = part(".story-review-above");
      return {
        visible:
          box(part(".story-review-body")).top -
          box(part(".story-review-toolbar")).bottom,
        budget: parseFloat(getComputedStyle(above).maxHeight),
        aboveHeight: box(above).height,
      };
    },

    // Scrolls the status above the work area into view, as touch reading
    // reaches it, with the panel and the document staying where they are and
    // no scrolling region clipping the status.
    async reachFeedback() {
      const feedback = part(".story-review-top [role=status]");
      const panel = box(region.element()).toJSON() as unknown;
      const page = window.scrollY;
      feedback.scrollIntoView({ block: "nearest" });
      expect(box(region.element()).toJSON()).toEqual(panel);
      expect(window.scrollY).toBe(page);
      const at = box(feedback);
      const clipping = [];
      for (let parent = feedback.parentElement; parent;) {
        const area = box(parent);
        if (
          getComputedStyle(parent).overflowY !== "visible" &&
          (at.top < area.top - 1 || at.bottom > area.bottom + 1)
        )
          clipping.push(parent.className);
        parent = parent.parentElement;
      }
      expect(clipping, "the status fits its scrolling regions").toEqual([]);
      await expect.poll(() => inView(feedback)).toBe(true);
      return budget;
    },

    // The file's code pane height, in CSS px, now.
    codeHeight(file: string) {
      return box(codeOf(file)).height;
    },

    async expectCodeLineInView(file: string, line: string) {
      const shown = region
        .getByRole("region", { name: file, exact: true })
        .getByText(line, { exact: true });
      await expect.element(shown).toBeVisible();
      await expect.poll(() => inView(shown.element())).toBe(true);
      return budget;
    },
  };
  return budget;
}
