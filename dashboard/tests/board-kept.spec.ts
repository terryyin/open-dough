// This browser keeps the Board's Columns' one position, for every project:
// a first visit shows Backlog leftmost; once the developer moves the view, a
// project switch or a reload shows the same columns, limited only by what the
// page's width allows, and a wide page that shows every column does not lose
// it. A browser that refuses storage starts at Backlog and pages for the
// page's lifetime without error. That the position follows column paging controls,
// focus, and width is ./board-paging.spec.ts. Each test's browser
// context keeps its own storage.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { watchPageErrors } from "./pageErrors.ts";
import {
  doughnutProject,
  expectSelectedProject,
  openDoughProject,
  publishCatalogProjects,
} from "./projectKeyboardNavigationJourney.ts";
import { expectView, rem, showColumn } from "./boardPage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

// Room for two of the three columns, and for all three.
const narrowWindow = { width: 54 * rem, height: 800 };
const wideWindow = { width: 1728, height: 800 };

// Each catalog project holds one Backlog and one Taken entry.
const expectAtBacklog = (page: Page) =>
  expectView(page, ["Backlog", "Taken"], ["Recently done 0 entries"]);
const expectAtTaken = (page: Page) =>
  expectView(page, ["Taken", "Recently done"], ["Backlog 1 entry"]);

async function chooseProject(page: Page, label: string) {
  await parts(page)
    .project.getByRole("radio", { name: label, exact: true })
    .check();
}

test("the chosen columns stay across a project switch, a reload, and a wide page", async ({
  page,
}) => {
  await page.setViewportSize(narrowWindow);
  await publishCatalogProjects(page);
  await page.goto("/");
  await expectSelectedProject(page, openDoughProject, {
    checkDirection: false,
  });

  await test.step("a first visit shows Backlog leftmost", async () => {
    await expectAtBacklog(page);
  });

  await test.step("moved to Taken and Recently done, another project shows them too", async () => {
    await showColumn(page, "Recently done");
    await expectAtTaken(page);
    await chooseProject(page, doughnutProject.label);
    await expectSelectedProject(page, doughnutProject, {
      checkDirection: false,
    });
    await expectAtTaken(page);
  });

  await test.step("a reload shows them again", async () => {
    await page.reload();
    await expectSelectedProject(page, doughnutProject, {
      checkDirection: false,
    });
    await expectAtTaken(page);
  });

  await test.step("a wide page shows every column and a narrow one comes back to them, also after a reload", async () => {
    await page.setViewportSize(wideWindow);
    await expectView(page, ["Backlog", "Taken", "Recently done"], []);
    await reloadUntilRead(page);
    await expectView(page, ["Backlog", "Taken", "Recently done"], []);
    await page.setViewportSize(narrowWindow);
    await expectAtTaken(page);
  });

  await test.step("moved back to Backlog, a reload and a project switch keep Backlog", async () => {
    await showColumn(page, "Backlog");
    await expectAtBacklog(page);
    await page.reload();
    await chooseProject(page, openDoughProject.label);
    await expectSelectedProject(page, openDoughProject, {
      checkDirection: false,
    });
    await expectAtBacklog(page);
  });
});

test("a position kept under the former Board key is recovered once and kept under the Board key", async ({
  page,
}) => {
  await page.setViewportSize(narrowWindow);
  await publishCatalogProjects(page);
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("open-dough.board.position");
    localStorage.setItem("open-dough.dashboardColumns.position", "1");
  });
  await reloadUntilRead(page);
  await expectAtTaken(page);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("open-dough.board.position"),
    ),
  ).toBe("1");

  // Once adopted, the new key wins over a different former value.
  await page.evaluate(() => {
    localStorage.setItem("open-dough.dashboardColumns.position", "0");
  });
  await reloadUntilRead(page);
  await expectAtTaken(page);
  await showColumn(page, "Backlog");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("open-dough.board.position"),
    ),
  ).toBe("0");
  await reloadUntilRead(page);
  await expectAtBacklog(page);
});

test("an unusable kept position starts at Backlog", async ({ page }) => {
  await page.setViewportSize(narrowWindow);
  await publishCatalogProjects(page);
  const errors = watchPageErrors(page);
  await page.goto("/");
  for (const malformed of ["taken", "-1", "1.5"]) {
    await test.step(`kept as ${JSON.stringify(malformed)}`, async () => {
      await page.evaluate((value) => {
        window.localStorage.setItem("open-dough.board.position", value);
      }, malformed);
      await reloadUntilRead(page);
      await expectAtBacklog(page);
    });
  }
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the view starts at Backlog and pages for the page's lifetime without error", async ({
  page,
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
  const errors = watchPageErrors(page);
  await page.setViewportSize(narrowWindow);
  await publishCatalogProjects(page);
  await page.goto("/");
  await expectSelectedProject(page, openDoughProject, {
    checkDirection: false,
  });
  await expectAtBacklog(page);
  await showColumn(page, "Recently done");
  await expectAtTaken(page);
  await chooseProject(page, doughnutProject.label);
  await expectAtTaken(page);
  await reloadUntilRead(page);
  await expectAtBacklog(page);
  expect(errors).toEqual([]);
});
