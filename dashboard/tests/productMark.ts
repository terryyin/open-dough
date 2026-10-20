// Open Dough's mark (../src/ProductMark.tsx): the product's passive identity
// in a top-level view, whichever project is selected. A view shows it once,
// named "Open Dough" for assistive technology; it is the supplied icon export
// the dashboard serves (./support/brandIcons.ts), decoded and drawn square,
// whole inside its area and the window, on top of whatever else is there; and
// it is neither a keyboard stop nor a link or other control.

/// <reference lib="dom" />

import { expect, type Locator } from "@playwright/test";
import { expectSuppliedIcon } from "./support/brandIcons.ts";
import { expectInside } from "./pageLayout.ts";

export async function expectProductMark(area: Locator) {
  const mark = area.getByRole("img", { name: "Open Dough", exact: true });
  await expect(mark).toHaveCount(1);
  await expect(mark).toBeVisible();
  await expect(mark).toBeInViewport({ ratio: 1 });
  await expectInside(mark, area);
  const shown = await mark.evaluate((element) => {
    const image = element as HTMLImageElement;
    const { x, y, width, height } = image.getBoundingClientRect();
    return {
      source: image.currentSrc,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width,
      height,
      onTop: document.elementFromPoint(x + width / 2, y + height / 2) === image,
      tabIndex: image.tabIndex,
      insideControl:
        image.closest("a, button, summary, label, [role], [tabindex]") !== null,
    };
  });
  expect(new URL(shown.source).pathname).toMatch(/^\/icon-\d+\.png$/);
  await expectSuppliedIcon(await area.page().request.get(shown.source));
  expect(shown.complete).toBe(true);
  expect(shown.naturalWidth).toBeGreaterThan(0);
  // Undistorted: drawn at the export's own square proportions, and at no
  // more than its pixels so it stays sharp on a double-density screen.
  expect(shown.naturalWidth).toBe(shown.naturalHeight);
  expect(shown.width).toBeCloseTo(shown.height, 1);
  expect(shown.width).toBeGreaterThanOrEqual(16);
  expect(shown.width * 2).toBeLessThanOrEqual(shown.naturalWidth);
  expect(shown.onTop, "nothing covers the mark").toBe(true);
  expect(shown.tabIndex, "the mark is no keyboard stop").toBe(-1);
  expect(shown.insideControl, "the mark is no control or link").toBe(false);
}
