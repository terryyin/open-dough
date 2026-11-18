// Where the Sessions sidebar lies beside the page, the terminal and the Board,
// wide and narrow. What its entries show is ./sessionsSidebarPage.ts.

import { expect, type Locator, type Page } from "@playwright/test";
import { expectCovering, resizeUntilArranged } from "./sidePanelWidthPage.ts";
import { parts } from "./dashboardPage.ts";
import { columnPagingControl, pagingRoom } from "./boardPage.ts";
import { box, expectSideBySideInOrder } from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";

// With a terminal open, the sidebar sits beside the page in a wide window.
// Toggling it preserves column paging; narrowing the window overlays the page.
export async function expectSessionsSidebarLayout(
  page: Page,
  panel: Locator,
): Promise<void> {
  const { sidebar, button } = sessionsSidebarParts(page);
  const main = page.getByRole("main");
  await expectSideBySideInOrder([sidebar, main, panel]);
  const view = page.viewportSize() ?? { width: 0, height: 0 };
  const column = await box(sidebar);
  expect(column.x).toBe(0);
  expect(column.y).toBe(0);
  expect(column.height).toBe(view.height);
  await expect(sidebar).toHaveCSS("overflow-y", "auto");
  // The page column lays out as narrow beside both sidebar and terminal.
  await expectOneColumnShown(page);
  await button.click();
  await expect(sidebar).toBeHidden();
  await expectOneColumnShown(page);
  await button.click();
  await expect(sidebar).toBeVisible();

  await resizeUntilArranged(panel, { width: 700, height: view.height });
  // Covering aria-hides and opacifies the page column; the sidebar still
  // overlays from the left and receives the hit test over that column.
  await expectCovering(panel);
  await expect(parts(page).banner).toBeHidden();
  const overlay = await box(sidebar);
  expect(overlay.x).toBe(0);
  const center = {
    x: overlay.x + overlay.width / 2,
    y: overlay.y + overlay.height / 2,
  };
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest("aside")?.id ?? "",
      center,
    ),
  ).toBe(await sidebar.evaluate((element) => element.id));
}

// The Board lays out as on a narrow window, when its scrolling content is that
// narrow whatever the window's width: Backlog alone fills the Board except for its
// column paging controls' slim room, the right one naming Taken, and
// each card is as wide as the unframed column.
async function expectOneColumnShown(page: Page): Promise<void> {
  const { backlog } = parts(page);
  await expect(columnPagingControl(page, "Taken")).toBeVisible();
  const pageColumn = await box(page.getByRole("main"));
  const column = await box(backlog);
  expect(column.width).toBeGreaterThanOrEqual(
    pageColumn.width - 2 * pagingRoom - 1,
  );
  const card = await box(backlog.getByRole("article").first());
  expect(card.width).toBeGreaterThanOrEqual(column.width - 1);
}
