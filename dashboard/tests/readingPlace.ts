// Reading places below the pinned banner: a revealed card's beginning, or
// a focused control retained while facts enrich the scrolled page.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";

// A card with enough page after it aligns with the configured reading edge,
// including the clearance for the sticky column heading.
export async function expectReadingTop(card: Locator) {
  await expect
    .poll(() =>
      card.evaluate((element) => {
        const region = element.closest(".board-scroll");
        if (!region) throw new Error("No Board scroll region");
        const padding = getComputedStyle(region);
        const margin = getComputedStyle(element);
        return Math.abs(
          element.getBoundingClientRect().top -
            region.getBoundingClientRect().top -
            Number.parseFloat(padding.scrollPaddingTop) -
            Number.parseFloat(margin.scrollMarginTop),
        );
      }),
    )
    .toBeLessThanOrEqual(1);
}

export async function expectVisibleReadingFocus(page: Page, control: Locator) {
  await expect(control).toBeFocused();
  await expect(control).toBeInViewport({ ratio: 1 });
  await expect
    .poll(() =>
      page.locator(".board-scroll").evaluate((region) => region.scrollTop),
    )
    .toBeGreaterThan(0);
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
