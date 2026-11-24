// Command+Enter submits one Enter on a focused ready terminal and closes as
// Close once activity leaves ready. The synthetic `claude` is ./fixtures/fake-claude.

import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { watchCommandShortcut } from "../../dashboard/test-support/pageShortcutsPage.ts";
import { processRunning } from "../../dashboard/test-support/support/processGroup.ts";
import {
  openStoryColumnsBoard,
  type ListedSession,
  type StoryColumnsBoard,
} from "../../dashboard/test-support/storyColumnsBoard.ts";
import {
  confirmationUnavailable,
  submitAndCloseEnter,
} from "../../dashboard/src/submitAndCloseTerminal.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";
import { noteTerminalTraffic } from "../../dashboard/test-support/touchTerminalPage.ts";

test.use({ projectFolders: ["open-dough"] });

const submitAndCloseKey = "Meta+Enter";
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
  submitKeyTaken: () => Promise<boolean[] | undefined>;
  sentBefore: number;
  linesBefore: number;
};

let columnsJourney: StoryColumnsJourney;
let scene: Scene;

test.describe("Command+Enter submit and close", () => {
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("ready Command+Enter submits one line and closes after leave-ready; disconnect without leave-ready keeps confirmation unavailable; working and plain Enter stay open", async ({
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
        submitKeyTaken: () => Promise.resolve(undefined),
        sentBefore: 0,
        linesBefore: 0,
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

    await test.step("And Command+Enter is watched", async () => {
      scene.submitKeyTaken = await watchCommandShortcut(
        page,
        submitAndCloseKey,
      );
    });

    await test.step("Given the working session's terminal input is focused", async () => {
      await scene.terminal.focusInput();
    });

    await test.step("When the developer presses Command+Enter", async () => {
      scene.sentBefore = scene.sent.length;
      scene.linesBefore =
        scene.session.attaches(dashboard)[0]?.lines.length ?? 0;
      await scene.terminal.pressKey(submitAndCloseKey);
    });

    await test.step("Then the chord is taken and sends no Enter", async () => {
      expect(await scene.submitKeyTaken()).toEqual([true]);
      expect(scene.sent.slice(scene.sentBefore)).toEqual([]);
      expect(scene.session.attaches(dashboard)[0]?.lines.length ?? 0).toBe(
        scene.linesBefore,
      );
    });

    await test.step("And the terminal stays open", async () => {
      await scene.terminal.expectShown();
    });

    await test.step("When the developer submits the line stay with Enter", async () => {
      await scene.terminal.insertText("stay");
      await scene.terminal.pressKey("Enter");
    });

    await test.step("Then the session receives stay and the terminal stays open", async () => {
      await expect
        .poll(() => scene.session.attaches(dashboard)[0]?.lines)
        .toEqual(["stay"]);
      await scene.terminal.expectShown();
    });

    await test.step("Given the session is ready for review and the input is focused", async () => {
      dashboard.claudeSessionBecomes(scene.session.id, "done-live");
      await scene.session.reads("Ready for review");
      await scene.terminal.focusInput();
    });

    await test.step("When the developer types follow up and presses Command+Enter", async () => {
      await scene.terminal.insertText("follow up");
      scene.sentBefore = scene.sent.length;
      await scene.terminal.pressKey(submitAndCloseKey);
    });

    await test.step("And the session starts working", () => {
      dashboard.claudeSessionBecomes(scene.session.id, "working");
    });

    await test.step("Then the session receives that one Enter and both lines", async () => {
      await expect
        .poll(() => scene.session.attaches(dashboard)[0]?.lines)
        .toEqual(["stay", "follow up"]);
      expect(scene.sent.slice(scene.sentBefore)).toEqual([submitAndCloseEnter]);
      expect(await scene.submitKeyTaken()).toContain(true);
    });

    await test.step("And the terminal closes as Close", async () => {
      await scene.terminal.expectClosed();
      await scene.board.expectBannerShown();
      await scene.session.expectOpenerFocused();
    });

    await test.step("And the attach has ended", async () => {
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

    await test.step("And the session stays available and is not marked done", async () => {
      const record = (await recordsOf(dashboard, "open-dough")).find(
        (kept) =>
          (kept as { session: { sessionId: string } }).session.sessionId ===
          scene.session.id,
      ) as { doneAt?: string } | undefined;
      expect(record).toMatchObject({ sessionState: { kind: "available" } });
      expect(record?.doneAt).toBeUndefined();
    });

    await test.step("Given the terminal is open again on the same session", async () => {
      scene.terminal = await scene.session.openTerminal();
      await scene.terminal.expectText(
        `attached ${scene.session.id.slice(0, 8)}`,
      );
    });

    await test.step("And the session is ready for review with the input focused", async () => {
      dashboard.claudeSessionBecomes(scene.session.id, "done-live");
      await scene.session.reads("Ready for review");
      await scene.terminal.focusInput();
    });

    await test.step("When the developer submits retry later with Command+Enter", async () => {
      await scene.terminal.insertText("retry later");
      await scene.terminal.pressKey(submitAndCloseKey);
    });

    await test.step("And that line has reached the session", async () => {
      await expect
        .poll(() =>
          scene.session
            .attaches(dashboard)
            .at(-1)
            ?.lines.includes("retry later"),
        )
        .toBe(true);
    });

    await test.step("When the attach ends before the session leaves ready", () => {
      const live = scene.session.attaches(dashboard).at(-1);
      if (live === undefined) {
        throw new Error("expected a live attach");
      }
      process.kill(live.pid);
    });

    await test.step("Then the terminal stays open and confirmation is unavailable", async () => {
      await scene.terminal.expectStatus(confirmationUnavailable);
      await scene.terminal.expectShown();
      await scene.terminal.expectStatus("The terminal ended");
    });

    await test.step("Given the opener has the keyboard and the input does not", async () => {
      scene.linesBefore =
        scene.session.attaches(dashboard).at(-1)?.lines.length ?? 0;
      await scene.session.focusOpener();
      await scene.terminal.expectInputNotFocused();
    });

    await test.step("When the developer presses Command+Enter", async () => {
      await scene.terminal.pressKey(submitAndCloseKey);
    });

    await test.step("Then the chord is not taken and the terminal stays open", async () => {
      expect((await scene.submitKeyTaken())?.at(-1)).toBe(false);
      expect(scene.session.attaches(dashboard).at(-1)?.lines.length ?? 0).toBe(
        scene.linesBefore,
      );
      await scene.terminal.expectShown();
    });
  });
});
