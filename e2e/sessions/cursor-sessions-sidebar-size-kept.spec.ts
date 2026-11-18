// This browser keeps the one preferred height chosen with the divider between
// the Sessions sidebar's two lists (./cursor-sessions-sidebar-resize.spec.ts): after a
// reload the section starts collapsed, and expanding it recovers that height,
// within the room there is now; a height the room imposes never replaces it.
// Another browser, a refused storage or an unusable kept value starts at an
// equal share, and the lists still resize for the page's lifetime. Only the
// developer's choice is kept, never expansion, and the browser's other
// preferences stay as they were. Each test's browser context keeps its own
// storage; resizing asks the server and the cursor-agent nothing.
import type { Page } from "@playwright/test";
import {
  keyStep,
  runningCursorSplit,
  type RunningCursorSplit,
  wide,
} from "../../dashboard/tests/cursorSessionsSidebarResizePage.ts";
import { chooseProject, parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  type RunningCursorParts,
  runningCursorParts,
} from "../../dashboard/tests/runningCursorList.ts";
import {
  changesAsked,
  listFloor as floor,
  showPage,
} from "../../dashboard/tests/runningCursorSessionsPage.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";
import {
  back,
  settings,
} from "../../dashboard/tests/support/systemSettingsPage.ts";
import { publishOnePygardonStory } from "../../dashboard/tests/pygardonProject.ts";

const sessionsSidebarOpenKey = "open-dough.sessionsSidebar.open";

// Everything this browser keeps besides the preferred height.
const otherPreferences = (page: Page, preferredHeightKey: string) =>
  page.evaluate(
    (key) =>
      Object.fromEntries(
        Object.entries<string>(window.localStorage).filter(
          ([name]) => name !== key,
        ),
      ),
    preferredHeightKey,
  );

// Expanded, the two lists share the room equally; returns that room.
async function expandToEqualShare(
  split: RunningCursorSplit,
  shown: RunningCursorParts,
) {
  await shown.header.click();
  await expect(shown.body).toBeVisible();
  const room = await split.roomOf();
  await split.expectCursorHeight(room, Math.round(room / 2));
  return room;
}

test.use({ cursorScreen: "working" });

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(wide);
});

test.describe("with two projects", () => {
  test.use({ projectFolders: ["open-dough", "pygardon"] });

  test("a chosen split outlasts collapsing, the sidebar, a project and a view, and a reload starts collapsed then recovers it; another browser starts at an equal share", async ({
    page,
    browser,
    dashboard,
    origin,
    cursor,
  }) => {
    await publishOnePygardonStory(page);
    const asked = changesAsked(page);
    await showPage(page, origin);
    const shown = runningCursorParts(page);
    const split = runningCursorSplit(page, shown);
    const { sidebar, button, header } = shown;
    const { backlog } = parts(page);
    await button.click();
    await expect(sidebar).toBeVisible();
    await split.keepInBrowser("open-dough.sidePanel.width", "500");
    await split.keepInBrowser("open-dough.board.position", "1");
    const others = await otherPreferences(page, split.heightKey);
    expect(others).toEqual({
      [sessionsSidebarOpenKey]: "true",
      "open-dough.sidePanel.width": "500",
      "open-dough.board.position": "1",
    });
    expect(await split.keptHeight()).toBeNull();

    const room = await expandToEqualShare(split, shown);
    // Expanding at the default is no choice: nothing is kept yet.
    expect(await split.keptHeight()).toBeNull();
    await split.keyDivider("ArrowUp", 3);
    const chosen = Math.round(room / 2) + 3 * keyStep;
    const expectChosen = async () => {
      await expect(header).toHaveAttribute("aria-expanded", "true");
      await split.expectCursorHeight(room, chosen);
      expect(await split.keptHeight()).toBe(String(chosen));
    };
    await expectChosen();

    await test.step("collapsing, the sidebar, another project and a view keep it", async () => {
      await header.click();
      await split.expectCollapsed();
      await header.click();
      await expectChosen();
      await button.click();
      await expect(sidebar).toBeHidden();
      await button.click();
      await expectChosen();
      await chooseProject(page, "Pygardon");
      await expect(backlog).toContainText("A Pygardon story");
      await expectChosen();
      await settings(page).click();
      await back(page).click();
      await expect(backlog).toContainText("A Pygardon story");
      await expectChosen();
    });

    await test.step("a reload starts collapsed, and expanding recovers the kept height", async () => {
      await page.reload();
      await expect(sidebar).toBeVisible();
      await split.expectCollapsed();
      expect(await split.keptHeight()).toBe(String(chosen));
      await header.click();
      await expectChosen();
    });

    await test.step("a fresh browser context keeps nothing and starts at an equal share", async () => {
      const fresh = await browser.newContext({
        baseURL: dashboard.baseURL,
        viewport: wide,
      });
      try {
        const other = await fresh.newPage();
        await other.goto("/");
        const there = runningCursorParts(other);
        const otherSplit = runningCursorSplit(other, there);
        await there.button.click();
        await otherSplit.expectCollapsed();
        await expandToEqualShare(otherSplit, there);
        expect(await otherSplit.keptHeight()).toBeNull();
      } finally {
        await fresh.close();
      }
    });

    await test.step("the first browser still recovers its height, its other preferences as they were", async () => {
      await page.reload();
      await split.expectCollapsed();
      await header.click();
      await expectChosen();
      expect(await otherPreferences(page, split.heightKey)).toEqual(others);
    });

    expect(asked).toEqual([]);
    expect(cursor.calls()).toEqual([]);
    expect(cursor.attaches()).toEqual([]);
  });
});

test("less room fits the shown height, also after a reload, without replacing the kept one, and more room recovers it", async ({
  page,
  origin,
}) => {
  await showPage(page, origin);
  const shown = runningCursorParts(page);
  const split = runningCursorSplit(page, shown);
  const { button, header, divider } = shown;
  await button.click();
  const room = await expandToEqualShare(split, shown);
  // What the sidebar's heading, header and padding take from its height.
  const taken = wide.height - room;
  await split.dragDivider(-150);
  const chosen = await split.valueOf("aria-valuenow");
  expect(chosen).toBeGreaterThan(Math.round(room / 2) + 100);
  await split.expectSplit(room, chosen);
  const expectKept = async () => {
    expect(await split.keptHeight()).toBe(String(chosen));
  };
  await expectKept();
  const less = Math.ceil(taken + 2 * floor + 40);
  const fitted = Math.floor(less - taken - floor);
  expect(fitted).toBeLessThan(chosen);

  await test.step("less room fits the shown height and keeps the chosen one", async () => {
    await page.setViewportSize({ width: wide.width, height: less });
    await split.expectCursorHeight(less - taken, fitted);
    await expectKept();
  });

  await test.step("too little room for both floors offers no range and keeps the chosen one", async () => {
    await page.setViewportSize({
      width: wide.width,
      height: Math.floor(taken + 2 * floor - 40),
    });
    await expect(divider).toBeDisabled();
    await expectKept();
  });

  await test.step("reloaded in less room, expanding fits the room and keeps the chosen one", async () => {
    await page.setViewportSize({ width: wide.width, height: less });
    await page.reload();
    await split.expectCollapsed();
    await header.click();
    await split.expectCursorHeight(less - taken, fitted);
    await expectKept();
  });

  await test.step("more room recovers the chosen height", async () => {
    await page.setViewportSize(wide);
    await split.expectCursorHeight(room, chosen);
    await expectKept();
  });
});

import "./cursorSessionsSidebarFormerHeightCases.ts";
