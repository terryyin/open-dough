// Command+Shift+Escape closes the terminal panel page-wide, from inside the
// terminal and maximized too, as its Close control does: the panel hides, the
// session keeps running and is not marked done, the keyboard returns to the
// control that opened it, and reopening shows the split. Plain Escape in the
// terminal still reaches the session. An open dialog, as the launch dialog,
// keeps the key, and with no panel the key changes nothing. When the control
// that opened the panel is gone, as a Sessions sidebar entry once the sidebar
// is hidden, closing returns the keyboard to the session's story card instead.
// The page's own dashboard server launches and attaches the synthetic
// `claude` (./fixtures/fake-claude), which records each line entered in its
// terminal; the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
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
import { pressWhereShown } from "./pageLayout.ts";
import { tooltipOf } from "./frameIconControl.ts";
import { watchCommandShortcut } from "./pageShortcutsPage.ts";
import { processRunning } from "./support/processGroup.ts";

test.use({ projectFolders: ["open-dough"] });

const closeKey = "Meta+Shift+Escape";

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

test.describe("Command+Shift+Escape and the terminal panel", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Command+Shift+Escape closes the maximized panel from inside the terminal as Close does, plain Escape reaches the session, an open dialog keeps the key, and with no panel it changes nothing", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { settled, card, launch, action } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { banner } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const control = (name: string) =>
      panel.getByRole("button", { name, exact: true });
    const keyboardInTerminal = () =>
      panel.evaluate((element) => element.contains(document.activeElement));
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    const entry = cardSessionOf(card(readyStory), "Execution");
    const session = await sessionNamedBy(entry);
    const opener = entry.getByRole("button", { name: "Open terminal" });
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
    await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
    const closeKeyTaken = await watchCommandShortcut(page, closeKey);

    await test.step("Close's tooltip names the shortcut while its accessible name stays Close", async () => {
      await expect(tooltipOf(control("Close"), "Close (⌘⇧Esc)")).toHaveCount(1);
      await expect(panel.getByRole("button", { name: "Close" })).toHaveCount(1);
    });

    await test.step("plain Escape in the terminal reaches the session and the panel stays", async () => {
      expect(await keyboardInTerminal()).toBe(true);
      await page.keyboard.type("x");
      await page.keyboard.press("Escape");
      await page.keyboard.type("y");
      await page.keyboard.press("Enter");
      await expect.poll(() => attaches()[0]?.lines).toEqual(["x\u001by"]);
      expect(sent).toContain("\u001b");
      await expect(panel).toBeVisible();
    });

    await test.step("with the launch dialog open, Command+Shift+Escape leaves the panel shown", async () => {
      const dialog = page.getByRole("dialog", {
        name: "Start execution in Claude Code",
      });
      await action(notRefinedStory, "Execution").click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press(closeKey);
      await expect(panel).toBeVisible();
      expect(await closeKeyTaken()).toEqual([false]);
      if (await dialog.isVisible()) {
        await page.keyboard.press("Escape");
      }
      await expect(dialog).toBeHidden();
      await expect(panel).toBeVisible();
    });

    await test.step("maximized with the keyboard in the terminal, Command+Shift+Escape closes the panel as Close does and returns the keyboard to its opener", async () => {
      await pressWhereShown(control("Maximize"));
      await expect(control("Restore")).toBeVisible();
      await expect(banner).toBeHidden();
      const input = panel.locator("textarea");
      await input.focus();
      expect(await keyboardInTerminal()).toBe(true);
      const sentBefore = sent.length;
      // Whether the key reached the terminal's input, where xterm would turn
      // it into ESC for the session.
      await input.evaluate((element) => {
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

      await page.keyboard.press(closeKey);
      await expect(panel).toHaveCount(0);
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
      await page.keyboard.press(closeKey);
      await expect(panel).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect(banner).toBeVisible();
      expect(attaches()).toHaveLength(attachedBefore);
      await expectMembership(page, queued);
    });

    await test.step("reopening shows the session in the split", async () => {
      await opener.click();
      await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
      await expect(control("Maximize")).toBeVisible();
      await expect(banner).toBeVisible();
    });

    await test.step("with its opener gone, Command+Shift+Escape returns the keyboard to the session's story card", async () => {
      const sidebar = sidebarParts(page);
      await control("Close").click();
      await expect(panel).toHaveCount(0);
      await sidebar.button.click();
      await sidebar.entry(readyStory).click();
      await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
      // Command+B hides the sidebar, and the entry that opened the panel
      // with it.
      await page.keyboard.press("Meta+B");
      await expect(sidebar.sidebar).toBeHidden();
      await page.keyboard.press(closeKey);
      await expect(panel).toHaveCount(0);
      await expect(card(readyStory)).toBeFocused();
    });
  });
});
