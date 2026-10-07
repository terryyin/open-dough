// Unread reports have their own mark and message; session edges, placement,
// badges and attention lines follow native activity. Mark as read collapses
// the message and leaves the session open; Mark as done closes it locally,
// with unfinished work confirmed first. Terminal-panel confirmation is in
// ./agent-terminal-done-report.spec.ts; message controls are in
// ./session-unread-report-message.spec.ts. This uses real start, launch,
// installed reporting command, store and page; only Claude and GitHub are fakes.

import type { Locator, Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectSidebarSessionShown,
  expectTooltipLine,
  sidebarParts,
  sidebarTooltipOf,
} from "./sessionSidebarPage.ts";
import { markDoneAnyway } from "./support/markDone.ts";
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
  takenCard,
  test,
  titleA,
  unreadWords,
} from "./support/unreadReportPage.ts";

const titleB = "Story B";

// The row shows the unread report apart: its message mark named by the
// words, the same words on a line of its tooltip, and a tint the row
// without one lacks.
async function expectMarked(row: Locator, unmarked: Locator): Promise<void> {
  await expect(row.getByRole("img", { name: unreadWords })).toBeVisible();
  await expectTooltipLine(row, unreadWords);
  const background = (entry: Locator) =>
    entry.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(row)).not.toBe(await background(unmarked));
}

