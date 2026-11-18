// How a reader finds the pinned banner (../src/banner.css): pinned and short,
// its controls on one row in the order the caller expects, its keyboard stops,
// and content starting below it.

import { expect, type Locator, type Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";
import { box, expectSideBySideInOrder } from "./partArrangement.ts";

// The banner sits at the top of the window and takes less than half of its
// height.
export async function expectPinnedShortBanner(
  page: Page,
  windowHeight: number,
) {
  const pinned = await box(parts(page).banner);
  expect(pinned.y).toBe(0);
  expect(pinned.height).toBeLessThan(windowHeight / 2);
}

// The controls, given in their expected order, lie side by side on the
// banner's one row, each centred on the same line.
export async function expectBannerRow(inOrder: Locator[]) {
  await expectSideBySideInOrder(inOrder);
  const middles = (await Promise.all(inOrder.map(box))).map(
    ({ y, height }) => y + height / 2,
  );
  for (const middle of middles) expect(middle).toBeCloseTo(middles[0] ?? 0, 0);
}

// The banner's shown keyboard stops, in document order.
export function bannerStops(page: Page): Locator {
  return parts(page)
    .banner.locator(
      "button, input, select, textarea, summary, a[href], [tabindex]",
    )
    .filter({ visible: true });
}

// A part starts below the pinned banner, not under it.
export async function expectBelowBanner(part: Locator) {
  const banner = await box(parts(part.page()).banner);
  expect((await box(part)).y).toBeGreaterThanOrEqual(banner.y + banner.height);
}
