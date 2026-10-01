// The terminal panel's header maximizes and restores the panel and closes it
// by icon controls named by label and tooltip, on the journey of
// ./agent-terminal.spec.ts: maximized, the panel takes the page column's
// room, the banner and stories hidden behind it, with the same session still
// attached; an open Sessions sidebar stays beside it, and opening another of
// its entries keeps the panel maximized; Restore returns the split. Close
// hides the panel and leaves the session running and not marked done, and the
// next opened session shows in the split. On a narrow window, maximized fills
// the window and Restore stacks the panel above the page again. The page's own
// dashboard server attaches the synthetic `claude` (./fixtures/fake-claude);
// the real one is never reached.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessions,
  expectMembership,
  parts,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { box, pressWhereShown } from "./pageLayout.ts";

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
  expect(found.x).toBeCloseTo(room.x, 0);
  expect(found.y).toBeCloseTo(room.y, 0);
  expect(found.width).toBeCloseTo(room.width, 0);
  expect(found.height).toBeCloseTo(room.height, 0);
}

test.describe("maximizing the terminal panel", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Maximize gives the panel the page column's room beside the sidebar until Close, Restore returns the split, and on a narrow window it fills the window", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { banner, stages } = parts(page);
    const sidebar = sidebarParts(page);
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
    const first = await sessionNamedBy(cardSessions(card(notRefinedStory)));
    const second = await sessionNamedBy(cardSessions(card(readyStory)));
    const attachCount = () => dashboard.claudeAttaches().length;

    await openIn(cardSessions(card(notRefinedStory))).click();
    await expect(rows).toContainText(`attached ${shortId(first)}`);
    await page.keyboard.type("keep this line");
    await page.keyboard.press("Enter");
    await expect(rows).toContainText("echo keep this line");

    await test.step("the header's icon controls are named by label and tooltip, and Mark as done stays a text button", async () => {
      await expect(control("Maximize")).toHaveAttribute("title", "Maximize");
      await expect(control("Close")).toHaveAttribute("title", "Close (⌘⇧Esc)");
      await expect(control("Maximize").locator("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      await expect(control("Mark as done")).toHaveText("Mark as done");
    });

    const split = {
      column: await box(pageColumn),
      panel: await box(panel),
    };
    const attachedBefore = attachCount();

    await test.step("Maximize gives the panel the page column's room, hides the banner and stories, keeps the same session's lines, and offers Restore", async () => {
      await pressWhereShown(control("Maximize"));
      await expect(control("Restore")).toHaveAttribute("title", "Restore");
      await expect(control("Maximize")).toHaveCount(0);
      const room = await windowOf(page);
      expectCovers(await box(panel), {
        x: split.column.x,
        y: 0,
        width: room.width - split.column.x,
        height: room.height,
      });
      await expect(banner).toBeHidden();
      await expect(stages).toBeHidden();
      await expect(rows).toContainText(`attached ${shortId(first)}`);
      await expect(rows).toContainText("echo keep this line");
      expect(attachCount()).toBe(attachedBefore);
    });

    await test.step("Restore returns the left/right split with the same session's lines", async () => {
      await pressWhereShown(control("Restore"));
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
      await expect(stages).toBeVisible();
      expectCovers(await box(pageColumn), split.column);
      expectCovers(await box(panel), split.panel);
      await expect(rows).toContainText("echo keep this line");
      expect(attachCount()).toBe(attachedBefore);
    });

    await test.step("with the Sessions sidebar open, the maximized panel stays beside it, and opening another entry shows that session still maximized", async () => {
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
      await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
        readyStory,
      );
      await expect(panel).toContainText(`Execution session ${second}`);
      await expect(rows).toContainText(`attached ${shortId(second)}`);
      await expect(control("Restore")).toBeVisible();
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

      await openIn(cardSessions(card(readyStory))).click();
      await expect(rows).toContainText(`attached ${shortId(second)}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
      expect((await box(panel)).x).toBeGreaterThanOrEqual(
        (await box(stages)).x + (await box(stages)).width,
      );
    });

    await test.step("on a narrow window, Maximize fills the window and Restore stacks the panel above the page", async () => {
      await page.setViewportSize({ width: 800, height: 700 });
      // The panel stacks first, so the page's top shows it.
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
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
      await expect(stages).toBeHidden();
      expectCovers(await box(panel), {
        x: 0,
        y: 0,
        width: room.width,
        height: room.height,
      });

      await pressWhereShown(control("Restore"));
      await expect(stages).toBeVisible();
      expectCovers(await box(panel), stacked);
      expect(stacked.y + stacked.height).toBeLessThanOrEqual(
        (await box(pageColumn)).y + 0.5,
      );
      await expect(rows).toContainText(`attached ${shortId(second)}`);
    });
  });
});
