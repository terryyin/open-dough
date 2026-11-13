// Mark as done in the page's one terminal (../../dashboard/tests/sessions/agent-terminal-done.spec.ts) on a
// session that reported through the installed reporting command: an unread
// report does not hold it back, so a working session is asked about as any
// session and closes once confirmed, renamed `done-` and stopped; a session
// whose completed report is read and that reads Ready for review is marked
// done in one click. How a card entry asks is
// ./agent-launch-done-question.spec.ts, and the unread report itself is
// ./session-unread-report.spec.ts. Real start, launch, installed reporting
// command, store and page; only the synthetic `claude` and GitHub are fakes.

import type { Page } from "@playwright/test";
import type { LaunchRecord } from "../../dashboard/src/agentLaunch.ts";
import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  storyCardSessions,
  parts,
  sessionStateOf,
} from "../../dashboard/tests/dashboardPage.ts";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import { sessionsSidebarParts } from "../../dashboard/tests/sessionsSidebarPage.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/tests/terminalScreenPage.ts";
import {
  idleBetweenSteps,
  markDone,
  markDoneAnyway,
} from "../../dashboard/tests/support/markDone.ts";
import {
  doneNameOf,
  launchedStory,
  shortIdOf,
} from "../../dashboard/tests/support/reportedLaunch.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/tests/support/startOrigin.ts";
import {
  publishOrigin,
  test,
} from "../../dashboard/tests/support/startOriginTest.ts";
import { markReportRead } from "../../dashboard/tests/support/sessionMessagePart.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const titleA = "Story A";
const unreadWords = "Unread report: Completed with attention";

// Opens the page on the origin's stories and answers Story A's Taken card.
async function openCard(page: Page, origin: StartOrigin) {
  await publishOrigin(page, origin);
  await openUntilRead(page);
  return parts(page).taken.getByRole("article", { name: titleA, exact: true });
}

test("Mark as done in the terminal closes a session with an unread report as any session", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  const { sessionId } = story;
  await story.report();
  const card = await openCard(page, origin);
  await sessionsSidebarParts(page).button.click();
  const row = sessionsSidebarParts(page)
    .sidebar.getByRole("listitem")
    .filter({ hasText: titleA });
  await expect(card.locator(".session-unread-report")).toHaveText(unreadWords);
  await expect(row.getByRole("img", { name: unreadWords })).toBeVisible();
  const doneName = doneNameOf(dashboard, sessionId);
  const shortId = shortIdOf(dashboard, sessionId);
  await openTerminalControl(card, { exact: false }).click();
  const terminal = terminalPanel(page);
  await expect(terminalScreenParts(terminal).rows).toContainText("attached");
  const stopsBefore = dashboard.claudeStopCalls().length;
  idleBetweenSteps(dashboard, sessionId);

  await markDoneAnyway(terminal);

  await expect(terminal).toHaveCount(0);
  await expect(card.locator(".session-state")).toHaveCount(0);
  await expect(row).toHaveCount(0);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: titleA });
  await expect(recent.locator(".session-state")).toHaveText("Done");
  await expect(recent.locator(".session-unread-report")).toHaveCount(0);
  await expect(recent).toContainText(`Named ${doneName}`);
  expect(
    dashboard
      .claudeListing()
      .find((listed) => listed["sessionId"] === sessionId)?.["name"],
  ).toBe(doneName);
  expect(dashboard.claudeStopCalls().slice(stopsBefore)).toEqual([
    expect.objectContaining({ argv: ["stop", shortId] }),
  ]);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record?.doneAt).toBeDefined();
  expect(record?.doneProblem).toBeUndefined();
});

test("in the terminal, a session with a read completed report that reads Ready for review is marked done in one click", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  await story.report();
  dashboard.claudeSessionBecomes(story.sessionId, "done-live");
  const entry = storyCardSessions(await openCard(page, origin));
  await markReportRead(entry);
  await expect(sessionStateOf(entry)).toHaveText("Ready for review");
  const shortId = shortIdOf(dashboard, story.sessionId);
  const before = dashboard.claudeStopCalls().length;
  await openTerminalControl(entry, { exact: false }).click();
  const panel = terminalPanel(page);
  await expect(terminalScreenParts(panel).rows).toContainText("attached");

  await markDone(panel);

  await expect(panel).toHaveCount(0);
  await expect(entry).toHaveCount(0);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: titleA });
  await expect(sessionStateOf(recent)).toHaveText("Done");
  expect(dashboard.claudeStopCalls().slice(before)).toEqual([
    expect.objectContaining({ argv: ["stop", shortId] }),
  ]);
});
