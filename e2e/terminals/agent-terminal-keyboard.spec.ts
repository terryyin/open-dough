// Command+Shift+Escape is not the terminal's Escape. Plain Escape still reaches
// the session, and an open launch dialog keeps the chord. Close's tooltip names
// the shortcut while its accessible name stays Close. The page's own dashboard
// server attaches the synthetic `claude` (./fixtures/fake-claude).

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { watchCommandShortcut } from "../../dashboard/test-support/pageShortcutsPage.ts";
import { tooltipOf } from "../../dashboard/test-support/frameIconControl.ts";
import { control as frameControl } from "../../dashboard/test-support/sidePanelFrame.ts";
import {
  openStoryColumnsBoard,
  type LaunchDialog,
  type LaunchedSession,
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
  session: LaunchedSession;
  terminal: Terminal;
  dialog: LaunchDialog;
  sent: string[];
  closeKeyTaken: () => Promise<boolean[] | undefined>;
};

let columnsJourney: StoryColumnsJourney;
let scene: Scene;

test.describe("Command+Shift+Escape while the terminal stays", () => {
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("plain Escape reaches the session, and an open dialog keeps Command+Shift+Escape", async ({
    page,
    dashboard,
  }) => {
    await test.step("Given the story columns page is open", async () => {
      dashboard.claudeScenario("launched");
      scene = {
        board: await openStoryColumnsBoard(page, columnsJourney),
        session: undefined as unknown as LaunchedSession,
        terminal: undefined as unknown as Terminal,
        dialog: undefined as unknown as LaunchDialog,
        sent: noteTerminalTraffic(page).sent,
        closeKeyTaken: () => Promise.resolve(undefined),
      };
    });

    await test.step("And the board shows the queued stories", async () => {
      await scene.board.showsStories(queued);
    });

    await test.step("And the page has settled", async () => {
      await scene.board.settled();
    });

    await test.step("And Execution is launched for the ready story", async () => {
      scene.session = await scene.board.launch(readyStory, "Execution");
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

    await test.step("Then Close's tooltip names the shortcut", async () => {
      const close = frameControl(scene.terminal.panel, "Close");
      await expect(tooltipOf(close, "Close (⌘⇧Esc)")).toHaveCount(1);
    });

    await test.step("And its accessible name stays Close", async () => {
      await expect(
        scene.terminal.panel.getByRole("button", { name: "Close" }),
      ).toHaveCount(1);
    });

    await test.step("Given the keyboard is in the terminal", async () => {
      expect(await scene.terminal.containsKeyboard()).toBe(true);
    });

    await test.step("When the developer types x and presses Escape", async () => {
      await scene.terminal.insertText("x");
      await scene.terminal.pressKey("Escape");
    });

    await test.step("And types y and presses Enter", async () => {
      await scene.terminal.insertText("y");
      await scene.terminal.pressKey("Enter");
    });

    await test.step("Then the session receives the escape and the terminal stays open", async () => {
      await expect
        .poll(() => scene.session.attaches(dashboard)[0]?.lines)
        .toEqual(["x\u001by"]);
      expect(scene.sent).toContain("\u001b");
      await scene.terminal.expectShown();
    });

    await test.step("Given the launch dialog is open", async () => {
      scene.dialog = await scene.board.openStartDialog(
        notRefinedStory,
        "Execution",
      );
    });

    await test.step("When the developer presses Command+Shift+Escape", async () => {
      await scene.terminal.pressKey(closeKey);
    });

    await test.step("Then the terminal stays open and the chord is not taken", async () => {
      await scene.terminal.expectShown();
      expect(await scene.closeKeyTaken()).toEqual([false]);
    });

    await test.step("And Escape dismisses the dialog if it is still open", async () => {
      if (await scene.dialog.isShown()) {
        await scene.terminal.pressKey("Escape");
      }
      await scene.dialog.expectHidden();
      await scene.terminal.expectShown();
    });
  });
});
