// The Board's layout and scrolling: which columns fill its view, how cards
// share that room, whether a move slid, and where the shown columns end.
// Column selection and paging live in ./boardColumnNavigation.ts and remain
// available here to the journeys that combine navigation with these checks.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import {
  columns,
  columnRegion,
  columnPagingControls,
  type ColumnName,
} from "./boardColumnNavigation.ts";

export {
  columns,
  columnRegion,
  columnPagingControl,
  columnPagingControls,
  showColumn,
  expectRowRestsShowing,
  type ColumnName,
} from "./boardColumnNavigation.ts";

export const rem = 16;
// The slim room each side's column paging control takes while Columns are paged.
export const pagingRoom = 1.75 * rem;
// Exactly the `shown` columns show, whole and side by side in order, filling
// the Board except for its Column paging controls' slim room; every other column lies wholly
// outside the columns' view, which cuts it off. The controls are exactly
// those named in `controls`, each in view, read as a column's name and its
// count; and the Board never scrolls sideways.
export async function expectView(
  page: Page,
  shown: readonly ColumnName[],
  controls: readonly (string | RegExp)[],
  cutByDesign: readonly string[] = [],
) {
  await expect(columnPagingControls(page)).toHaveText([...controls]);
  for (const control of await columnPagingControls(page).all()) {
    await expect(control).toBeInViewport({ ratio: 1 });
  }
  const view = await box(page.locator(".board-view"));
  await expect
    .poll(async () => {
      const boxes = await Promise.all(
        columns.map(async (column) => box(columnRegion(page, column))),
      );
      return columns.map((column, index) => {
        const at = boxes[index];
        if (at === undefined) return `${column}: none`;
        const inside =
          at.x >= view.x - 0.5 && at.x + at.width <= view.x + view.width + 0.5;
        const outside =
          at.x + at.width <= view.x + 0.5 || at.x >= view.x + view.width - 0.5;
        return `${column}: ${inside ? "shown" : outside ? "hidden" : "cut"}`;
      });
    }, "which columns show")
    .toEqual(
      columns.map(
        (column) => `${column}: ${shown.includes(column) ? "shown" : "hidden"}`,
      ),
    );
  const boxes = await Promise.all(
    shown.map((column) => box(columnRegion(page, column))),
  );
  const first = boxes[0];
  const last = boxes.at(-1);
  if (first === undefined || last === undefined) throw new Error("none shown");
  // The shown columns fill their available view and share it equally,
  // whether its sides reserve touch paging controls, mouse paging controls, or Board margins.
  expect(last.x + last.width - first.x).toBeGreaterThanOrEqual(view.width - 1);
  for (const at of boxes) {
    expect(Math.abs(at.width - first.width)).toBeLessThanOrEqual(1);
  }
  await expectNoSidewaysScrollAndWholeText(page, cutByDesign);
}

// A Backlog card is no narrower than its share of the Board would make it in
// today's framing, without column paging controls: the Board's side margins (4vw,
// from 0.75rem to 1.5rem), a 1rem gap between columns, and each column's 1rem
// padding and border on both sides.
export async function expectStoryCardsKeepTheirShare(
  page: Page,
  shown: number,
) {
  const width = await boardScroll(page).evaluate(
    (region) => region.clientWidth,
  );
  const window = page.viewportSize()?.width ?? 0;
  const margin = Math.min(1.5 * rem, Math.max(0.75 * rem, 0.04 * window));
  const share =
    (width - 2 * margin - (shown - 1) * rem) / shown - 2 * (rem + 1);
  const card = await box(parts(page).backlog.getByRole("article").first());
  expect(card.width).toBeGreaterThanOrEqual(share - 0.5);
}

// Each move by a column paging control slides the row, or moves it at once.
export async function recordSlides(page: Page) {
  await page.evaluate(() => {
    const counted = window as unknown as { slides: number };
    counted.slides = 0;
    document.addEventListener("transitionrun", (event) => {
      if (event.propertyName === "transform") counted.slides += 1;
    });
  });
}
export const slidesOf = (page: Page) =>
  page.evaluate(() => (window as unknown as { slides: number }).slides);

// How long the Board is against the columns it shows: as far as it
// scrolls, read with the wheel as a developer reads, and whether it ends
// with the shown columns.

// The Board's ordinary framing below the columns' end.
const framing = 3 * rem;

export const boardScroll = (page: Page) => page.locator(".board-scroll");
export const scrollYOf = (page: Page) =>
  boardScroll(page).evaluate((region) => region.scrollTop);
export const bottomOf = (page: Page) =>
  boardScroll(page).evaluate(
    (region) => region.scrollHeight - region.clientHeight,
  );
export const extentOf = (page: Page) =>
  boardScroll(page).evaluate((region) => region.scrollHeight);

// Wheels the Board to `y` as a developer reads, by exactly as far as is left,
// so no wheel movement outlasts the read. Wheel only on a settled page
// (`expectSettledPage`): a card above the reading place that lengthens later
// keeps the developer on what they read, so the Board's scroll place moves
// with it.
export async function wheelTo(page: Page, y: number) {
  const left = y - (await scrollYOf(page));
  const region = await box(boardScroll(page));
  await page.mouse.move(
    region.x + region.width / 2,
    region.y + region.height / 2,
  );
  if (left !== 0) await page.mouse.wheel(0, left);
  await expect.poll(() => scrollYOf(page)).toBe(y);
}

// Where a part ends, measured from the top of the Board.
async function endOf(part: Locator) {
  const { y, height } = await box(part);
  return (
    y +
    height -
    (await box(boardScroll(part.page()))).y +
    (await scrollYOf(part.page()))
  );
}

// A part starts below the pinned banner, not under it.
export async function expectBelowBanner(part: Locator) {
  const banner = await box(parts(part.page()).banner);
  expect((await box(part)).y).toBeGreaterThanOrEqual(banner.y + banner.height);
}

// Read to its end, the Board shows the end of the longest `shown` column, or
// of its column paging controls' room where that is longer, followed by no more than
// its ordinary framing.
export async function expectEndsWithShown(
  page: Page,
  shown: readonly ColumnName[],
) {
  await wheelTo(page, await bottomOf(page));
  const ends = await Promise.all([
    ...shown.map((column) => endOf(columnRegion(page, column))),
    ...(await columnPagingControls(page).all()).map(endOf),
  ]);
  const shownEnd = Math.max(...ends);
  const blank = (await extentOf(page)) - shownEnd;
  expect(blank, "blank Board below the shown Columns").toBeGreaterThanOrEqual(
    0,
  );
  expect(blank, "blank Board below the shown Columns").toBeLessThanOrEqual(
    framing,
  );
}

// A part of a hidden column lies further down than the Board reaches: its
// content is longer than the shown columns' and would leave a blank tail
// were it counted.
export async function expectLongerThanTheBoard(part: Locator) {
  expect(await endOf(part)).toBeGreaterThan(
    (await extentOf(part.page())) + framing,
  );
}
