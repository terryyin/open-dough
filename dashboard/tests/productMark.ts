// Open Dough's mark (../src/ProductMark.tsx): the product's identity in a
// top-level view. Passive placements (unconfigured banner, System settings)
// are named "Open Dough", never a keyboard stop or control. The Sessions
// toggle hosts the same mark as its decorative visual; use
// expectFrameIconControl for that control.

/// <reference lib="dom" />

import { expect, type Locator } from "@playwright/test";
import { expectSuppliedIcon } from "./support/brandIcons.ts";
import { expectInside } from "./pageLayout.ts";

// Shared icon export and square draw checks for both placements.
async function expectProductMarkImage(mark: Locator) {
  const shown = await mark.evaluate((element) => {
    const image = element as HTMLImageElement;
    return {
      source: image.currentSrc,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: image.getBoundingClientRect().width,
      height: image.getBoundingClientRect().height,
    };
  });
  expect(new URL(shown.source).pathname).toMatch(/^\/icon-\d+\.png$/);
  await expectSuppliedIcon(await mark.page().request.get(shown.source));
  expect(shown.complete).toBe(true);
  expect(shown.naturalWidth).toBe(shown.naturalHeight);
  expect(shown.width).toBeCloseTo(shown.height, 1);
  expect(shown.width).toBeGreaterThanOrEqual(16);
  expect(shown.width * 2).toBeLessThanOrEqual(shown.naturalWidth);
  return shown;
}

export async function expectProductMark(area: Locator) {
  const mark = area.getByRole("img", { name: "Open Dough", exact: true });
  await expect(mark).toHaveCount(1);
  await expect(mark).toBeVisible();
  await expect(mark).toBeInViewport({ ratio: 1 });
  await expectInside(mark, area);
  const placement = await mark.evaluate((element) => {
    const image = element as HTMLImageElement;
    const { x, y, width, height } = image.getBoundingClientRect();
    return {
      onTop: document.elementFromPoint(x + width / 2, y + height / 2) === image,
      tabIndex: image.tabIndex,
      insideControl:
        image.closest("a, button, summary, label, [role], [tabindex]") !== null,
    };
  });
  await expectProductMarkImage(mark);
  expect(placement.onTop, "nothing covers the mark").toBe(true);
  expect(placement.tabIndex, "the mark is no keyboard stop").toBe(-1);
  expect(placement.insideControl, "the mark is no control or link").toBe(false);
}

// The Sessions toggle's decorative product mark: same supplied icon and
// square draw as the passive mark, hosted inside the named Sessions control.
export async function expectSessionsProductMark(control: Locator) {
  const mark = control.locator("img.product-mark");
  await expect(mark).toHaveCount(1);
  await expect(mark).toBeVisible();
  const placement = await mark.evaluate((element) => {
    const image = element as HTMLImageElement;
    return {
      alt: image.getAttribute("alt"),
      ariaHidden: image.getAttribute("aria-hidden"),
      insideSessions: image.closest("button[aria-label='Sessions']") !== null,
    };
  });
  await expectProductMarkImage(mark);
  expect(placement.alt).toBe("");
  expect(placement.ariaHidden).toBe("true");
  expect(placement.insideSessions).toBe(true);
}
