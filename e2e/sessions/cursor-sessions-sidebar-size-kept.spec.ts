// This browser keeps the one preferred height chosen with the divider between
// the Sessions sidebar's two lists (./cursor-sessions-sidebar-resize.spec.ts): after a
// reload the section starts collapsed, and expanding it recovers that height
// (as Recently done recovers its divider's and starts again at its newest 20),
// within the room there is now; a height the room imposes never replaces it
// (./cursorSessionsSidebarRoomFitCases.ts).
// Another browser, a refused storage or an unusable kept value starts at an
// equal share, and the lists still resize for the page's lifetime. Only the
// developer's choice is kept, never expansion, and the browser's other
// preferences stay as they were. Each test's browser context keeps its own
// storage; resizing asks the server and the cursor-agent nothing.
import type { Page } from "@playwright/test";
import {
  keyDivider,
  keyStep,
  runningCursorSplit,
  type RunningCursorSplit,
  wide,
} from "../../dashboard/test-support/cursorSessionsSidebarResizePage.ts";
import {
  chooseProject,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  type RunningCursorParts,
  runningCursorParts,
} from "../../dashboard/test-support/runningCursorList.ts";
import {
  changesAsked,
  showPage,
} from "../../dashboard/test-support/runningCursorSessionsPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";
import {
  back,
  settings,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";
import {
  recentlyDoneHeightKey,
  recentlyDoneParts,
} from "../../dashboard/test-support/recentlyDoneSessionsSidebarPage.ts";
import { publishOnePygardonStory } from "../../dashboard/test-support/pygardonProject.ts";
import { revealRecentlyDoneThrough } from "../../dashboard/test-support/recentlyDoneSessionsSidebarPaging.ts";
import { fortyFiveDoneSessions } from "../../dashboard/test-support/retainedDoneSessions.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { recentlyDoneSessionsInitialLimit } from "../../dashboard/src/agentLaunch.ts";

const sessionsSidebarOpenKey = "open-dough.sessionsSidebar.open";

// Everything this browser keeps besides the preferred heights.
const otherPreferences = (page: Page, ...preferredHeightKeys: string[]) =>
  page.evaluate(
    (keys) =>
      Object.fromEntries(
        Object.entries<string>(window.localStorage).filter(
          ([name]) => !keys.includes(name),
        ),
      ),
    preferredHeightKeys,
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
  test.use({ projectFolders: ["open-dough"] });

  test("a chosen split outlasts collapsing, the sidebar, a project and a view, and a reload starts collapsed then recovers it; another browser starts at an equal share", async ({
    afterGitHubStops,
    page,
    browser,
    dashboard,
    origin,
    cursor,
  }) => {
    await publishOnePygardonStory(page, afterGitHubStops);
    keepLaunchRecords(
      dashboard,
      fortyFiveDoneSessions(Date.now(), ["open-dough"], queuedIdentity).records,
    );
    const asked = changesAsked(page);
    await showPage(page, origin);
    const shown = runningCursorParts(page);
    const split = runningCursorSplit(page, shown);
    const { sidebar, button, header } = shown;
    const { backlog } = parts(page);
    const done = recentlyDoneParts(page);
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

    await test.step("a reload keeps the sidebar open, starts both sections collapsed, and expanding recovers the kept heights and Recently done's newest 20", async () => {
      await done.header.click();
      await revealRecentlyDoneThrough(done, 40);
      await keyDivider(done.divider, "ArrowUp");
      const doneHeight = await done.divider.getAttribute("aria-valuenow");
      await page.reload();
      await expect(sidebar).toBeVisible();
      await expect(done.header).toHaveAttribute("aria-expanded", "false");
      await split.expectCollapsed();
      expect(await split.keptHeight()).toBe(String(chosen));
      await header.click();
      await expectChosen();
      await done.header.click();
      await expect(done.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
      await expect(done.divider).toHaveAttribute(
        "aria-valuenow",
        doneHeight ?? "",
      );
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
      expect(
        await otherPreferences(page, split.heightKey, recentlyDoneHeightKey),
      ).toEqual(others);
    });

    expect(asked).toEqual([]);
    expect(cursor.calls()).toEqual([]);
    expect(cursor.attaches()).toEqual([]);
  });
});

import "./cursorSessionsSidebarRoomFitCases.ts";
import "./cursorSessionsSidebarFormerHeightCases.ts";
