import {
  control as frameControl,
  maximizeSidePanel,
} from "../../dashboard/tests/sidePanelFrame.ts";
// Command+Shift+Escape closes the terminal page-wide, from inside the
// terminal and maximized too, as its Close control does: the panel hides, the
// session keeps running and is not marked done, the keyboard returns to the
// control that opened it, and reopening shows the split. Plain Escape in the
// terminal still reaches the session. An open dialog, as the launch dialog,
// keeps the key, and with no panel the key changes nothing. When the control
// that opened the panel is gone, as a Sessions sidebar Session entry once the sidebar
// is hidden, closing returns the keyboard to the session in its current story card.
// The page's own dashboard server launches and attaches the synthetic
// `claude` (./fixtures/fake-claude), which records each line entered in its
// terminal; the real one is never reached.

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { openTerminalControl } from "../../dashboard/tests/terminalScreenPage.ts";
import { terminalScreen } from "../../dashboard/tests/terminalScreen.ts";
import {
  storyCardSessionOf,
  expectMembership,
  parts,
  sessionNamedBy,
} from "../../dashboard/tests/dashboardPage.ts";
import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/tests/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/tests/storyColumnsPage.ts";
import { sessionsSidebarParts } from "../../dashboard/tests/sessionsSidebarPage.ts";
import { tooltipOf } from "../../dashboard/tests/frameIconControl.ts";
import { watchCommandShortcut } from "../../dashboard/tests/pageShortcutsPage.ts";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";

test.use({ projectFolders: ["open-dough"] });

const closeKey = "Meta+Shift+Escape";

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

