// Reading down the long Board as a developer does: wheeling its own scroll
// region by a distance, pressing its scrollbar track or a reading key, and
// seeing where the reading stops, while the document itself stays still and
// a column paging control stays in sight. The Board's scroll place and extent
// are measured in ./boardPage.ts; journeys supply every expected place, key
// and column.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  boardScroll,
  bottomOf,
  columnPagingControl,
  scrollYOf,
  wheelTo,
  type ColumnName,
} from "./boardPage.ts";
import { box, expectInside } from "./pageLayout.ts";

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

// Where a reading key moves the page: the Board's own scroll region, or the
// ordinary document a journey compares the Board with.
export type ReadingRegion = "board" | "document";

// Presses a reading key, such as End or PageDown, as a developer does, and
// waits until `region` reports `scrollend`: the key's scrolling has ended.
// That ending is heard from before the press, so a quick scroll cannot end
// unheard. The press follows two drawn frames, because native key scrolling
// acts on the scroll place and extent the page last drew, which lag its
// layout while the machine is busy. Journeys read where the region stopped.
export async function readWithKey(
  page: Page,
  key: string,
  region: ReadingRegion = "board",
) {
  const scroller =
    region === "document" ? page.locator(":root") : boardScroll(page);
  const ending = await scroller.evaluateHandle((element, ofDocument) => {
    const target = ofDocument ? element.ownerDocument : element;
    return {
      ended: new Promise<void>((resolve) => {
        target.addEventListener(
          "scrollend",
          () => {
            resolve();
          },
          { once: true },
        );
      }),
    };
  }, region === "document");
  await page.evaluate(async () => {
    for (let frame = 0; frame < 2; frame += 1)
      await new Promise((drawn) => requestAnimationFrame(drawn));
  });
  await page.keyboard.press(key);
  await ending.evaluate(({ ended }) => ended);
  await ending.dispose();
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

// A part of `card`, brought into view where the Board holds it, reads whole:
// it shows entirely in the window and stays inside its card, long text
// wrapping rather than running past it.
export async function expectReadWholeInCard(part: Locator, card: Locator) {
  await part.scrollIntoViewIfNeeded();
  await expect(part).toBeInViewport({ ratio: 1 });
  await expectInside(part, card);
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
