// The terminal's named frame icons maximize/restore/close (./agent-terminal.spec.ts).
// Maximize takes the page column's room, hiding banner/stories with the same
// session attached and Sessions sidebar beside it. A different session/content
// opens split; Restore recovers split, stacked above the page on narrow windows.
// Close leaves the session running and unmarked; reopening starts split.
// This page's dashboard attaches only synthetic Claude (./fixtures/fake-claude).

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  storyCardSessions,
  expectMembership,
  parts,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { box, pressWhereShown } from "./pageLayout.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";

test.use({ projectFolders: ["open-dough"] });

const shortId = (sessionId: string) => sessionId.slice(0, 8);

const windowOf = (page: Page) =>
  page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));

// The box covers exactly this room, to within half a pixel.
function expectCovers(
  found: { x: number; y: number; width: number; height: number },
  room: { x: number; y: number; width: number; height: number },
) {
  for (const key of ["x", "y", "width", "height"] as const)
    expect(found[key]).toBeCloseTo(room[key], 0);
}

test.describe("maximizing the terminal", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Maximize gives the panel the page column's room beside the sidebar until Close, Restore returns the split, and on a narrow window it fills the window", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { banner, board, backlog } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    const pageColumn = page.locator(".page-column");
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const control = (name: string) =>
      panel.getByRole("button", { name, exact: true });
    const openIn = (place: Locator) =>
      place.getByRole("button", { name: "Open terminal" });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(notRefinedStory, "Execution");
    await launch(readyStory, "Execution");
    const first = await sessionNamedBy(
      storyCardSessions(card(notRefinedStory)),
    );
    const second = await sessionNamedBy(storyCardSessions(card(readyStory)));
    const attachCount = () => dashboard.claudeAttaches().length;

    await openIn(storyCardSessions(card(notRefinedStory))).click();
    await expect(rows).toContainText(`attached ${shortId(first)}`);
    await page.keyboard.type("keep this line");
    await page.keyboard.press("Enter");
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
      await pressWhereShown(control("Maximize"));
      await expectFrameIconControl(control("Restore"), "Restore");
      await expect(control("Maximize")).toHaveCount(0);
      const room = await windowOf(page);
      expectCovers(await box(panel), {
        x: split.column.x,
        y: 0,
        width: room.width - split.column.x,
        height: room.height,
      });
      await expect(banner).toBeHidden();
      await expect(board).toBeHidden();
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      await expect(rows).toContainText("echo keep this line");
      expect(attachCount()).toBe(attachedBefore);
    });

    await test.step("Restore returns the left/right split with the same session's lines", async () => {
      await pressWhereShown(control("Restore"));
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
      await expect(board).toBeVisible();
      expectCovers(await box(pageColumn), split.column);
      expectCovers(await box(panel), split.panel);
      await expect(rows).toContainText("echo keep this line");
      expect(attachCount()).toBe(attachedBefore);
    });

    await test.step("with the Sessions sidebar open, the maximized panel stays beside it, and opening another entry shows that session in the normal split", async () => {
      await sidebar.button.click();
      await expect(sidebar.sidebar).toBeVisible();
      await pressWhereShown(control("Maximize"));
      await expect(banner).toBeHidden();
      const side = await box(sidebar.sidebar);
      const room = await windowOf(page);
      const besideSidebar = {
        x: side.x + side.width,
        y: 0,
        width: room.width - side.x - side.width,
        height: room.height,
      };
      expectCovers(await box(panel), besideSidebar);
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
      await expect(panel.locator(".side-panel-names p")).toHaveText(
        "Execution session",
      );
      await expect(panel.locator(".side-panel-names code")).toHaveCount(0);
      await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
      await titleToggle.focus();
      await page.keyboard.press("Enter");
      await expect(titleToggle).toHaveAttribute("aria-expanded", "true");
      await expect(heading).toHaveAccessibleName(readyStory);
      await page.keyboard.press("Enter");
      await expect(titleToggle).toHaveAttribute("aria-expanded", "false");
      await expect(rows).toContainText(`attached ${shortId(second)}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(control("Restore")).toHaveCount(0);
      await expect(banner).toBeVisible();
      const splitBesideSidebar = await box(panel);
      expect(splitBesideSidebar.x).toBeGreaterThan(besideSidebar.x + 1);
      expect(splitBesideSidebar.width).toBeLessThan(besideSidebar.width - 1);
      await pressWhereShown(control("Maximize"));
      await expect(banner).toBeHidden();
      expectCovers(await box(panel), besideSidebar);
    });

    await test.step("Close hides the maximized panel, the session keeps running and is not marked done, and the next opened session shows in the split", async () => {
      await control("Close").click();
      await expect(panel).toHaveCount(0);
      await expect(banner).toBeVisible();
      await expect(sidebar.entry(readyStory)).toBeFocused();
      const record = (await recordsOf(dashboard, "open-dough")).find(
        (kept) =>
          (kept as { session: { sessionId: string } }).session.sessionId ===
          second,
      ) as { doneAt?: string } | undefined;
      expect(record).toMatchObject({ sessionState: { kind: "available" } });
      expect(record?.doneAt).toBeUndefined();
      await sidebar.button.click();
      await expect(sidebar.sidebar).toBeHidden();

      await openIn(storyCardSessions(card(readyStory))).click();
      await expect(rows).toContainText(`attached ${shortId(second)}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
      // The page, showing Backlog, stays left of the panel.
      expect((await box(panel)).x).toBeGreaterThanOrEqual(
        (await box(backlog)).x + (await box(backlog)).width,
      );
    });

    await test.step("on a narrow window, Maximize fills the window and Restore stacks the panel above the page", async () => {
      await page.setViewportSize({ width: 800, height: 700 });
      // The fixed stacked panel stays above the independently scrolling Board.
      const room = await windowOf(page);
      await expect
        .poll(async () => (await box(panel)).width)
        .toBeCloseTo(room.width, 0);
      const stacked = await box(panel);
      expect(stacked.height).toBeLessThan(room.height);
      expect(stacked.y + stacked.height).toBeLessThanOrEqual(
        (await box(pageColumn)).y + 0.5,
      );

      await pressWhereShown(control("Maximize"));
      await expect(banner).toBeHidden();
      await expect(board).toBeHidden();
      expectCovers(await box(panel), {
        x: 0,
        y: 0,
        width: room.width,
        height: room.height,
      });

      await pressWhereShown(control("Restore"));
      await expect(board).toBeVisible();
      expectCovers(await box(panel), stacked);
      expect(stacked.y + stacked.height).toBeLessThanOrEqual(
        (await box(pageColumn)).y + 0.5,
      );
      await expect(rows).toContainText(`attached ${shortId(second)}`);
    });
  });
});
