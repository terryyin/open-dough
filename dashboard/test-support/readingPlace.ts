// Reading places below the pinned banner: a revealed card's beginning, or
// a focused control retained while facts enrich the scrolled page.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { scrollYOf } from "./boardPage.ts";

// A card with enough Board content after it aligns with the configured reading
// edge, including the clearance for the sticky column heading: the CSS reading
// edge matches, and the card's top stays at or below that heading's bottom so
// the heading does not cover the box.
export async function expectReadingTop(card: Locator) {
  await expect
    .poll(() =>
      card.evaluate((element) => {
        const region = element.closest(".board-scroll");
        if (!region) throw new Error("No Board scroll region");
        const heading = element
          .closest(".column, .recently-done")
          ?.querySelector(".column-header");
        if (!heading) throw new Error("No sticky column heading");
        const padding = getComputedStyle(region);
        const margin = getComputedStyle(element);
        const at = element.getBoundingClientRect();
        const edge = Math.abs(
          at.top -
            region.getBoundingClientRect().top -
            Number.parseFloat(padding.scrollPaddingTop) -
            Number.parseFloat(margin.scrollMarginTop),
        );
        const clearance = at.top - heading.getBoundingClientRect().bottom;
        if (edge > 1) return `reading-edge off by ${String(edge)}px`;
        if (clearance < 0)
          return `sticky heading covers ${String(-clearance)}px`;
        return "at reading edge, clear of sticky heading";
      }),
    )
    .toBe("at reading edge, clear of sticky heading");
}

export async function expectVisibleReadingFocus(page: Page, control: Locator) {
  await expect(control).toBeFocused();
  await expect(control).toBeInViewport({ ratio: 1 });
  await expect.poll(() => scrollYOf(page)).toBeGreaterThan(0);
  // Intersection alone would also count a control hidden under the banner.
  const banner = await parts(page).banner.boundingBox();
  const at = await control.boundingBox();
  expect(at?.y).toBeGreaterThanOrEqual(
    (banner?.y ?? 0) + (banner?.height ?? 0),
  );
  expect((at?.y ?? 0) + (at?.height ?? 0)).toBeLessThanOrEqual(
    page.viewportSize()?.height ?? 0,
  );
}
