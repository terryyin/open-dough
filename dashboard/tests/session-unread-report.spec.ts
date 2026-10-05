// A session's completion report not yet marked read or done is an unread report,
// shown apart from the session's own native reading: the entry's edge, its
// place in the Sessions sidebar, the banner badge, and the card's attention
// line follow only the native reading, while the report shows by its own
// mark and words (“Unread report: <completion label>”) and the card's line of
// how many unread reports it holds. Mark as read clears it and leaves the
// session open with its native reading; Mark as done from the report panel,
// read or not, closes the session as any session (from the terminal panel,
// ./agent-terminal-done-report.spec.ts). Real start, launch, installed
// reporting command, store and page; only the synthetic `claude` and GitHub
// are fakes.

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
import { recordsOf } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  doneNameOf,
  launchedStory,
  shortIdOf,
} from "./support/reportedLaunch.ts";
import { otherQueuedIdentity, queuedIdentity } from "./support/startOrigin.ts";
import { publishOrigin, test } from "./support/startOriginTest.ts";
import { markDoneAnyway } from "./support/markDone.ts";
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const titleA = "Story A";
const titleB = "Story B";
const unreadWords = "Unread report: Completed with attention";

const sidebarRow = (page: Page, title: string) =>
  sidebarParts(page).sidebar.getByRole("listitem").filter({ hasText: title });

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
  const cardA = parts(page).taken.getByRole("article", {
    name: titleA,
    exact: true,
  });
  const cardB = parts(page).taken.getByRole("article", {
    name: titleB,
    exact: true,
  });
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

  // 4. Mark as read on the card, while the session works: the mark, the
  // tooltip line and the card's unread line go; the entry keeps its native
  // reading and its place, the session is not stopped, and the record keeps
  // the report's receipt as read without a done mark.
  await expectSidebarSessionShown(rowA, "Working", "working");
  await expect(cardA.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
  );
  const stopsBefore = dashboard.claudeStopCalls().length;
  await cardA.getByRole("button", { name: "Mark as read" }).click();
  await expect(cardA.locator(".card-unread-reports")).toHaveCount(0);
  await expect(cardA.locator(".session-unread-report")).toHaveCount(0);
  await expect(rowA.getByRole("img")).toHaveCount(0);
  await expect(sidebarTooltipOf(rowA)).not.toHaveAttribute(
    "title",
    new RegExp(unreadWords),
  );
  await expectSidebarSessionShown(rowA, "Working", "working");
  await expect(cardA.locator(".session-state")).toHaveText("Working");
  await expect(
    cardA.getByRole("button", { name: "Mark as done" }),
  ).toBeVisible();
  await expect(cardA.getByRole("button", { name: "Mark as read" })).toHaveCount(
    0,
  );
  expect(await sidebarTitles(page)).toEqual([titleB, titleA]);
  await expect(cardB.locator(".card-unread-reports")).toHaveText(
    "1 unread report",
  );
  const [recordA] = (await recordsOf(dashboard, "open-dough")).filter(
    (record) => (record as LaunchRecord).session.sessionId === sessionA,
  ) as LaunchRecord[];
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

  // 7. Its report stays readable, and its panel offers Mark as done, not
  // Mark as read; Mark as done there closes the session as any session: it is
  // named done-, stopped, and leaves the card and the sidebar for Recent
  // sessions, Done.
  await cardA.getByRole("button", { name: "Read attention message" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".session-final-report")).toHaveText(
    "Published. Reminder: check the migration.",
  );
  await expect(panel.getByRole("button", { name: "Mark as read" })).toHaveCount(
    0,
  );
  const stopsBeforeDone = dashboard.claudeStopCalls().length;
  const doneNameA = doneNameOf(dashboard, sessionA);
  const shortIdA = shortIdOf(dashboard, sessionA);
  await markDoneAnyway(panel);
  await expect(panel).toHaveCount(0);
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
});
