import {
  closeSidePanel,
  sidePanelNamesOf,
} from "../../dashboard/test-support/sidePanelFrame.ts";
// Phone key toolbar and scroll-versus-navigate on the ordinary
// page/xterm/WebSocket/PTY path. Desktop fine-pointer chrome stays without
// the toolbar or composer; swipe still scrolls history only. Composer Insert
// lives in ./agent-terminal-touch-composer.spec.ts.
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  expectTerminalInputFocused,
  expectTerminalText,
  expectNoTerminalText,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import { tapWhereShown } from "../../dashboard/test-support/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../dashboard/test-support/touchLaunchPage.ts";
import { scrollByTouch } from "../../dashboard/test-support/touchGestures.ts";
import {
  noteTerminalTraffic,
  touchTerminal,
} from "../../dashboard/test-support/touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
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
    const native = await composeSession(dashboard, "open-dough", {
      identity: "SEED-901#phone-terminal-keys",
      title,
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const { sent } = noteTerminalTraffic(page);
    await tapWhereShown(sidebar.entry(title));
    const panel = terminalPanel(page);
    const touch = touchTerminal(panel);
    const { rows } = terminalScreenParts(panel);
    const primary = touch.primaryKeys;
    await expectTerminalText(panel, "Choose a color");
    await expectTerminalText(panel, "› Red");
    await expect(touch.toolbar).toBeVisible();
    for (const name of [
      "Esc",
      "Tab",
      "Up",
      "Down",
      "Left",
      "Right",
      "Enter",
      "Paste",
      "More terminal keys",
    ]) {
      await expect(touch.key(name)).toBeVisible();
      await touch.expectMinTouchTarget(touch.key(name));
    }
    await expect(touch.composeToggle).toHaveCount(0);
    await expect(touch.draft).toHaveCount(0);
    await expect(touch.key("Ctrl+C")).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(sidePanelNamesOf(panel).sessionName).toHaveText(
      "Execution session",
    );
    expect(dashboard.claudeAttaches()).toHaveLength(1);
    expect(dashboard.claudeAttaches()[0]?.id).toBe(native.shortId);

    await test.step("focus stays on the terminal textarea across toolbar taps", async () => {
      await touch.focus();
      await touch.tapKey("Tab");
      await scrollByTouch(page, primary, -150, "horizontal");
      await expect
        .poll(() => primary.evaluate((lane) => lane.scrollLeft))
        .toBeGreaterThan(0);
      await touch.tapKey("Left");
      await touch.tapKey("Right");
      await expect.poll(() => sent.join("")).toBe("\t\u001b[D\u001b[C");
      await expectTerminalText(panel, "› Red");
    });

    await test.step("Esc cancels the open option menu without confirming", async () => {
      await scrollByTouch(page, primary, 150, "horizontal");
      await expect
        .poll(() => primary.evaluate((lane) => lane.scrollLeft))
        .toBe(0);
      await touch.tapKey("Esc");
      await expect.poll(() => sent.join("")).toBe("\t\u001b[D\u001b[C\u001b");
      await expectTerminalText(panel, "cancelled");
      await expectNoTerminalText(panel, "Choose a color");
      await expectNoTerminalText(panel, "› Red");
      expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
    });

    await test.step("reopen the same session for menu confirm after Esc cancel", async () => {
      await closeSidePanel(panel, { using: "touch" });
      await expect(panel).toHaveCount(0);
      await tapWhereShown(sidebar.button);
      await tapWhereShown(sidebar.entry(title));
      await expectTerminalText(panel, "Choose a color");
      await expectTerminalText(panel, "› Red");
      expect(dashboard.claudeAttaches()).toHaveLength(2);
      expect(dashboard.claudeAttaches()[1]?.id).toBe(native.shortId);
    });

    await test.step("arrows change menu selection; swipe leaves sent and selection alone; Down twice then Enter confirms", async () => {
      await touch.focus();
      const beforeArrows = [...sent];
      // Beside Enter, Paste, Select and More this phone's lane holds three
      // whole keys; a stroke brings Down in beside Up.
      await touch.bringKeyIntoView("Down");
      await touch.tapKey("Down");
      await expectTerminalText(panel, "› Blue");
      await expectNoTerminalText(panel, "› Red");
      const afterDown = [...sent];
      expect(afterDown.join("")).toBe(`${beforeArrows.join("")}\u001b[B`);
      const viewport = panel.locator(".xterm-scrollable-element");
      const bottom = await rows.textContent();
      await scrollByTouch(page, viewport, 100);
      await expect.poll(() => rows.textContent()).not.toBe(bottom);
      await expectTerminalText(panel, /menu history [0-9]+/);
      expect(sent).toEqual(afterDown);
      await scrollByTouch(page, viewport, -400);
      await expectTerminalText(panel, "› Blue");
      expect(sent).toEqual(afterDown);
      await touch.tapKey("Up");
      await expectTerminalText(panel, "› Red");
      await expect
        .poll(() => sent.join(""))
        .toBe(`${afterDown.join("")}\u001b[A`);
      await touch.tapKey("Down");
      await touch.tapKey("Down");
      await expectTerminalText(panel, "› Green");
      await touch.tapKey("Enter");
      await expectTerminalText(panel, "echo Green");
      await expect
        .poll(() => dashboard.claudeAttaches()[1]?.lines)
        .toEqual(["Green"]);
      expect(sent.join("")).toBe(
        `${beforeArrows.join("")}\u001b[B\u001b[A\u001b[B\u001b[B\r`,
      );
    });

    await test.step("expandable Ctrl+C and Compose, Close and session identity stay reachable", async () => {
      await touch.focus();
      await tapWhereShown(touch.key("More terminal keys"));
      await expect(touch.key("More terminal keys")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(touch.key("Ctrl+C")).toBeVisible();
      await expect(touch.composeToggle).toBeVisible();
      await touch.expectMinTouchTarget(touch.composeToggle);
      const beforeInterrupt = sent.length;
      // The opened keys are wider than this phone; the toolbar scrolls.
      await touch.bringKeyIntoView("Ctrl+C");
      await touch.tapKey("Ctrl+C");
      await expect
        .poll(() => sent.slice(beforeInterrupt).join(""))
        .toBe("\u0003");
      await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
      await expect(sidePanelNamesOf(panel).sessionName).toHaveText(
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

  test("fine-pointer desktop keeps today's terminal chrome without the toolbar or composer", async ({
    page,
    dashboard,
  }) => {
    const native = await composeSession(dashboard, "open-dough", {
      identity: "SEED-901#desktop-no-toolbar",
      title: "Desktop terminal without phone keys",
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    const { sent } = noteTerminalTraffic(page);
    await sidebar.entry("Desktop terminal without phone keys").click();
    const panel = terminalPanel(page);
    const touch = touchTerminal(panel);
    await expectTerminalText(panel, `attached ${native.shortId}`);
    await expect(touch.toolbar).toBeHidden();
    await expect(touch.key("Paste")).toBeHidden();
    await expect(touch.composeToggle).toBeHidden();
    await expect(touch.draft).toHaveCount(0);
    await expect(touch.insertDraftButton).toHaveCount(0);
    await expect(touch.hideKeyboard).toBeHidden();
    await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
    const text = "Desktop paste";
    const input = terminalScreenParts(panel).input;
    await expectTerminalInputFocused(panel);
    // Supply the browser paste payload at xterm's input. The headless runner
    // can deliver an empty OS clipboard even after navigator.clipboard writes.
    await input.evaluate((element, value) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", value);
      element.dispatchEvent(
        new ClipboardEvent("paste", { bubbles: true, clipboardData }),
      );
    }, text);
    await expect.poll(() => sent).toEqual([text]);
    await expectTerminalText(panel, text);
    expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  });
});
