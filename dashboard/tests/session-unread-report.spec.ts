import { sessionAction } from "./support/sessionEntryDisclosure.ts";
// Reports have separate marks/messages; activity owns state/place. Read keeps open;
// Done confirms unfinished work. Terminal: agent-terminal-done-report.spec.ts;
// messages: session-unread-report-message.spec.ts. Real page/server, synthetic hosts/GitHub.

import type { Locator, Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { showColumn } from "./boardPage.ts";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  expectTooltipLine,
  sessionsSidebarParts,
  sessionsSidebarSessionEntryTooltipOf,
} from "./sessionsSidebarPage.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";
import { launchedStory, reportedMessage } from "./support/reportedLaunch.ts";
import {
  expectCollapsed,
  expectExpanded,
  messagePartOf,
} from "./support/sessionMessagePart.ts";
import { otherQueuedIdentity, queuedIdentity } from "./support/startOrigin.ts";
import {
  doneNameOf,
  newerMessage,
  publishOrigin,
  recordOf,
  shortIdOf,
  sidebarRow,
  takenStoryCard,
  test,
  titleA,
  unreadWords,
} from "./support/unreadReportPage.ts";

const titleB = "Story B";

// Unread reports add a named mark, matching tooltip line and distinct tint.
async function expectMarked(row: Locator, unmarked: Locator): Promise<void> {
  await expect(row.getByRole("img", { name: unreadWords })).toBeVisible();
  await expectTooltipLine(row, unreadWords);
  const background = (entry: Locator) =>
    entry.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(row)).not.toBe(await background(unmarked));
}

const sidebarTitles = (page: Page) =>
  sessionsSidebarParts(page).entries.locator("h3").allTextContents();

