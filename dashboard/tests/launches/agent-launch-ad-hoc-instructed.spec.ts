// Start session with typed text presents nothing once its session starts, on
// the committed origin of ./agent-launch-story-card.spec.ts
// (../launchJourney.ts): a final report open in the Side panel stays, no
// terminal is requested, and the session is an entry in Taken and the
// Sessions sidebar whose Open terminal shows it; with the Side panel closed
// it stays closed and the keyboard returns to Start session. A start with
// nothing typed: ../terminals/agent-launch-ad-hoc-terminal.spec.ts. Follow
// up: ./agent-launch-follow-up-session.spec.ts. The synthetic `claude`
// (./fixtures/fake-claude) stands for the real one.

import type { Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { parts, sessionNamedBy, sessionStateOf } from "../dashboardPage.ts";
import { terminalPanel, terminalScreenParts } from "../terminalScreenPage.ts";
import {
  expectQuietAdHocActionsRow,
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { retiredSession, retiredTitle } from "../support/followUpSources.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { launchWaitMs } from "../support/launchWait.ts";
import { sidePanelContents } from "../support/sidePanelContents.ts";
import { takenAdHocSession } from "../support/startedAdHocSession.ts";
import { openEntryTerminal } from "../support/startedSessionTerminal.ts";
import { watchTerminalSockets } from "../support/terminalSockets.ts";

test.use({ projectFolders: ["open-dough"] });

const text = "summarize the open issues";

// Starts a session in Open Dough with `text` typed.
async function startInstructed(page: Page) {
  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
}

test("an instructed Start session leaves the open final report in the Side panel, requests no terminal, and its Taken entry's Open terminal shows the session", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const report = "The cache key changed; I restored it.";
  keepLaunchRecords(dashboard, [
    retiredSession(dashboard.home, {
      report,
      landed: "ab".repeat(20),
      doneAt: new Date(Date.now() - 60_000),
    }),
  ]);
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, launchJourney);
  await parts(page)
    .recentlyDone.getByRole("article", { name: new RegExp(retiredTitle) })
    .getByRole("button", { name: "Read final report" })
    .click();
  const finalReport = page.getByRole("region", { name: "Final report" });
  const panel = terminalPanel(page);
  await expect(finalReport).toContainText(report);
  const terminalSockets = watchTerminalSockets(page);

  await startInstructed(page);

  // The startup has ended once its progress is gone and its session listed.
  const entry = takenAdHocSession(page, text);
  await expect(entry).toHaveCount(1, { timeout: launchWaitMs });
  await expectQuietAdHocActionsRow(page);
  await expect(finalReport).toContainText(report);
  await expect(panel).toHaveCount(0);
  expect(terminalSockets).toEqual([]);
  await expect(sessionStateOf(entry)).toHaveText("Working");
  expect(dashboard.claudeLaunchCalls().map((call) => call.argv.at(-1))).toEqual(
    [text],
  );
  const { button: sessions, entry: listed } = sessionsSidebarParts(page);
  await sessions.click();
  await expect(listed(text)).toBeVisible();
  await expect(finalReport).toContainText(report);
  await sessions.click();

  const sessionId = await sessionNamedBy(entry);
  await openEntryTerminal(entry);
  await expect(terminalScreenParts(panel).rows).toContainText(
    `attached ${sessionId.slice(0, 8)}`,
  );
  await expect(finalReport).toHaveCount(0);
});

test("an instructed Start session with the Side panel closed leaves it closed and returns the keyboard to Start session", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, launchJourney);
  const sidePanel = sidePanelContents(page);
  await expect(sidePanel).toHaveCount(0);

  await startInstructed(page);

  // The button is unavailable during the startup, so it holds the keyboard
  // only once the startup has ended.
  await expect(startSession(page, "Open Dough")).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(takenAdHocSession(page, text)).toHaveCount(1);
  await expect(sidePanel).toHaveCount(0);
});
