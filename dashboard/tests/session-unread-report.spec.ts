// A session's completion report not yet marked done is an unread report,
// shown apart from the session's own native reading: the entry's edge, its
// place in the Sessions sidebar, the banner badge, and the card's attention
// line follow only the native reading, while the report shows by its own
// mark and words (“Unread report: <completion label>”) and the card's line of
// how many unread reports it holds. Real start, launch, installed reporting
// command, store and page; only the synthetic `claude` and GitHub are fakes.

import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { Locator, Page } from "@playwright/test";
import { launchResultSchema } from "../src/launchOutcome.ts";
import type { submitCompletion } from "../server/completionReporting.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { test as base, expect, pausePageClockAt } from "./dashboardTest.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import {
  expectSidebarSessionShown,
  expectTooltipLine,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

const exec = promisify(execFile);

const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

const titleA = "Story A";
const titleB = "Story B";
const unreadWords = "Unread report: Completed with attention";

// Launches the story's execution in Claude through the real start; answers
// its native session id and a report through the installed reporting command
// its launch input names, with a message.
async function launchedStory(
  dashboard: DashboardServer,
  origin: StartOrigin,
  identity: string,
  title: string,
): Promise<{ sessionId: string; report(): Promise<void> }> {
  dashboard.claudeScenario("launched");
  const before = dashboard.claudeLaunchCalls().length;
  const answer = launchResultSchema.parse(
    JSON.parse(
      (
        await launch(dashboard, {
          source: "open-dough",
          host: "claude",
          workflow: "execution",
          identity,
          title,
        })
      ).body,
    ),
  );
  if (answer.kind !== "launched") throw new Error("The launch did not launch.");
  const input = dashboard.claudeLaunchCalls()[before]?.argv.at(-1) ?? "";
  const command = /^- reporting command: (.+)$/m.exec(input)?.[1];
  if (command === undefined) throw new Error("No reporting command");
  const message = path.join(origin.machine, `${title}.txt`);
  writeFileSync(message, "Published. Reminder: check the migration.");
  return {
    sessionId: answer.record.session.sessionId,
    async report() {
      const reported = await exec(
        "bash",
        ["-c", `${command} --outcome completed --message-file '${message}'`],
        { cwd: origin.machine },
      );
      expect(
        (
          JSON.parse(reported.stdout) as Awaited<
            ReturnType<typeof submitCompletion>
          >
        ).state,
      ).toBe("recorded");
    },
  };
}

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
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
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

  // 4. Mark as done: the mark, the tooltip line and the card's unread line
  // go; the entry reads as marked done does.
  dashboard.claudeSessionBecomes(sessionA, "blocked");
  await passOnePace();
  await expectSidebarSessionShown(rowA, "Needs input", "needs-input");
  await cardA.getByRole("button", { name: "Mark as done" }).click();
  await expect(cardA.locator(".card-unread-reports")).toHaveCount(0);
  await expect(cardA.locator(".session-unread-report")).toHaveCount(0);
  await expect(rowA).toHaveCount(0);
  await expect(badge).toHaveCount(0);
  const recentA = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: titleA });
  await expect(recentA.locator(".session-state")).toHaveText("Done");
  await expect(recentA.locator(".session-unread-report")).toHaveCount(0);
});
