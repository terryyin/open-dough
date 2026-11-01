// Phone key toolbar and scroll-versus-navigate on the ordinary
// page/xterm/WebSocket/PTY path. Desktop fine-pointer chrome stays without
// the toolbar; swipe still scrolls history only.
import { expect, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import {
  focusByTouch,
  noteTerminalTraffic,
  scrollByTouch,
  tapTerminalKey,
  terminalKey,
  terminalKeyToolbar,
} from "./touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });
test.setTimeout(60_000);
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const title = "Phone terminal key toolbar session";

test.describe("phone terminal key toolbar", () => {
  test.use({
    viewport: phoneLaunchTouchViewport.portrait,
    hasTouch: true,
  });

  test("toolbar keys reach the PTY, preserve focus, and arrows move a menu while swipe does not", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeAttachMenu(true);
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#phone-terminal-keys",
      title,
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const { sent } = noteTerminalTraffic(page);
    await tapWhereShown(sidebar.entry(title));
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const toolbar = terminalKeyToolbar(panel);
    await expect(rows).toContainText("Choose a color");
    await expect(rows).toContainText("› Red");
    await expect(toolbar).toBeVisible();
    for (const name of [
      "Esc",
      "Tab",
      "Up",
      "Down",
      "Left",
      "Right",
      "Enter",
      "More terminal keys",
    ]) {
      await expect(terminalKey(panel, name)).toBeVisible();
      expect(
        await terminalKey(panel, name).evaluate((button) => {
          const box = button.getBoundingClientRect();
          return box.width >= 44 && box.height >= 44;
        }),
      ).toBe(true);
    }
    await expect(terminalKey(panel, "Ctrl+C")).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(panel.locator(".side-panel-names p")).toHaveText(
      "Execution session",
    );
    expect(dashboard.claudeAttaches()).toHaveLength(1);
    expect(dashboard.claudeAttaches()[0]?.id).toBe(native.shortId);

    await test.step("focus stays on the terminal textarea across toolbar taps", async () => {
      await focusByTouch(panel);
      await tapTerminalKey(panel, "Tab");
      await tapTerminalKey(panel, "Left");
      await tapTerminalKey(panel, "Right");
      await expect.poll(() => sent.join("")).toBe("\t\u001b[D\u001b[C");
      await expect(rows).toContainText("› Red");
    });

    await test.step("Esc cancels the open option menu without confirming", async () => {
      await tapTerminalKey(panel, "Esc");
      await expect.poll(() => sent.join("")).toBe("\t\u001b[D\u001b[C\u001b");
      await expect(rows).toContainText("cancelled");
      await expect(rows).not.toContainText("Choose a color");
      await expect(rows).not.toContainText("› Red");
      expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
    });

    await test.step("reopen the same session for menu confirm after Esc cancel", async () => {
      await tapWhereShown(panel.getByRole("button", { name: "Close" }));
      await expect(panel).toHaveCount(0);
      await tapWhereShown(sidebar.button);
      await tapWhereShown(sidebar.entry(title));
      await expect(rows).toContainText("Choose a color");
      await expect(rows).toContainText("› Red");
      expect(dashboard.claudeAttaches()).toHaveLength(2);
      expect(dashboard.claudeAttaches()[1]?.id).toBe(native.shortId);
    });

    await test.step("arrows change menu selection; swipe leaves sent and selection alone; Down twice then Enter confirms", async () => {
      await focusByTouch(panel);
      const beforeArrows = [...sent];
      await tapTerminalKey(panel, "Down");
      await expect(rows).toContainText("› Blue");
      await expect(rows).not.toContainText("› Red");
      const afterDown = [...sent];
      expect(afterDown.join("")).toBe(`${beforeArrows.join("")}\u001b[B`);
      const viewport = panel.locator(".xterm-scrollable-element");
      const bottom = await rows.textContent();
      await scrollByTouch(page, viewport, 100);
      await expect.poll(() => rows.textContent()).not.toBe(bottom);
      await expect(rows).toContainText(/menu history [0-9]+/);
      expect(sent).toEqual(afterDown);
      await scrollByTouch(page, viewport, -400);
      await expect(rows).toContainText("› Blue");
      expect(sent).toEqual(afterDown);
      await tapTerminalKey(panel, "Up");
      await expect(rows).toContainText("› Red");
      await expect
        .poll(() => sent.join(""))
        .toBe(`${afterDown.join("")}\u001b[A`);
      await tapTerminalKey(panel, "Down");
      await tapTerminalKey(panel, "Down");
      await expect(rows).toContainText("› Green");
      await tapTerminalKey(panel, "Enter");
      await expect(rows).toContainText("echo Green");
      await expect
        .poll(() => dashboard.claudeAttaches()[1]?.lines)
        .toEqual(["Green"]);
      expect(sent.join("")).toBe(
        `${beforeArrows.join("")}\u001b[B\u001b[A\u001b[B\u001b[B\r`,
      );
    });

    await test.step("expandable Ctrl+C, Close and session identity stay reachable", async () => {
      await focusByTouch(panel);
      await tapWhereShown(terminalKey(panel, "More terminal keys"));
      await expect(terminalKey(panel, "More terminal keys")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(terminalKey(panel, "Ctrl+C")).toBeVisible();
      const beforeInterrupt = sent.length;
      await tapTerminalKey(panel, "Ctrl+C");
      await expect
        .poll(() => sent.slice(beforeInterrupt).join(""))
        .toBe("\u0003");
      await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
      await expect(panel.locator(".side-panel-names p")).toHaveText(
        "Execution session",
      );
      expect(
        dashboard.claudeAttaches().every(({ id }) => id === native.shortId),
      ).toBe(true);
    });
  });
});

test.describe("desktop terminal without phone key toolbar", () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    hasTouch: false,
  });

  test("fine-pointer desktop keeps today's terminal chrome without the toolbar", async ({
    page,
    dashboard,
  }) => {
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#desktop-no-toolbar",
      title: "Desktop terminal without phone keys",
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry("Desktop terminal without phone keys").click();
    const panel = page.getByRole("region", { name: "Terminal" });
    await expect(panel.locator(".xterm-rows")).toContainText(
      `attached ${native.shortId}`,
    );
    await expect(terminalKeyToolbar(panel)).toBeHidden();
    await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
  });
});
