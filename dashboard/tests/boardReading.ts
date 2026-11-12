// Reading down the long Board as a developer does: wheeling its own scroll
// region by a distance, pressing its scrollbar track, and seeing where the
// reading stops, while the document itself stays still and a column paging
// control stays in sight. The Board's scroll place and extent are measured in
// ./boardPage.ts; journeys supply every expected place and column.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  boardScroll,
  bottomOf,
  columnPagingControl,
  scrollYOf,
  wheelTo,
  type ColumnName,
} from "./boardPage.ts";
import { box } from "./pageLayout.ts";

// Wheels the Board `distance` further down (up when negative) from where it
// is read, exactly as `wheelTo` does.
export async function wheelBy(page: Page, distance: number) {
  await wheelTo(page, (await scrollYOf(page)) + distance);
}

// Presses the Board's own scrollbar track near its foot with the mouse, as a
// developer pages down with a classic scrollbar: in the scroll region's last
// pixel column, below the thumb of a Board read from its top.
export async function pressScrollbarTrack(page: Page) {
  const region = await box(boardScroll(page));
  await page.mouse.click(
    region.x + region.width - 1,
    region.y + region.height - 24,
  );
}

// Waits until the Board's scroll place reads the same twice in a row: the
// movement a press or wheel began has ended.
export async function untilBoardRests(page: Page) {
  let last: number | undefined;
  await expect
    .poll(async () => {
      const now = await scrollYOf(page);
      const still = now === last;
      last = now;
      return still;
    }, "the Board comes to rest")
    .toBe(true);
}

// The Board is read to its bottom: its scroll place is as far as it scrolls.
// Returns that place for the journey's own comparisons.
export async function expectAtBoardBottom(page: Page) {
  const place = await scrollYOf(page);
  expect(place, "the Board read to its bottom").toBe(await bottomOf(page));
  return place;
}

// The document never scrolls: the Board, or another region that scrolls on
// its own, moves inside a still page.
export async function expectDocumentStill(page: Page) {
  expect(
    await page.evaluate(() => scrollY),
    "the document's own scroll place",
  ).toBe(0);
}

// The paging control naming `column` shows whole in the window wherever the
// Board is read.
export async function expectPagingControlInSight(
  page: Page,
  column: ColumnName,
) {
  await expect(columnPagingControl(page, column)).toBeInViewport({
    ratio: 1,
  });
}
