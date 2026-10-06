// The dashboard columns, left to right, and their paging: each column a
// region, the edge controls naming hidden ones, bringing a column into view
// as a developer does, and what the paging journeys
// (./dashboard-columns-paging*.spec.ts) observe: which columns show and fill
// the page, which edge controls offer which column, whether cards keep their
// share of the page, and whether a move slid.
// Journeys reach a hidden column only as a developer does, through an edge
// control or focus, by `showColumn`; the product has no test-only way in.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { box, expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";

// The columns, each a region, and the edge controls, each naming a hidden
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
export const edgeControl = (page: Page, column: ColumnName) =>
  page.getByRole("button", { name: controlName(column) });
export const edgeControls = (page: Page) =>
  page.getByRole("button", { name: controlName(columns.join("|")) });

// Brings a dashboard column into view as a developer does where the page has
// no room for all three: by pressing the edge control toward it, once per
// column the view has to move, each once the row rests after the last. A
// shown column needs no move.
export async function showColumn(page: Page, column: ColumnName) {
  const target = columns.indexOf(column);
  const region = columnRegion(page, column);
  const rested = async () => {
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
    let toward: Locator | undefined;
    for (const [index, name] of columns.entries()) {
      const control = edgeControl(page, name);
      if ((await control.count()) === 0) continue;
      // A control lies between the shown columns and the one it names.
      const right =
        (await box(columnRegion(page, name))).x > (await box(control)).x;
      if (right ? target >= index : target <= index) toward = control;
    }
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
    await page.mouse.click(x + width / 2, (Math.max(y, 0) + shownTo) / 2);
  }
  await rested();
}

export const rem = 16;
// The slim room each side's edge control takes while the columns page.
export const edgeRoom = 1.75 * rem;
// Exactly the `shown` columns show, whole and side by side in order, filling
// the page but its edge controls' slim room; every other column lies wholly
// outside the columns' view, which cuts it off. The controls are exactly
// those named in `controls`, each in view, read as a column's name and its
// count; and the page never scrolls sideways.
export async function expectView(
  page: Page,
  shown: readonly ColumnName[],
  controls: readonly string[],
  cutByDesign: readonly string[] = [],
) {
  await expect(edgeControls(page)).toHaveText([...controls]);
  for (const control of await edgeControls(page).all()) {
    await expect(control).toBeInViewport({ ratio: 1 });
  }
  const pageColumn = await box(page.locator(".page-column"));
  const view = await box(page.locator(".dashboard-columns-view"));
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
  // The shown columns fill the page but the edge controls' room and share
  // it equally.
  expect(last.x + last.width - first.x).toBeGreaterThanOrEqual(
    pageColumn.width - 2 * edgeRoom - 1,
  );
  for (const at of boxes) {
    expect(Math.abs(at.width - first.width)).toBeLessThanOrEqual(1);
  }
  await expectNoSidewaysScrollAndWholeText(page, cutByDesign);
}

// A Backlog card is no narrower than its share of the page would make it in
// today's framing, without edge controls: the page's side margins (4vw,
// from 0.75rem to 1.5rem), a 1rem gap between columns, and each column's 1rem
// padding and border on both sides.
export async function expectCardsKeepTheirShare(page: Page, shown: number) {
  const pageColumn = await box(page.locator(".page-column"));
  const window = page.viewportSize()?.width ?? 0;
  const margin = Math.min(1.5 * rem, Math.max(0.75 * rem, 0.04 * window));
  const share =
    (pageColumn.width - 2 * margin - (shown - 1) * rem) / shown - 2 * (rem + 1);
  const card = await box(parts(page).backlog.getByRole("article").first());
  expect(card.width).toBeGreaterThanOrEqual(share - 0.5);
}

// Each move by an edge control slides the row, or moves it at once.
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
