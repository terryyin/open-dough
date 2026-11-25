// Command+Shift+Escape closes the terminal as Close does, maximized or not:
// the panel hides, the session keeps running and is not marked done, and the
// keyboard returns to the control that opened it. With no panel the chord
// changes nothing. When that opener is gone, the keyboard returns to the
// session in its current story card. The page attaches the synthetic `claude`
// (./fixtures/fake-claude).

import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  takenStory,
  notRefinedStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { watchCommandShortcut } from "../../dashboard/test-support/pageShortcutsPage.ts";
import { processRunning } from "../../dashboard/test-support/support/processGroup.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  control as frameControl,
  maximizeSidePanel,
} from "../../dashboard/test-support/sidePanelFrame.ts";
import {
  openStoryColumnsBoard,
  type ListedSession,
  type StoryColumnsBoard,
} from "../../dashboard/test-support/storyColumnsBoard.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";
import { noteTerminalTraffic } from "../../dashboard/test-support/touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });

const closeKey = "Meta+Shift+Escape";
const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

type Terminal = ReturnType<typeof terminalScreen>;
type Scene = {
  board: StoryColumnsBoard;
  session: ListedSession;
  terminal: Terminal;
  sent: string[];
  closeKeyTaken: () => Promise<boolean[] | undefined>;
  sentBefore: number;
  attachedBefore: number;
};

let columnsJourney: StoryColumnsJourney;
let scene: Scene;

test.describe("Command+Shift+Escape closes the terminal", () => {
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("closes the maximized panel as Close does, does nothing with no panel, and returns to the story card when the opener is gone", async ({
    page,
    dashboard,
  }) => {
    await test.step("Given the ready story has an existing Execution session", async () => {
      const { sessionId } = await composeSession(dashboard, "open-dough", {
        identity: readyIdentity,
        title: readyStory,
      });
      const board = await openStoryColumnsBoard(page, columnsJourney);
      scene = {
        board,
        session: board.listedSession(readyStory, sessionId),
        terminal: undefined as unknown as Terminal,
        sent: noteTerminalTraffic(page).sent,
        closeKeyTaken: () => Promise.resolve(undefined),
        sentBefore: 0,
        attachedBefore: 0,
      };
    });

    await test.step("And the board shows the queued stories", async () => {
      await scene.board.showsStories(queued);
      await scene.board.settled();
    });

    await test.step("Given that session's terminal shows its attachment", async () => {
      scene.terminal = await scene.session.openTerminal();
      await scene.terminal.expectText(
        `attached ${scene.session.id.slice(0, 8)}`,
      );
    });

    await test.step("And Command+Shift+Escape is watched", async () => {
      scene.closeKeyTaken = await watchCommandShortcut(page, closeKey);
    });

    await test.step("Given the terminal is maximized beside a hidden banner", async () => {
      await maximizeSidePanel(scene.terminal.panel);
      await expect(frameControl(scene.terminal.panel, "Restore")).toBeVisible();
      await scene.board.expectBannerHidden();
    });

    await test.step("And the keyboard is in the focused terminal input", async () => {
      await scene.terminal.focusInput();
      expect(await scene.terminal.containsKeyboard()).toBe(true);
    });

    await test.step("And Escape reaching that input is watched", async () => {
      await scene.terminal.input.evaluate((element) => {
        const holder = window as unknown as { terminalGotKey: boolean };
        holder.terminalGotKey = false;
        element.addEventListener("keydown", (event) => {
          if ((event as KeyboardEvent).key !== "Escape") return;
          holder.terminalGotKey = true;
        });
      });
    });

    await test.step("When the developer presses Command+Shift+Escape", async () => {
      scene.sentBefore = scene.sent.length;
      await scene.terminal.pressKey(closeKey);
    });

    await test.step("Then the terminal closes as Close and the opener is focused", async () => {
      await scene.terminal.expectClosed();
      await scene.board.expectBannerShown();
      await scene.session.expectOpenerFocused();
    });

    await test.step("And the chord was taken", async () => {
      expect(await scene.closeKeyTaken()).toEqual([true]);
    });

    await test.step("And the attach ended", async () => {
      await expect
        .poll(() =>
          scene.session
            .attaches(dashboard)
            .every(
              (attached) =>
                attached.endedBy !== undefined && !processRunning(attached.pid),
            ),
        )
        .toBe(true);
    });

    await test.step("And the chord sent the session nothing", async () => {
      expect(scene.sent.slice(scene.sentBefore)).toEqual([]);
      const reached = await page.evaluate(
        () => (window as unknown as { terminalGotKey: boolean }).terminalGotKey,
      );
      expect(reached).toBe(false);
    });

    await test.step("And the session stays available and is not marked done", async () => {
      const record = (await recordsOf(dashboard, "open-dough")).find(
        (kept) =>
          (kept as { session: { sessionId: string } }).session.sessionId ===
          scene.session.id,
      ) as { doneAt?: string } | undefined;
      expect(record).toMatchObject({ sessionState: { kind: "available" } });
      expect(record?.doneAt).toBeUndefined();
    });

    await test.step("And the board still shows the queued stories", async () => {
      await scene.board.showsStories(queued);
    });

    await test.step("When Command+Shift+Escape is pressed with no terminal", async () => {
      scene.attachedBefore = scene.session.attaches(dashboard).length;
      await scene.terminal.pressKey(closeKey);
    });

    await test.step("Then the terminal stays closed and the opener keeps the keyboard", async () => {
      await scene.terminal.expectClosed();
      await scene.session.expectOpenerFocused();
      await scene.board.expectBannerShown();
    });

    await test.step("And nothing else changes", async () => {
      expect(scene.session.attaches(dashboard)).toHaveLength(
        scene.attachedBefore,
      );
      await scene.board.showsStories(queued);
    });

    await test.step("When the developer reopens the terminal", async () => {
      scene.terminal = await scene.session.openTerminal();
    });

    await test.step("Then the session shows in the split", async () => {
      await scene.terminal.expectText(
        `attached ${scene.session.id.slice(0, 8)}`,
      );
      await expect(
        frameControl(scene.terminal.panel, "Maximize"),
      ).toBeVisible();
      await scene.board.expectBannerShown();
    });

    await test.step("Given the terminal is closed again", async () => {
      await scene.terminal.close();
      await scene.terminal.expectClosed();
    });

    await test.step("When the session is opened from the Sessions sidebar", async () => {
      const sidebar = sessionsSidebarParts(page);
      await sidebar.button.click();
      await sidebar.entry(readyStory).click();
    });

    await test.step("Then the terminal shows that attachment", async () => {
      await scene.terminal.expectText(
        `attached ${scene.session.id.slice(0, 8)}`,
      );
    });

    await test.step("When the developer hides the Sessions sidebar", async () => {
      await scene.terminal.pressKey("Meta+B");
      await expect(sessionsSidebarParts(page).sidebar).toBeHidden();
    });

    await test.step("And presses Command+Shift+Escape", async () => {
      await scene.terminal.pressKey(closeKey);
    });

    await test.step("Then the keyboard returns to the session on its story card", async () => {
      await scene.terminal.expectClosed();
      await scene.session.expectFocused();
      await scene.session.expectInViewport();
    });

    await test.step("And that entry still names the same session", async () => {
      expect(await scene.session.namedId()).toBe(scene.session.id);
    });
  });
});
