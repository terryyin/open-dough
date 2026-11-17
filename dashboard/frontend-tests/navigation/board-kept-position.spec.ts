// This browser keeps the Board's Columns' one position, for every project:
// a first visit shows Backlog leftmost; once the developer moves the view, a
// project switch or a reload shows the same columns, limited only by what the
// Board's width allows, and a wide Board that shows every column does not lose
// it. A browser that refuses storage starts at Backlog and pages for the
// page's lifetime without error. That the position follows column paging
// controls, focus, and width is ./board-paging.spec.ts.
// Each case's browser context keeps its own real `localStorage`.

import type { Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { chooseProject } from "../../tests/dashboardPage.ts";
import { watchPageErrors } from "../../tests/pageErrors.ts";
import {
  boardPositionKey,
  expectView,
  keptBoardPosition,
  rem,
  showColumn,
} from "../../tests/boardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../tests/pageRequestNotes.ts";

// Room for two of the three columns, and for all three.
const narrowWindow = { width: 54 * rem, height: 800 };
const wideWindow = { width: 1728, height: 800 };

// The default project holds two Backlog entries, one Taken, none done.
const expectAtBacklog = (page: Page) =>
  expectView(page, ["Backlog", "Taken"], ["Recently done 0 entries"]);
const expectAtTaken = (page: Page) =>
  expectView(page, ["Taken", "Recently done"], ["Backlog 2 entries"]);

test("the chosen Board columns stay across a project switch", async ({
  page,
  frontendServices,
}) => {
  frontendServices.listThreeProjects();
  await page.setViewportSize(narrowWindow);
  await openUntilRead(page);
  await expectAtBacklog(page);
  await showColumn(page, "Recently done");
  await expectAtTaken(page);
  await chooseProject(page, "Doughnut");
  await expectAtTaken(page);
  await showColumn(page, "Backlog");
  await chooseProject(page, "Open Dough");
  await expectAtBacklog(page);
});

test("the chosen Board columns stay across a reload", async ({ page }) => {
  await page.setViewportSize(narrowWindow);
  await openUntilRead(page);
  await showColumn(page, "Recently done");
  await expectAtTaken(page);
  await reloadUntilRead(page);
  await expectAtTaken(page);
  await showColumn(page, "Backlog");
  await reloadUntilRead(page);
  await expectAtBacklog(page);
});

test("the chosen Board columns stay in a wide Board", async ({ page }) => {
  await page.setViewportSize(narrowWindow);
  await openUntilRead(page);
  await showColumn(page, "Recently done");
  await expectAtTaken(page);
  await page.setViewportSize(wideWindow);
  await expectView(page, ["Backlog", "Taken", "Recently done"], []);
  await reloadUntilRead(page);
  await expectView(page, ["Backlog", "Taken", "Recently done"], []);
  await page.setViewportSize(narrowWindow);
  await expectAtTaken(page);
});

test("a position kept under the former Board key is recovered once and kept under the Board key", async ({
  page,
}) => {
  await page.setViewportSize(narrowWindow);
  await openUntilRead(page);
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    localStorage.setItem("open-dough.dashboardColumns.position", "1");
  }, boardPositionKey);
  await reloadUntilRead(page);
  await expectAtTaken(page);
  expect(await keptBoardPosition(page)).toBe("1");

  // Once adopted, the new key wins over a different former value.
  await page.evaluate(() => {
    localStorage.setItem("open-dough.dashboardColumns.position", "0");
  });
  await reloadUntilRead(page);
  await expectAtTaken(page);
  await showColumn(page, "Backlog");
  expect(await keptBoardPosition(page)).toBe("0");
  await reloadUntilRead(page);
  await expectAtBacklog(page);
});

test("an unusable kept position starts at Backlog", async ({ page }) => {
  await page.setViewportSize(narrowWindow);
  const errors = watchPageErrors(page);
  await openUntilRead(page);
  for (const malformed of ["taken", "-1", "1.5"]) {
    await test.step(`kept as ${JSON.stringify(malformed)}`, async () => {
      await page.evaluate(
        ([key, value]) => {
          localStorage.setItem(key, value);
        },
        [boardPositionKey, malformed] as const,
      );
      await reloadUntilRead(page);
      await expectAtBacklog(page);
    });
  }
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the view starts at Backlog and pages for the page's lifetime without error", async ({
  page,
  frontendServices,
}) => {
  await page.addInitScript(() => {
    const refused = () => {
      throw new DOMException("Storage is refused.", "SecurityError");
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refused,
    });
  });
  frontendServices.listThreeProjects();
  const errors = watchPageErrors(page);
  await page.setViewportSize(narrowWindow);
  await openUntilRead(page);
  await expectAtBacklog(page);
  await showColumn(page, "Recently done");
  await expectAtTaken(page);
  await chooseProject(page, "Doughnut");
  await expectAtTaken(page);
  await reloadUntilRead(page);
  await expectAtBacklog(page);
  expect(errors).toEqual([]);
});
