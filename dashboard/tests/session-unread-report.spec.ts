// A session's completion report not yet marked read or done is an unread report,
// shown apart from the session's own native reading: the entry's edge, its
// place in the Sessions sidebar, the banner badge, and the card's attention
// line follow only the native reading, while the report shows by its own
// mark and words (“Unread report: <completion label>”) and the card's line of
// how many unread reports it holds. The entry's message part, on a card or in
// Recent sessions, is expanded with Mark as read while the report is unread,
// and collapsed and expandable once read or done. Mark as read clears the
// unread report and leaves the session open with its native reading and its
// own Mark as done; Mark as done, read or not, closes the session as any
// session, asked about first while its work is not known complete (from the
// terminal panel, ./agent-terminal-done-report.spec.ts).
// The message part's own controls are ./session-unread-report-message.spec.ts.
// Real start, launch, installed reporting command, store and page; only the
// synthetic `claude` and GitHub are fakes.

import type { Locator, Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
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

  // A newer report for the session is unread again: its part expanded under
  // its own label, with Mark as read.
  await storyA.report({ outcome: "unfinished", message: newerMessage });
  await passOnePace();
  await expect(cardA.locator(".session-unread-report")).toHaveText(
    "Unread report: Unfinished work",
  );
  await expectExpanded(messageA, "Unfinished work", newerMessage);
  await messageA.markRead.click();
  await expectCollapsed(messageA, "Unfinished work");

  // 7. Mark as done on its entry closes the session as any session: it is
  // named done-, stopped, and leaves the card and the sidebar for Recent
  // sessions, Done, its message collapsed and expandable without Mark as
  // read.
  const stopsBeforeDone = dashboard.claudeStopCalls().length;
  const doneNameA = doneNameOf(dashboard, sessionA);
  const shortIdA = shortIdOf(dashboard, sessionA);
  await markDoneAnyway(entryA);
  await expect(rowA).toHaveCount(0);
  await expect(badge).toHaveCount(0);
  await expect(cardA.locator(".session-state")).toHaveCount(0);
  const recentA = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: titleA });
  await expect(recentA.locator(".session-state")).toHaveText("Done");
  await expect(recentA.locator(".session-unread-report")).toHaveCount(0);
  await expect(recentA).toContainText(`Named ${doneNameA}`);
  expect(dashboard.claudeStopCalls().slice(stopsBeforeDone)).toEqual([
    expect.objectContaining({ argv: ["stop", shortIdA] }),
  ]);
  const recentMessageA = messagePartOf(recentA);
  await expectCollapsed(recentMessageA, "Unfinished work");
  await recentMessageA.heading.click();
  await expectExpanded(recentMessageA, "Unfinished work", newerMessage);
  await expect(recentMessageA.markRead).toHaveCount(0);
});
