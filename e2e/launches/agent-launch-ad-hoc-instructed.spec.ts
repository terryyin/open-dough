// Start session with typed text presents nothing once its session starts, on
// the launch journey's committed origin (../../dashboard/test-support/launchJourney.ts):
// a final report open in the Side panel stays, no terminal is requested, and
// the session is an entry in Taken and the Sessions sidebar whose Open
// terminal shows it. For keyboard return after startup, see
// ../../dashboard/frontend-tests/launches/ad-hoc-start-session.spec.ts.
// A start with nothing typed:
// ../terminals/agent-launch-ad-hoc-terminal.spec.ts. Follow
// up: ./agent-launch-follow-up-session.spec.ts. The synthetic `claude`
// (../../dashboard/test-support/fixtures/fake-claude) stands for the real one.
import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";

import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  parts,
  sessionNamedBy,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  terminalPanel,
  terminalScreenParts,
  openTerminalFromEntry,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  expectQuietAdHocActionsRow,
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  retiredSession,
  retiredTitle,
} from "../../dashboard/test-support/support/followUpSources.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { takenAdHocSession } from "../../dashboard/test-support/support/startedAdHocSession.ts";
import { watchTerminalSockets } from "../../dashboard/test-support/support/terminalSockets.ts";

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
  const { panel: finalReport } = await readFinalReport(
    parts(page).recentlyDone.getByRole("article", {
      name: new RegExp(retiredTitle),
    }),
  );
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
  expect(dashboard.claudeLaunches().map((each) => each.instruction)).toEqual([
    text,
  ]);
  const { button: sessions, entry: listed } = sessionsSidebarParts(page);
  await sessions.click();
  await expect(listed(text)).toBeVisible();
  await expect(finalReport).toContainText(report);
  await sessions.click();

  const sessionId = await sessionNamedBy(entry);
  await openTerminalFromEntry(entry);
  await expect(terminalScreenParts(panel).rows).toContainText(
    `attached ${sessionId.slice(0, 8)}`,
  );
  await expect(finalReport).toHaveCount(0);
});