test("an unread report is its own mark beside the session's native reading", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(180_000);
  const storyA = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  const storyB = await launchedStory(
    dashboard,
    origin,
    otherQueuedIdentity,
    titleB,
  );
  const sessionA = storyA.sessionId;
  const sessionB = storyB.sessionId;
  await storyA.report();
  dashboard.claudeSessionBecomes(sessionA, "done-live");
  await publishOrigin(page, origin);
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  await page.goto("/");
  const { button, badge } = sessionsSidebarParts(page);
  const cardA = takenStoryCard(page, titleA);
  const cardB = takenStoryCard(page, titleB);
  await button.click();
  const rowA = sidebarRow(page, titleA);
  const rowB = sidebarRow(page, titleB);

  // 1. Reported and natively done: ready, needing attention, marked apart.
  await expectSessionsSidebarSessionEntryShown(
    rowA,
    "Ready for review",
    "ready",
  );
  await expectSessionsSidebarSessionEntryShown(rowB, "Working", "working");
  await expectMarked(rowA, rowB);
  await expect(rowB.getByRole("img")).toHaveCount(0);
  expect(await sidebarTitles(page)).toEqual([titleA, titleB]);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(cardA.locator(".story-card-attention")).toHaveText(
    "1 session needs attention",
  );
  await expect(cardA.locator(".story-card-unread-reports")).toHaveText(
    "1 unread report",
  );
  await expect(cardA.locator(".session-state")).toHaveText("Ready for review");
  await expect(cardA.locator(".session-unread-report")).toHaveText(unreadWords);
  // Reconcile both starts before advancing page time beyond the read bound.
  for (const card of [cardA, cardB])
    await expect(
      card.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();

  // New instruction: Working by launch time, still unread, with no attention.
  dashboard.claudeSessionBecomes(sessionA, "working");
  await passOnePace();
  await expectSessionsSidebarSessionEntryShown(rowA, "Working", "working");
  await expect.poll(() => sidebarTitles(page)).toEqual([titleB, titleA]);
  await expectMarked(rowA, rowB);
  await expect(badge).toHaveCount(0);
  await expect(cardA.locator(".story-card-attention")).toHaveCount(0);
  await expect(cardA.locator(".story-card-unread-reports")).toHaveText(
    "1 unread report",
  );
  await expect(cardA.locator(".session-state")).toHaveText("Working");
  await expect(cardA.locator(".session-unread-report")).toHaveText(unreadWords);

  // 3. Then waiting for input: into the attention group, counted, marked.
  dashboard.claudeSessionBecomes(sessionA, "blocked");
  await passOnePace();
  await expectSessionsSidebarSessionEntryShown(
    rowA,
    "Needs input",
    "needs-input",
  );
  await expect.poll(() => sidebarTitles(page)).toEqual([titleA, titleB]);
  await expectMarked(rowA, rowB);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(cardA.locator(".story-card-attention")).toHaveText(
    "1 session needs attention",
  );

  // Unavailable: unread/unsettled, outside the attention group and count.
  dashboard.claudeSessionBecomes(sessionA, "working");
  await storyB.report();
  await passOnePace();
  await expect(rowB.getByRole("img", { name: unreadWords })).toBeVisible();
  dashboard.claudeSessionBecomes(sessionB, "forgotten");
  await passOnePace();
  await expectSessionsSidebarSessionEntryShown(
    rowB,
    "Session unavailable",
    "unsettled",
  );
  await expect(rowB.getByRole("img", { name: unreadWords })).toBeVisible();
  await expectTooltipLine(rowB, unreadWords);
  await expect(badge).toHaveCount(0);
  await expect.poll(() => sidebarTitles(page)).toEqual([titleB, titleA]);
  await expect(cardB.locator(".story-card-attention")).toHaveCount(0);
  await expect(cardB.locator(".story-card-unread-reports")).toHaveText(
    "1 unread report",
  );
  // Its message is read on its entry only: nothing opens a side panel for it.
  await expect(
    cardB.getByRole("button", { name: /^(Read|Open) / }),
  ).toHaveCount(0);
  await sessionsSidebarSessionEntryTooltipOf(rowB).click();
  await expect(page.locator(".side-panel")).toHaveCount(0);

  // Read removes unread marks/lines and collapses; native state/place/Done stay.
  // The session keeps running; its receipt becomes read without a Done mark.
  await expectSessionsSidebarSessionEntryShown(rowA, "Working", "working");
  const entryA = cardA.getByRole("article");
  const messageA = messagePartOf(entryA);
  await expectExpanded(messageA, "Completed with attention", reportedMessage);
  const stopsBefore = dashboard.claudeStopCalls().length;
  await messageA.markRead.click();
  await expect(cardA.locator(".story-card-unread-reports")).toHaveCount(0);
  await expect(cardA.locator(".session-unread-report")).toHaveCount(0);
  await expect(rowA.getByRole("img")).toHaveCount(0);
  await expect(sessionsSidebarSessionEntryTooltipOf(rowA)).not.toHaveAttribute(
    "title",
    new RegExp(unreadWords),
  );
  await expectCollapsed(messageA, "Completed with attention");
  await expectSessionsSidebarSessionEntryShown(rowA, "Working", "working");
  await expect(cardA.locator(".session-state")).toHaveText("Working");
  await expect(await sessionAction(entryA, "Mark as done")).toBeVisible();
  expect(await sidebarTitles(page)).toEqual([titleB, titleA]);
  await expect(cardB.locator(".story-card-unread-reports")).toHaveText(
    "1 unread report",
  );
  const recordA = await recordOf(dashboard, sessionA);
  expect(recordA?.reportRead).toBeDefined();
  expect(recordA?.reportRead).toBe(recordA?.completion?.receipt);
  expect(recordA?.doneAt).toBeUndefined();
  expect(dashboard.claudeStopCalls()).toHaveLength(stopsBefore);

  // Waiting after Read adds attention/count, without an unread mark.
  dashboard.claudeSessionBecomes(sessionA, "blocked");
  await passOnePace();
  await expectSessionsSidebarSessionEntryShown(
    rowA,
    "Needs input",
    "needs-input",
  );
  await expect.poll(() => sidebarTitles(page)).toEqual([titleA, titleB]);
  await expect(rowA.getByRole("img")).toHaveCount(0);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(cardA.locator(".story-card-attention")).toHaveText(
    "1 session needs attention",
  );
  await expect(cardA.locator(".story-card-unread-reports")).toHaveCount(0);

  // A newer report supersedes expansion choice: unread/expanded, then collapsed on Read.
  await messageA.heading.click();
  await expectExpanded(messageA, "Completed with attention", reportedMessage);
  await storyA.report({ outcome: "unfinished", message: newerMessage });
  await passOnePace();
  await expect(cardA.locator(".session-unread-report")).toHaveText(
    "Unread report: Unfinished work",
  );
  await expectExpanded(messageA, "Unfinished work", newerMessage);
  await messageA.markRead.click();
  await expectCollapsed(messageA, "Unfinished work");

  // Done stops/marks the session, moves it to Recently done and collapses its message.
  // Read stays absent; idle sessions are renamed natively without an open terminal.
  const stopsBeforeDone = dashboard.claudeStopCalls().length;
  const doneNameA = doneNameOf(dashboard, sessionA);
  const shortIdA = shortIdOf(dashboard, sessionA);
  idleBetweenSteps(dashboard, sessionA);
  await markDoneAnyway(entryA);
  await expect(rowA).toHaveCount(0);
  await expect(badge).toHaveCount(0);
  await expect(cardA.locator(".session-state")).toHaveCount(0);
  const recentA = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: titleA });
  await expect(recentA.locator(".session-state")).toHaveText("Done");
  await expect(recentA.locator(".session-unread-report")).toHaveCount(0);
  await expect(recentA).toContainText(`Named ${doneNameA}`);
  await expect(recentA).not.toContainText("rename failed");
  expect((await recordOf(dashboard, sessionA))?.doneProblem).toBeUndefined();
  expect(dashboard.claudeStopCalls().slice(stopsBeforeDone)).toEqual([
    expect.objectContaining({ argv: ["stop", shortIdA] }),
  ]);
  const recentMessageA = messagePartOf(recentA);
  await showColumn(page, "Recently done");
  await expectCollapsed(recentMessageA, "Unfinished work");
  await recentMessageA.heading.click();
  await expectExpanded(recentMessageA, "Unfinished work", newerMessage);
  await expect(recentMessageA.markRead).toHaveCount(0);
});