const sidebarTitles = (page: Page) =>
  sidebarParts(page).entries.locator("h3").allTextContents();

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
  const { passOnePace } = watchRecordReads(page);
  await page.goto("/");
  const { button, badge } = sidebarParts(page);
  const cardA = takenCard(page, titleA);
  const cardB = takenCard(page, titleB);
  await button.click();
  const rowA = sidebarRow(page, titleA);
  const rowB = sidebarRow(page, titleB);

  // 1. Reported and natively done: ready, needing attention, marked apart.
  await expectSidebarSessionShown(rowA, "Ready for review", "ready");
  await expectSidebarSessionShown(rowB, "Working", "working");
  await expectMarked(rowA, rowB);
  await expect(rowB.getByRole("img")).toHaveCount(0);
  expect(await sidebarTitles(page)).toEqual([titleA, titleB]);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(cardA.locator(".card-attention")).toHaveText(
    "1 session needs attention",
  );
  await expect(cardA.locator(".card-unread-reports")).toHaveText(
    "1 unread report",
  );
  await expect(cardA.locator(".session-state")).toHaveText("Ready for review");
  await expect(cardA.locator(".session-unread-report")).toHaveText(unreadWords);
  // Both starts are reconciled with the published work read, so the cards'
  // actions can run before page time moves on past that read's wait bound.
  for (const card of [cardA, cardB])
    await expect(
      card.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();

  // 2. A new instruction, no Mark as done: working, by launch time among the
  // sessions not needing engagement, still marked; the badge counts nothing.
  dashboard.claudeSessionBecomes(sessionA, "working");
  await passOnePace();
  await expectSidebarSessionShown(rowA, "Working", "working");
  await expect.poll(() => sidebarTitles(page)).toEqual([titleB, titleA]);
  await expectMarked(rowA, rowB);
  await expect(badge).toHaveCount(0);
  await expect(cardA.locator(".card-attention")).toHaveCount(0);
  await expect(cardA.locator(".card-unread-reports")).toHaveText(
    "1 unread report",
  );
  await expect(cardA.locator(".session-state")).toHaveText("Working");
  await expect(cardA.locator(".session-unread-report")).toHaveText(unreadWords);

  // 3. Then waiting for input: into the attention group, counted, marked.
  dashboard.claudeSessionBecomes(sessionA, "blocked");
  await passOnePace();
  await expectSidebarSessionShown(rowA, "Needs input", "needs-input");
  await expect.poll(() => sidebarTitles(page)).toEqual([titleA, titleB]);
  await expectMarked(rowA, rowB);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(cardA.locator(".card-attention")).toHaveText(
    "1 session needs attention",
  );

  // 5. An unavailable session with an unread report: unsettled, marked, not
  // counted, out of the attention group.
  dashboard.claudeSessionBecomes(sessionA, "working");
  await storyB.report();
  await passOnePace();
  await expect(rowB.getByRole("img", { name: unreadWords })).toBeVisible();
  dashboard.claudeSessionBecomes(sessionB, "forgotten");
  await passOnePace();
  await expectSidebarSessionShown(rowB, "Session unavailable", "unsettled");
  await expect(rowB.getByRole("img", { name: unreadWords })).toBeVisible();
  await expectTooltipLine(rowB, unreadWords);
  await expect(badge).toHaveCount(0);
  await expect.poll(() => sidebarTitles(page)).toEqual([titleB, titleA]);
  await expect(cardB.locator(".card-attention")).toHaveCount(0);
  await expect(cardB.locator(".card-unread-reports")).toHaveText(
    "1 unread report",
  );
  // Its message is read on its entry only: nothing opens a side panel for it.
  await expect(
    cardB.getByRole("button", { name: /^(Read|Open) / }),
  ).toHaveCount(0);
  await sidebarTooltipOf(rowB).click();
  await expect(page.locator(".side-panel")).toHaveCount(0);

  // 4. Mark as read on the card, while the session works: the mark, the
  // tooltip line and the card's unread line go; the message part collapses;
  // the entry keeps its native reading, its place, and its Mark as done; the
  // session is not stopped, and the record keeps the report's receipt as
  // read without a done mark.
  await expectSidebarSessionShown(rowA, "Working", "working");
  const entryA = cardA.getByRole("article");
  const messageA = messagePartOf(entryA);
  await expectExpanded(messageA, "Completed with attention", reportedMessage);
  const stopsBefore = dashboard.claudeStopCalls().length;
  await messageA.markRead.click();
  await expect(cardA.locator(".card-unread-reports")).toHaveCount(0);
  await expect(cardA.locator(".session-unread-report")).toHaveCount(0);
  await expect(rowA.getByRole("img")).toHaveCount(0);
  await expect(sidebarTooltipOf(rowA)).not.toHaveAttribute(
    "title",
    new RegExp(unreadWords),
  );
  await expectCollapsed(messageA, "Completed with attention");
  await expectSidebarSessionShown(rowA, "Working", "working");
  await expect(cardA.locator(".session-state")).toHaveText("Working");
  await expect(
    entryA.getByRole("button", { name: "Mark as done" }),
  ).toBeVisible();
  expect(await sidebarTitles(page)).toEqual([titleB, titleA]);
  await expect(cardB.locator(".card-unread-reports")).toHaveText(
    "1 unread report",
  );
  const recordA = await recordOf(dashboard, sessionA);
  expect(recordA?.reportRead).toBeDefined();
  expect(recordA?.reportRead).toBe(recordA?.completion?.receipt);
  expect(recordA?.doneAt).toBeUndefined();
  expect(dashboard.claudeStopCalls()).toHaveLength(stopsBefore);

  // 6. The read session then waits for input: into the attention group,
  // counted, with no unread mark.
  dashboard.claudeSessionBecomes(sessionA, "blocked");
  await passOnePace();
  await expectSidebarSessionShown(rowA, "Needs input", "needs-input");
  await expect.poll(() => sidebarTitles(page)).toEqual([titleA, titleB]);
  await expect(rowA.getByRole("img")).toHaveCount(0);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(cardA.locator(".card-attention")).toHaveText(
    "1 session needs attention",
  );
  await expect(cardA.locator(".card-unread-reports")).toHaveCount(0);

  // The read message, expanded by hand, then a newer report for the session:
  // unread again, its part expanded under its own label, with Mark as read;
  // once read it collapses, the choice made on the older report ended.
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

  // 7. Mark as done on its entry closes the session as any session: it is
  // marked Done locally and stopped, and leaves the card and sidebar for
  // Recently done, its message collapsed and expandable without Mark as
  // read. Idle, with no terminal open, it is still renamed natively.
  const stopsBeforeDone = dashboard.claudeStopCalls().length;
  const doneNameA = doneNameOf(dashboard, sessionA);
  const shortIdA = shortIdOf(dashboard, sessionA);
  dashboard.claudeSessionBecomes(sessionA, "working-idle");
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
