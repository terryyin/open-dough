// The Board Columns, left to right, and their paging. Journeys reach a hidden
// column through its column paging control or focus, as a developer does;
// the product has no test-only way in. Geometry checks live in ./boardPage.ts.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { box } from "./pageLayout.ts";

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

async function pagingControlToward(page: Page, target: number) {
  let toward: Locator | undefined;
  for (const [index, name] of columns.entries()) {
    const control = columnPagingControl(page, name);
    if ((await control.count()) === 0) continue;
    // A control lies between the shown columns and the one it names.
    const right =
      (await box(columnRegion(page, name))).x > (await box(control)).x;
    if (right ? target >= index : target <= index) toward = control;
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
    const choice: { control: Locator | undefined } = { control: undefined };
    await expect
      .poll(async () => {
        choice.control = await pagingControlToward(page, target);
        if (choice.control !== undefined) return true;
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
    const toward = choice.control;
    if (toward === undefined) return;
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
