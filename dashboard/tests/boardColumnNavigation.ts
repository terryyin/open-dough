// The Board Columns, left to right, and their paging. Journeys reach a hidden
// column through its column paging control or focus, as a developer does;
// the product has no test-only way in. Geometry checks live in ./boardPage.ts.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { box } from "./pageLayout.ts";
import { expectFocusedAndIndicated } from "./accessibleReading.ts";
import { tapNarrowControlWhereShown } from "./controlReachability.ts";
import { strokeByTouch } from "./touchGestures.ts";

// The columns, each a region, and the column paging controls, each naming a hidden
// column with how many entries it holds.
export const columns = ["Backlog", "Taken", "Recently done"] as const;
export type ColumnName = (typeof columns)[number];
export function columnRegion(page: Page, column: ColumnName): Locator {
  const { backlog, taken, recentlyDone } = parts(page);
  return { Backlog: backlog, Taken: taken, "Recently done": recentlyDone }[
    column
  ];
}
const controlName = (named: string) =>
  new RegExp(`^(${named}) (\\d+ entr(y|ies)|Entry count incomplete)$`);
export const columnPagingControl = (page: Page, column: ColumnName) =>
  page.getByRole("button", { name: controlName(column) });
export const columnPagingControls = (page: Page) =>
  page.getByRole("button", { name: controlName(columns.join("|")) });

// Where this browser keeps the Board's position (../src/columnPaging.ts), and
// the position kept there now.
export const boardPositionKey = "open-dough.board.position";
export const keptBoardPosition = (page: Page) =>
  page.evaluate((key) => localStorage.getItem(key), boardPositionKey);

// Where a control lies now, read without waiting for it: a control the Board
// is about to drop can leave between two waiting reads and hold the second.
async function shownX(control: Locator) {
  const [x] = await control.evaluateAll((found) =>
    found.map((element) => element.getBoundingClientRect().x),
  );
  return x;
}

async function pagingControlToward(page: Page, target: number) {
  let toward: ColumnName | "none" = "none";
  for (const [index, name] of columns.entries()) {
    const x = await shownX(columnPagingControl(page, name));
    if (x === undefined) continue;
    // A control lies between the shown columns and the one it names.
    const right = (await box(columnRegion(page, name))).x > x;
    if (right ? target >= index : target <= index) toward = name;
  }
  return toward;
}

// Brings a Board Column into view as a developer does where the Board has
// no room for all three: by pressing the column paging control toward it, once per
// column the view has to move, each once the row rests after the last. A
// shown column needs no move.
export async function showColumn(page: Page, column: ColumnName) {
  const target = columns.indexOf(column);
  const region = columnRegion(page, column);
  const rested = async () => {
    // Data must attach before observing motion; paged columns keep a box
    // with zero height until shown, so visibility would block their paging.
    await region.waitFor({ state: "attached" });
    let last: number | undefined;
    await expect
      .poll(async () => {
        const { x } = await box(region);
        const still = x === last;
        last = x;
        return still;
      }, "the row rests")
      .toBe(true);
  };
  for (let moves = 0; moves < columns.length; moves += 1) {
    await rested();
    // A control left from a narrower Board stays until the Board remeasures,
    // so a control counts once two readings in a row name it.
    const seen: { control: ColumnName | "none" } = { control: "none" };
    await expect
      .poll(async () => {
        const previous = seen.control;
        seen.control = await pagingControlToward(page, target);
        if (seen.control !== "none") return seen.control === previous;
        // A resize can place the column outside the view before its paging
        // controls render. No control means no move only once it fits.
        const [at, view] = await Promise.all([
          box(region),
          box(page.locator(".board-view")),
        ]);
        return (
          at.x >= view.x - 0.5 && at.x + at.width <= view.x + view.width + 0.5
        );
      }, "the column fits or its paging control is ready")
      .toBe(true);
    if (seen.control === "none") return;
    const toward = columnPagingControl(page, seen.control);
    // Scrolled to first where the row starts below the window, as a
    // developer would, then pressed in the part the window shows.
    const window = page.viewportSize() ?? { width: 0, height: 0 };
    const at = await box(toward);
    if (at.y + at.height <= 0 || at.y >= window.height) {
      await toward.scrollIntoViewIfNeeded();
    }
    const { x, y, width, height } = await box(toward);
    const shownTo = Math.min(y + height, window.height);
    // The press is heard in a later turn, so the row standing still between
    // two readings does not yet say it moved: wait for the row to name its
    // new leftmost column and for that slide to end.
    const row = page.locator(".board-row");
    const from = await row.getAttribute("style");
    await page.mouse.click(x + width / 2, (Math.max(y, 0) + shownTo) / 2);
    await expect(row).not.toHaveAttribute("style", from ?? "");
    await expect(row).not.toHaveAttribute("data-sliding");
  }
  await rested();
}

// A column the Board brings into view by itself, as a reveal does, shows once
// the row rests there: until then the departing column still lengthens it.
export async function expectRowRestsShowing(page: Page, column: ColumnName) {
  const row = page.locator(".board-row");
  const place = columns.indexOf(column) + 1;
  const hidden = new RegExp(`(^| )${String(place)}( |$)`);
  await expect(row).not.toHaveAttribute("data-hidden", hidden);
  await expect(row).not.toHaveAttribute("data-sliding");
}

// Swipe the Board reading surface, optionally starting on a particular card
// or action. Keep the whole native stroke inside the visible Board.
export async function swipeBoard(
  page: Page,
  direction: "left" | "right",
  options: { from?: Locator; distance?: number; cancel?: boolean } = {},
) {
  const view = await box(page.locator(".board-view"));
  const target =
    options.from === undefined ? undefined : await box(options.from);
  const screen = page.viewportSize() ?? { width: 390, height: 844 };
  const x = target
    ? target.x + target.width / 2
    : view.x + view.width * (direction === "left" ? 0.8 : 0.2);
  const y = target
    ? target.y + target.height / 2
    : Math.min(view.y + 100, screen.height - 40);
  const room =
    direction === "left" ? x - view.x - 5 : view.x + view.width - x - 5;
  const distance = Math.min(options.distance ?? 180, room);
  await strokeByTouch(
    page,
    { x, y },
    { x: distance * (direction === "left" ? -1 : 1), y: 0 },
    options.cancel,
  );
}

// The developer explicitly trades indicator width for story reading room.
// This Board-only operation retains native hit testing for the thin target.
export async function tapColumnIndicator(page: Page, column: ColumnName) {
  await tapNarrowControlWhereShown(columnPagingControl(page, column));
}

export async function focusColumnIndicator(page: Page, column: ColumnName) {
  // Tabbing through hidden cards reveals their columns before the edge control.
  await page.keyboard.press("Tab");
  await columnPagingControl(page, column).focus();
}

export async function activateColumnIndicator(page: Page, column: ColumnName) {
  await columnPagingControl(page, column).press("Enter");
}

export async function expectColumnIndicatorFocused(
  page: Page,
  column: ColumnName,
) {
  await expectFocusedAndIndicated(page, columnPagingControl(page, column));
}
