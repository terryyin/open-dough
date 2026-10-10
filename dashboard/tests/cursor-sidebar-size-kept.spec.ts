// This browser keeps the one preferred height chosen with the edge between
// the Sessions sidebar's two lists (./cursor-sidebar-resize.spec.ts): after a
// reload the section starts collapsed, and expanding it recovers that height,
// within the room there is now; a height the room imposes never replaces it.
// Another browser, a refused storage or an unusable kept value starts at an
// equal share, and the lists still resize for the page's lifetime. Only the
// developer's choice is kept, never expansion, and the browser's other
// preferences stay as they were. Each test's browser context keeps its own
// storage; resizing asks the server and the cursor-agent nothing.
import type { Page } from "@playwright/test";
import {
  dragEdge,
  expectCollapsed,
  expectEdgeSays,
  expectSplit,
  heightKey,
  keepInBrowser,
  keptHeight,
  keyStep,
  press,
  roomOf,
  valueOf,
  wide,
  type Shown,
} from "./cursorSidebarResizePage.ts";
import { parts } from "./dashboardPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  changesAsked,
  listFloor as floor,
  runningCursorParts,
  showPage,
} from "./runningCursorSessionsPage.ts";
import { expect, test } from "./support/cursorStart.ts";

const sidebarOpenKey = "open-dough.sessionSidebar.open";

// Everything this browser keeps besides the preferred height.
const otherPreferences = (page: Page) =>
  page.evaluate(
    (key) =>
      Object.fromEntries(
        Object.entries<string>(window.localStorage).filter(
          ([name]) => name !== key,
        ),
      ),
    heightKey,
  );

// Expanded, the two lists share the room equally; returns that room.
async function expandToEqualShare(shown: Shown) {
  await shown.header.click();
  await expect(shown.body).toBeVisible();
  const room = await roomOf(shown);
  await expectSplit(shown, room, Math.round(room / 2));
  await expectEdgeSays(shown.edge, Math.round(room / 2));
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
    test.setTimeout(120_000);
    const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
    pygardon.push(
      "e6".repeat(20),
      "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
    );
    const asked = changesAsked(page);
    await showPage(page, origin);
    const shown = runningCursorParts(page);
    const { sidebar, button, header, edge } = shown;
    const { project, backlog } = parts(page);
    await button.click();
    await expect(sidebar).toBeVisible();
    await keepInBrowser(page, "open-dough.sidePanel.width", "500");
    await keepInBrowser(page, "open-dough.dashboardColumns.position", "1");
    const others = await otherPreferences(page);
    expect(others).toEqual({
      [sidebarOpenKey]: "true",
      "open-dough.sidePanel.width": "500",
      "open-dough.dashboardColumns.position": "1",
    });
    expect(await keptHeight(page)).toBeNull();

    const room = await expandToEqualShare(shown);
    // Expanding at the default is no choice: nothing is kept yet.
    expect(await keptHeight(page)).toBeNull();
    await edge.focus();
    await press(page, "ArrowUp", 3);
    const chosen = Math.round(room / 2) + 3 * keyStep;
    const expectChosen = async () => {
      await expect(header).toHaveAttribute("aria-expanded", "true");
      await expectEdgeSays(edge, chosen);
      await expectSplit(shown, room, chosen);
      expect(await keptHeight(page)).toBe(String(chosen));
    };
    await expectChosen();

    await test.step("collapsing, the sidebar, another project and a view keep it", async () => {
      await header.click();
      await expectCollapsed(shown);
      await header.click();
      await expectChosen();
      await button.click();
      await expect(sidebar).toBeHidden();
      await button.click();
      await expectChosen();
      await project.getByRole("radio", { name: "Pygardon" }).check();
      await expect(backlog).toContainText("A Pygardon story");
      await expectChosen();
      await page
        .getByRole("button", { name: "System settings", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Back to dashboard", exact: true })
        .click();
      await expect(backlog).toContainText("A Pygardon story");
      await expectChosen();
    });

    await test.step("a reload starts collapsed, and expanding recovers the kept height", async () => {
      await page.reload();
      await expect(sidebar).toBeVisible();
      await expectCollapsed(shown);
      expect(await keptHeight(page)).toBe(String(chosen));
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
        await there.button.click();
        await expectCollapsed(there);
        await expandToEqualShare(there);
        expect(await keptHeight(other)).toBeNull();
      } finally {
        await fresh.close();
      }
    });

    await test.step("the first browser still recovers its height, its other preferences as they were", async () => {
      await page.reload();
      await expectCollapsed(shown);
      await header.click();
      await expectChosen();
      expect(await otherPreferences(page)).toEqual(others);
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
  test.setTimeout(120_000);
  await showPage(page, origin);
  const shown = runningCursorParts(page);
  const { button, header, edge } = shown;
  await button.click();
  const room = await expandToEqualShare(shown);
  // What the sidebar's heading, header and padding take from its height.
  const taken = wide.height - room;
  await dragEdge(page, edge, -150);
  const chosen = await valueOf(edge, "aria-valuenow");
  expect(chosen).toBeGreaterThan(Math.round(room / 2) + 100);
  await expectSplit(shown, room, chosen);
  const expectKept = async () => {
    expect(await keptHeight(page)).toBe(String(chosen));
  };
  await expectKept();
  const less = Math.ceil(taken + 2 * floor + 40);
  const fitted = Math.floor(less - taken - floor);
  expect(fitted).toBeLessThan(chosen);

  await test.step("less room fits the shown height and keeps the chosen one", async () => {
    await page.setViewportSize({ width: wide.width, height: less });
    await expectEdgeSays(edge, fitted);
    await expectSplit(shown, less - taken, fitted);
    await expectKept();
  });

  await test.step("too little room for both floors offers no range and keeps the chosen one", async () => {
    await page.setViewportSize({
      width: wide.width,
      height: Math.floor(taken + 2 * floor - 40),
    });
    await expect(edge).toBeDisabled();
    await expectKept();
  });

  await test.step("reloaded in less room, expanding fits the room and keeps the chosen one", async () => {
    await page.setViewportSize({ width: wide.width, height: less });
    await page.reload();
    await expectCollapsed(shown);
    await header.click();
    await expectEdgeSays(edge, fitted);
    await expectSplit(shown, less - taken, fitted);
    await expectKept();
  });

  await test.step("more room recovers the chosen height", async () => {
    await page.setViewportSize(wide);
    await expectEdgeSays(edge, chosen);
    await expectSplit(shown, room, chosen);
    await expectKept();
  });
});
