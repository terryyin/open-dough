// A session entry shows its host's changes within one records-read pace of
// page time, without a reload. What each state reads is
// ../../dashboard/backend-tests/sessions/session-reading-rule.spec.ts.

import type { Page } from "@playwright/test";
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  openTerminalControl,
  openTerminalFromEntry,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";
import { isTerminalSocket } from "../../dashboard/test-support/support/terminalSockets.ts";
import {
  expectMembership,
  sessionNamedBy,
  storyCardSessionOf,
  shownDoneSessionEntriesOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  openTakenBacklog,
  takenBacklogStories,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  readyIdentity,
  readyStory,
  type LaunchJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "../../dashboard/test-support/sessionStatePace.ts";
import { markDoneAnyway } from "../../dashboard/test-support/support/markDone.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";

test.use({ projectFolders: ["open-dough"] });

// Opens the ready story's working execution with page time paused.
async function openWorkingStory(
  page: Page,
  dashboard: DashboardServer,
  launchJourney: LaunchJourney,
) {
  const { sessionId: session } = await composeSession(dashboard, "open-dough", {
    identity: readyIdentity,
    title: readyStory,
  });
  await pausePageClockAt(page, new Date());
  const reads = await watchRecordReads(page);
  const { card } = await openTakenBacklog(page, launchJourney);
  const entry = storyCardSessionOf(card(readyStory), "Execution");
  await expectSessionShown(entry, "Working", false);
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await markNotReloaded(page);
  expect(await sessionNamedBy(entry)).toBe(session);
  return { ...reads, entry, session };
}

test("a host change shows on its entry within one pace, without a reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const { entry, session, passOnePace, answeredDuring } =
    await openWorkingStory(page, dashboard, launchJourney);

  await test.step("a pace with nothing changed is answered unchanged", async () => {
    expect(await answeredDuring()).toEqual({ held: true, unchanged: true });
    await expectSessionShown(entry, "Working", false);
  });

  await test.step("a blocked session needs input within one pace", async () => {
    const answered = await answeredDuring(async () => {
      dashboard.claudeSessionBecomes(session, "blocked", "npm test");
      await passOnePace();
    });
    expect(answered).toEqual({ held: true, unchanged: false });
    await expectSessionShown(entry, "Needs input: npm test", true);
  });

  await test.step("a session no longer listed keeps its id, without Open terminal", async () => {
    dashboard.claudeSessionBecomes(session, "forgotten");
    await passOnePace();
    await expectSessionShown(entry, "Session unavailable", false);
    await expect(entry).toContainText(`Session ${session}`);
    await expect(openTerminalControl(entry)).toHaveCount(0);
  });

  await test.step("an unreadable listing shows State unknown until the listing reads again", async () => {
    dashboard.claudeListingFails(true);
    await passOnePace();
    await expectSessionShown(
      entry,
      "State unknown: Claude Code's session list could not be read",
      false,
    );
    await expect(openTerminalControl(entry)).toHaveCount(1);
    dashboard.claudeListingFails(false);
    await passOnePace();
    await expectSessionShown(entry, "Session unavailable", false);
  });

  await expectNotReloaded(page);
  await expectMembership(page, takenBacklogStories);
});

test("attention stays through the terminal, and once marked done no host change brings it back", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const { entry, session, passOnePace } = await openWorkingStory(
    page,
    dashboard,
    launchJourney,
  );
  const needsInput = "Needs input: input needed";

  await test.step("a blocked session still needs input after its terminal is opened, answered and closed", async () => {
    dashboard.claudeSessionBecomes(session, "blocked", "input needed");
    await passOnePace();
    await expectSessionShown(entry, needsInput, true);

    // The attach record precedes native input readiness. Page time stays
    // paused, so wait for the prompt on the socket before typing.
    dashboard.claudeAttachPromptDelay(400);
    const prompt = page
      .waitForEvent("websocket", isTerminalSocket)
      .then((socket) => {
        let output = "";
        return socket.waitForEvent("framereceived", ({ payload }) => {
          if (typeof payload === "string") output += payload;
          return output.includes("Claude Code");
        });
      });
    await Promise.all([prompt, openTerminalFromEntry(entry)]);
    const attach = () => dashboard.claudeAttaches()[0];
    await expect.poll(() => attach()?.id).toBe(session.slice(0, 8));
    const terminal = terminalScreen(page);
    await (await terminal.focusInput()).typeLine("red");
    await expect.poll(() => attach()?.lines).toEqual(["red"]);
    await terminal.close();
    await expect.poll(() => attach()?.endedBy).toBeDefined();
    await passOnePace();
    await expectSessionShown(entry, needsInput, true);
  });

  await test.step("resumed work clears it, and a finished turn asks for review", async () => {
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectSessionShown(entry, "Working", false);
    dashboard.claudeSessionBecomes(session, "done-live");
    await passOnePace();
    await expectSessionShown(entry, "Ready for review", true);
  });

  await test.step("Mark as done clears it at once; working again wakes it, and a later block does not", async () => {
    await markDoneAnyway(entry);
    await expect(entry).toHaveCount(0);
    const retained = await shownDoneSessionEntriesOf(page, readyStory);
    await expectSessionShown(retained, "Done", false);
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectSessionShown(retained, "Working", false);
    dashboard.claudeSessionBecomes(session, "blocked");
    await passOnePace();
    await expectSessionShown(retained, "Done", false);
  });

  await expectNotReloaded(page);
});
