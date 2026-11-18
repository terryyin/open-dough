// Command+Enter on a focused ready terminal submits one ordinary Enter, asks
// a prompt sessions reread, and closes as Close once activity leaves ready.
// Disconnect without leave-ready keeps the panel and names confirmation
// unavailable. A working session or unfocused input does not submit-and-close;
// plain Enter still submits without closing. Meta+Enter is prevented from the
// session. The page's own dashboard server launches and attaches the synthetic
// `claude` (./fixtures/fake-claude).

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectTerminalText,
  focusTerminalInput,
  insertTerminalText,
  pressTerminalKey,
  terminalPanel,
  terminalScreenParts,
  terminalStatus,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  storyCardSessionOf,
  expectMembership,
  parts,
  sessionNamedBy,
} from "../../dashboard/test-support/dashboardPage.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { openTerminalControl } from "../../dashboard/test-support/sessionEntryAccess.ts";
import { watchCommandShortcut } from "../../dashboard/test-support/pageShortcutsPage.ts";
import { processRunning } from "../../dashboard/test-support/support/processGroup.ts";
import { noteTerminalTraffic } from "../../dashboard/test-support/touchTerminalPage.ts";
import {
  expectConfirmationUnavailable,
  sessionReadsOnPage,
  submitAndCloseKey,
} from "../../dashboard/test-support/submitAndCloseTerminalPage.ts";
import { submitAndCloseEnter } from "../../dashboard/src/submitAndCloseTerminal.ts";

test.use({ projectFolders: ["open-dough"] });

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};

test.describe("Command+Enter submit and close", () => {
  let columnsJourney: StoryColumnsJourney;
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
    dashboard.claudeScenario("launched");
    const { settled, card, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { banner } = parts(page);
    const panel = terminalPanel(page);
    const { input } = terminalScreenParts(panel);
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
    const { sent } = noteTerminalTraffic(page);
    await opener.click();
    await expectTerminalText(panel, `attached ${session.slice(0, 8)}`);
    const submitKeyTaken = await watchCommandShortcut(page, submitAndCloseKey);

    await test.step("working session: Command+Enter is taken, sends no Enter, panel stays", async () => {
      await focusTerminalInput(panel);
      const sentBefore = sent.length;
      const linesBefore = attaches()[0]?.lines.length ?? 0;
      await pressTerminalKey(page, submitAndCloseKey);
      expect(await submitKeyTaken()).toEqual([true]);
      expect(sent.slice(sentBefore)).toEqual([]);
      expect(attaches()[0]?.lines.length ?? 0).toBe(linesBefore);
      await expect(panel).toBeVisible();
    });

    await test.step("plain Enter still submits without closing", async () => {
      await insertTerminalText(page, "stay");
      await pressTerminalKey(page, "Enter");
      await expect.poll(() => attaches()[0]?.lines).toEqual(["stay"]);
      await expect(panel).toBeVisible();
    });

    dashboard.claudeSessionBecomes(session, "done-live");
    await sessionReadsOnPage(page, entry, "Ready for review");
    await focusTerminalInput(panel);

    await test.step("ready Command+Enter submits one line and closes once working, as Close", async () => {
      await insertTerminalText(page, "follow up");
      const sentBefore = sent.length;
      await pressTerminalKey(page, submitAndCloseKey);
      dashboard.claudeSessionBecomes(session, "working");
      await expect
        .poll(() => attaches()[0]?.lines)
        .toEqual(["stay", "follow up"]);
      expect(sent.slice(sentBefore)).toEqual([submitAndCloseEnter]);
      expect(await submitKeyTaken()).toContain(true);
      await expect(panel).toHaveCount(0);
      await expect(banner).toBeVisible();
      await expect(opener).toBeFocused();
      await expect
        .poll(() =>
          attaches().every(
            (attached) =>
              attached.endedBy !== undefined && !processRunning(attached.pid),
          ),
        )
        .toBe(true);
      const record = (await recordsOf(dashboard, "open-dough")).find(
        (kept) =>
          (kept as { session: { sessionId: string } }).session.sessionId ===
          session,
      ) as { doneAt?: string } | undefined;
      expect(record).toMatchObject({ sessionState: { kind: "available" } });
      expect(record?.doneAt).toBeUndefined();
    });

    await opener.click();
    await expectTerminalText(panel, `attached ${session.slice(0, 8)}`);
    dashboard.claudeSessionBecomes(session, "done-live");
    await sessionReadsOnPage(page, entry, "Ready for review");
    await focusTerminalInput(panel);

    await test.step("disconnect before leave-ready keeps the panel and names confirmation unavailable", async () => {
      await insertTerminalText(page, "retry later");
      await pressTerminalKey(page, submitAndCloseKey);
      await expect
        .poll(() => attaches().at(-1)?.lines.includes("retry later"))
        .toBe(true);
      const live = attaches().at(-1);
      expect(live).toBeDefined();
      if (live === undefined) {
        throw new Error("expected a live attach");
      }
      process.kill(live.pid);
      await expectConfirmationUnavailable(panel);
      await expect(panel).toBeVisible();
      await expect(terminalStatus(panel)).toContainText("The terminal ended");
    });

    await test.step("Command+Enter without terminal-input focus does not take the chord for this story", async () => {
      const linesBefore = attaches().at(-1)?.lines.length ?? 0;
      await opener.focus();
      expect(await input.evaluate((el) => el === document.activeElement)).toBe(
        false,
      );
      await pressTerminalKey(page, submitAndCloseKey);
      const taken = await submitKeyTaken();
      expect(taken?.at(-1)).toBe(false);
      expect(attaches().at(-1)?.lines.length ?? 0).toBe(linesBefore);
      await expect(panel).toBeVisible();
    });
  });
});
