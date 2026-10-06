// A focused control remains wholly readable below the pinned banner while
// facts enrich the scrolled page, allowing natural content reflow.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";

export async function expectVisibleReadingFocus(page: Page, control: Locator) {
  await expect(control).toBeFocused();
  await expect(control).toBeInViewport({ ratio: 1 });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
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
