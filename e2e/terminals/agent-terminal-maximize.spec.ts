import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  openTerminalFromEntry,
  terminalPanel,
  terminalScreenParts,
  typeLine,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  storyCardSessions,
  expectMembership,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { setPageVisibility } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import {
  expectSessionsSidebar,
  sessionsSidebarParts,
} from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  expectClosedToggleCounts,
  expectClosedToggleCountsFit,
} from "../../dashboard/test-support/sessionsTogglePage.ts";
import { box, expectFills } from "../../dashboard/test-support/pageLayout.ts";
import {
  closeSidePanel,
  control as frameControl,
  maximizeSidePanel,
  restoreSidePanel,
  sidePanelNamesOf,
} from "../../dashboard/test-support/sidePanelFrame.ts";
import { expectCovering } from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { expectFrameIconControl } from "../../dashboard/test-support/frameIconControl.ts";

test.use({ projectFolders: ["open-dough"] });

const windowOf = (page: Page) =>
  page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));

test.describe("maximizing the terminal", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Maximize gives the panel the page column's room beside the sidebar until Close, Restore returns the split, and on a narrow window it fills the window", async ({
    page,
    dashboard,
  }) => {
    const first = await composeSession(dashboard, "open-dough", {
      identity: notRefinedIdentity,
      title: notRefinedStory,
    });
    const second = await composeSession(dashboard, "open-dough", {
      identity: readyIdentity,
      title: readyStory,
    });
    const { card, settled } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { banner, board, backlog } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    const pageColumn = page.locator(".page-column");
    const panel = terminalPanel(page);
    const { rows } = terminalScreenParts(panel);
    const control = (name: string) => frameControl(panel, name);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    const attachCount = () => dashboard.claudeAttaches().length;

    await openTerminalFromEntry(storyCardSessions(card(notRefinedStory)));
    await expect(rows).toContainText(`attached ${first.shortId}`);
    await typeLine(page, "keep this line");
    await expect(rows).toContainText("echo keep this line");

    await test.step("the header's icon controls, Mark as done included, are quiet, compact frame icon controls named by label and tooltip", async () => {
      await expectFrameIconControl(control("Mark as done"), "Mark as done");
      await expectFrameIconControl(control("Maximize"), "Maximize");
      await expectFrameIconControl(control("Close"), "Close", "Close (⌘⇧Esc)");
      for (const name of ["Mark as done", "Maximize", "Close"]) {
        const button = control(name);
        await expect(button).toHaveText("");
        await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(button).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
      }
      await control("Maximize").hover();
      await expect(control("Maximize")).not.toHaveCSS(
        "background-color",
        "rgba(0, 0, 0, 0)",
      );
      await page.mouse.move(0, 0);
    });

    const split = {
      column: await box(pageColumn),
      panel: await box(panel),
    };
    const attachedBefore = attachCount();

    await test.step("Maximize gives the panel the page column's room, hides the banner and stories, keeps the same session's lines, and offers Restore", async () => {
      await maximizeSidePanel(panel);
      await expectFrameIconControl(control("Restore"), "Restore");
      await expect(control("Maximize")).toHaveCount(0);
      const room = await windowOf(page);
      await expectFills(panel, {
        x: split.column.x,
        y: 0,
        width: room.width - split.column.x,
        height: room.height,
      });
      await expect(banner).toBeHidden();
      await expect(board).toBeHidden();
      dashboard.claudeSessionBecomes(second.sessionId, "blocked");
      await setPageVisibility(page, "hidden");
      await setPageVisibility(page, "visible");
      await expectClosedToggleCounts(page, 1, 1);
      await expectClosedToggleCountsFit(page);
      await sidebar.button.click();
      await expectSessionsSidebar(page, "open");
      await expect(sidebar.badge).toHaveText("1");
      await sidebar.button.click();
      await expectSessionsSidebar(page, "closed");
      await expect(rows).toContainText(`attached ${first.shortId}`);
      await expect(rows).toContainText("echo keep this line");
      expect(attachCount()).toBe(attachedBefore);
    });

    await test.step("Restore returns the left/right split with the same session's lines", async () => {
      await restoreSidePanel(panel);
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
      await expect(board).toBeVisible();
      await expectFills(pageColumn, split.column);
      await expectFills(panel, split.panel);
      await expect(rows).toContainText("echo keep this line");
      expect(attachCount()).toBe(attachedBefore);
    });

    await test.step("with the Sessions sidebar open, the maximized panel stays beside it, and opening another entry shows that session in the normal split", async () => {
      await sidebar.button.click();
      await expect(sidebar.sidebar).toBeVisible();
      await maximizeSidePanel(panel);
      await expect(banner).toBeHidden();
      const side = await box(sidebar.sidebar);
      const room = await windowOf(page);
      const besideSidebar = {
        x: side.x + side.width,
        y: 0,
        width: room.width - side.x - side.width,
        height: room.height,
      };
      await expectFills(panel, besideSidebar);
      await sidebar.entry(readyStory).click();
      const heading = panel.getByRole("heading", {
        level: 2,
        name: readyStory,
      });
      const titleToggle = panel.getByRole("button", {
        name: readyStory,
        exact: true,
      });
      await expect(heading).toHaveAccessibleName(readyStory);
      await expect(sidePanelNamesOf(panel).sessionName).toHaveText(
        "Execution session",
      );
      await expect(sidePanelNamesOf(panel).shownSessionId).toHaveCount(0);
      await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
      await titleToggle.focus();
      await page.keyboard.press("Enter");
      await expect(titleToggle).toHaveAttribute("aria-expanded", "true");
      await expect(heading).toHaveAccessibleName(readyStory);
      await page.keyboard.press("Enter");
      await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
      await expect(rows).toContainText(`attached ${second.shortId}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(control("Restore")).toHaveCount(0);
      await expect(banner).toBeVisible();
      const splitBesideSidebar = await box(panel);
      expect(splitBesideSidebar.x).toBeGreaterThan(besideSidebar.x + 1);
      expect(splitBesideSidebar.width).toBeLessThan(besideSidebar.width - 1);
      await maximizeSidePanel(panel);
      await expect(banner).toBeHidden();
      await expectFills(panel, besideSidebar);
    });

    await test.step("Close hides the maximized panel, the session keeps running and is not marked done, and the next opened session shows in the split", async () => {
      await closeSidePanel(panel);
      await expect(panel).toHaveCount(0);
      await expect(banner).toBeVisible();
      await expect(sidebar.entry(readyStory)).toBeFocused();
      const record = (await recordsOf(dashboard, "open-dough")).find(
        (kept) =>
          (kept as { session: { sessionId: string } }).session.sessionId ===
          second.sessionId,
      ) as { doneAt?: string } | undefined;
      expect(record).toMatchObject({ sessionState: { kind: "available" } });
      expect(record?.doneAt).toBeUndefined();
      await sidebar.button.click();
      await expect(sidebar.sidebar).toBeHidden();

      await openTerminalFromEntry(storyCardSessions(card(readyStory)));
      await expect(rows).toContainText(`attached ${second.shortId}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
      expect((await box(panel)).x).toBeGreaterThanOrEqual(
        (await box(backlog)).x + (await box(backlog)).width,
      );
    });

    await test.step("on a narrow window the panel covers without Maximize, filling the window", async () => {
      await page.setViewportSize({ width: 800, height: 700 });
      const room = await windowOf(page);
      await expectCovering(panel);
      await expect(banner).toBeHidden();
      await expect(board).toBeHidden();
      await expectFills(panel, {
        x: 0,
        y: 0,
        width: room.width,
        height: room.height,
      });
      await expect(rows).toContainText(`attached ${second.shortId}`);
    });
  });
});