test.describe("Command+Shift+Escape and the terminal", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Command+Shift+Escape closes the maximized panel from inside the terminal as Close does, plain Escape reaches the session, an open dialog keeps the key, and with no panel it changes nothing", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { settled, card, launch, action } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { banner } = parts(page);
    const terminal = terminalScreen(page);
    const control = (name: string) => frameControl(terminal.panel, name);
    const keyboardInTerminal = () =>
      terminal.panel.evaluate((element) =>
        element.contains(document.activeElement),
      );
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    const entry = storyCardSessionOf(card(readyStory), "Execution");
    const session = await sessionNamedBy(entry);
    const opener = openTerminalControl(entry);
    const attaches = () =>
      dashboard
        .claudeAttaches()
        .filter((attached) => attached.id === session.slice(0, 8));
    // Every input the terminal sends its session over the attachment, in
    // order.
    const sent: string[] = [];
    page.on("websocket", (socket) => {
      socket.on("framesent", ({ payload }) => {
        if (typeof payload !== "string") {
          return;
        }
        const { input } = JSON.parse(payload) as { input?: unknown };
        if (typeof input === "string") {
          sent.push(input);
        }
      });
    });
    await opener.click();
    await terminal.expectText(`attached ${session.slice(0, 8)}`);
    const closeKeyTaken = await watchCommandShortcut(page, closeKey);

    await test.step("Close's tooltip names the shortcut while its accessible name stays Close", async () => {
      await expect(tooltipOf(control("Close"), "Close (⌘⇧Esc)")).toHaveCount(1);
      await expect(
        terminal.panel.getByRole("button", { name: "Close" }),
      ).toHaveCount(1);
    });

    await test.step("plain Escape in the terminal reaches the session and the panel stays", async () => {
      expect(await keyboardInTerminal()).toBe(true);
      await terminal.insertText("x");
      await terminal.pressKey("Escape");
      await terminal.insertText("y");
      await terminal.pressKey("Enter");
      await expect.poll(() => attaches()[0]?.lines).toEqual(["x\u001by"]);
      expect(sent).toContain("\u001b");
      await expect(terminal.panel).toBeVisible();
    });

    await test.step("with the launch dialog open, Command+Shift+Escape leaves the panel shown", async () => {
      const dialog = page.getByRole("dialog", {
        name: "Start execution in Claude Code",
      });
      await action(notRefinedStory, "Execution").click();
      await expect(dialog).toBeVisible();
      await terminal.pressKey(closeKey);
      await expect(terminal.panel).toBeVisible();
      expect(await closeKeyTaken()).toEqual([false]);
      if (await dialog.isVisible()) {
        await terminal.pressKey("Escape");
      }
      await expect(dialog).toBeHidden();
      await expect(terminal.panel).toBeVisible();
    });

    await test.step("maximized with the keyboard in the terminal, Command+Shift+Escape closes the panel as Close does and returns the keyboard to its opener", async () => {
      await maximizeSidePanel(terminal.panel);
      await expect(control("Restore")).toBeVisible();
      await expect(banner).toBeHidden();
      await terminal.focusInput();
      expect(await keyboardInTerminal()).toBe(true);
      const sentBefore = sent.length;
      // Whether the key reached the terminal's input, where xterm would turn
      // it into ESC for the session.
      await terminal.input.evaluate((element) => {
        (window as unknown as { terminalGotKey: boolean }).terminalGotKey =
          false;
        element.addEventListener("keydown", (event) => {
          if ((event as KeyboardEvent).key !== "Escape") {
            return;
          }
          (window as unknown as { terminalGotKey: boolean }).terminalGotKey =
            true;
        });
      });

      await terminal.pressKey(closeKey);
      await expect(terminal.panel).toHaveCount(0);
      await expect(banner).toBeVisible();
      await expect(opener).toBeFocused();
      expect(await closeKeyTaken()).toEqual([false, true]);
      // Detached only: the attach ended, the session is still listed and
      // not marked done.
      await expect
        .poll(() =>
          attaches().every(
            (attached) =>
              attached.endedBy !== undefined && !processRunning(attached.pid),
          ),
        )
        .toBe(true);
      // The key never reached the terminal and sent the session nothing, so no
      // ESC interrupted it.
      expect(sent.slice(sentBefore)).toEqual([]);
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { terminalGotKey: boolean }).terminalGotKey,
        ),
      ).toBe(false);
      const record = (await recordsOf(dashboard, "open-dough")).find(
        (kept) =>
          (kept as { session: { sessionId: string } }).session.sessionId ===
          session,
      ) as { doneAt?: string } | undefined;
      expect(record).toMatchObject({ sessionState: { kind: "available" } });
      expect(record?.doneAt).toBeUndefined();
      await expectMembership(page, queued);
    });

    await test.step("with no panel, Command+Shift+Escape changes nothing", async () => {
      const attachedBefore = attaches().length;
      await terminal.pressKey(closeKey);
      await expect(terminal.panel).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect(banner).toBeVisible();
      expect(attaches()).toHaveLength(attachedBefore);
      await expectMembership(page, queued);
    });

    await test.step("reopening shows the session in the split", async () => {
      await opener.click();
      await terminal.expectText(`attached ${session.slice(0, 8)}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
    });

    await test.step("with its opener gone, Command+Shift+Escape returns the keyboard to the session in its current story card", async () => {
      const sidebar = sessionsSidebarParts(page);
      await terminal.close();
      await expect(terminal.panel).toHaveCount(0);
      await sidebar.button.click();
      await sidebar.entry(readyStory).click();
      await terminal.expectText(`attached ${session.slice(0, 8)}`);
      // Command+B hides the sidebar, and the entry that opened the panel
      // with it.
      await terminal.pressKey("Meta+B");
      await expect(sidebar.sidebar).toBeHidden();
      await terminal.pressKey(closeKey);
      await expect(terminal.panel).toHaveCount(0);
      const home = storyCardSessionOf(card(readyStory), "Execution");
      await expect(home).toBeFocused();
      await expect(home).toBeInViewport();
      expect(await sessionNamedBy(home)).toBe(session);
    });
  });
});
