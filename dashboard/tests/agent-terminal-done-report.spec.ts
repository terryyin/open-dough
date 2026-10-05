// Mark as done in the page's one terminal (./agent-terminal-done.spec.ts) on a
// session that reported through the installed reporting command: an unread
// report does not hold it back, so a working session is asked about as any
// session and closes once confirmed, renamed `done-` and stopped; a session
// whose completed report is read and that reads Ready for review is marked
// done in one click. How a card entry asks is
// ./agent-launch-done-question.spec.ts, and the unread report itself is
// ./session-unread-report.spec.ts. Real start, launch, installed reporting
// command, store and page; only the synthetic `claude` and GitHub are fakes.

import type { Page } from "@playwright/test";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { cardSessions, parts, sessionStateOf } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { markDone, markDoneAnyway } from "./support/markDone.ts";
import {
  doneNameOf,
  launchedStory,
  shortIdOf,
} from "./support/reportedLaunch.ts";
import { queuedIdentity, type StartOrigin } from "./support/startOrigin.ts";
import { publishOrigin, test } from "./support/startOriginTest.ts";
import { markReportRead } from "./support/sessionMessagePart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const titleA = "Story A";
const unreadWords = "Unread report: Completed with attention";

// Opens the page on the origin's stories and answers Story A's Taken card.
async function openCard(page: Page, origin: StartOrigin) {
  await publishOrigin(page, origin);
  await page.goto("/");
  return parts(page).taken.getByRole("article", { name: titleA, exact: true });
}

test("Mark as done in the terminal panel closes a session with an unread report as any session", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  const { sessionId } = story;
  await story.report();
  const card = await openCard(page, origin);
  await sidebarParts(page).button.click();
  const row = sidebarParts(page)
    .sidebar.getByRole("listitem")
    .filter({ hasText: titleA });
  await expect(card.locator(".session-unread-report")).toHaveText(unreadWords);
  await expect(row.getByRole("img", { name: unreadWords })).toBeVisible();
  const doneName = doneNameOf(dashboard, sessionId);
  const shortId = shortIdOf(dashboard, sessionId);
  await card.getByRole("button", { name: "Open terminal" }).click();
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  const stopsBefore = dashboard.claudeStopCalls().length;

  await markDoneAnyway(terminal);

  await expect(terminal).toHaveCount(0);
  await expect(card.locator(".session-state")).toHaveCount(0);
  await expect(row).toHaveCount(0);
  const recent = parts(page)
    .recentSessions.getByRole("article")
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

test("in the terminal panel, a session with a read completed report that reads Ready for review is marked done in one click", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  await story.report();
  dashboard.claudeSessionBecomes(story.sessionId, "done-live");
  const entry = cardSessions(await openCard(page, origin));
  await markReportRead(entry);
  await expect(sessionStateOf(entry)).toHaveText("Ready for review");
  const shortId = shortIdOf(dashboard, story.sessionId);
  const before = dashboard.claudeStopCalls().length;
  await entry.getByRole("button", { name: "Open terminal" }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("attached");

  await markDone(panel);

  await expect(panel).toHaveCount(0);
  await expect(entry).toHaveCount(0);
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: titleA });
  await expect(sessionStateOf(recent)).toHaveText("Done");
  expect(dashboard.claudeStopCalls().slice(before)).toEqual([
    expect.objectContaining({ argv: ["stop", shortId] }),
  ]);
});
