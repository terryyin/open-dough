import {
  askToDeleteRecord,
  sessionAction,
} from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  openTerminalControl,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  publishMembership,
  queuedStoryTaken,
  savedLocalSessionRecords as savedRecords,
} from "../../dashboard/test-support/localTakenSessions.ts";
import {
  columnPagingControl,
  rem,
  showColumn,
} from "../../dashboard/test-support/boardPage.ts";
import {
  columnCountOf,
  expectMembership,
  shortRevision,
  parts,
  sessionEntriesIn,
  sessionEntryShowing,
  sessionNamedBy,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  at,
  placed,
  queuedIdentity,
  queuedTitle,
  publishedFiles,
  repository,
} from "../../dashboard/test-support/recentlyDoneRecords.ts";
import { keptSessions } from "../../dashboard/test-support/recentlyDoneSessions.ts";
import { publishCommittedFiles } from "../../dashboard/test-support/publishedOrigin.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
test.use({
  projectFolders: ["open-dough", "doughnut"],
  extraEnv: briefDoneRenameWait,
});
test("Taken counts published stories, with their own sessions nested and unmatched launches excluded", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const id = (name: string, before: number) =>
    dashboard.claudeListsSession({
      name,
      cwd: dashboard.home,
      startedAt: now - before,
    });
  const [story, local] = keptSessions(now, {
    queued: id(queuedTitle, placed.queuedLaunched),
    adHoc: id("Open Dough session", placed.adHocLaunched),
  });
  if (!story || !local) throw new Error("Missing raw sessions");
  const secondId = id(queuedTitle, placed.executedOpenSessionLaunched);
  keepLaunchRecords(dashboard, [
    // The queued story's second execution, launched later.
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: queuedTitle })
      .inClaudeSession({ sessionId: secondId })
      .launchedAt(at(now, placed.executedOpenSessionLaunched))
      .please(),
    story,
    local,
  ]);
  await composeSession(dashboard, "doughnut");
  await publishMembership(page, { backlog: queuedStoryTaken });
  await page.setViewportSize({ width: 40 * rem, height: 900 });
  await page.goto("/");
  await expectMembership(page, { taken: [queuedTitle], backlog: [] });
  await expect(columnPagingControl(page, "Taken")).toHaveText("Taken 1 entry");
  await showColumn(page, "Taken");
  const { taken, recentlyDone } = parts(page);
  await expect(columnCountOf(taken)).toHaveText("1 entry");
  await expect(
    sessionEntriesIn(taken.locator("[data-story-card]")),
  ).toHaveCount(2);
  await expect(taken.locator(":scope > ol > li > article")).toHaveCount(1);
  await expect(storyCard(taken, queuedTitle)).toBeVisible();
  await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
  await publishMembership(page, { at: "d3".repeat(20) });
  await page.reload();
  await expectMembership(page, { taken: [], backlog: [] });
  await expect(sessionEntriesIn(taken)).toHaveCount(0);
  await expect(columnCountOf(taken)).toHaveText("0 entries");
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
  await expect(parts(page).readRevision).toContainText(
    shortRevision("d3".repeat(20)),
  );
});

function keepLocalSession(
  dashboard: DashboardServer,
  title: string,
  storyIdentity: string,
) {
  const startedAt = Date.now();
  const sessionId = dashboard.claudeListsSession({
    name: title,
    cwd: path.join(dashboard.home, "git", "open-dough"),
    startedAt,
  });
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .adHoc({ title, storyIdentity })
      .inClaudeSession({ sessionId })
      .launchedAt(new Date(startedAt).toISOString())
      .please(),
  ]);
}

test("a session on a Done story retains its state if marking Done or reopening is refused", async ({
  page,
  dashboard,
}) => {
  const identity = "SEED-190#inspect-local-work";
  const title = "Inspect the completed work";
  keepLocalSession(dashboard, "inspect local work", identity);
  publishCommittedFiles(page, {
    repository,
    files: publishedFiles({
      doneRecords: [
        makeMe.aDoneRecord
          .completed({
            identity,
            title,
            completedAt: new Date(Date.now() - 120_000).toISOString(),
          })
          .please(),
      ],
    }),
  });
  await page.goto("/");
  const terminal = terminalPanel(page);
  const active = sessionEntriesIn(storyCard(parts(page).recentlyDone, title));
  await expect(active).toHaveCount(1);
  const native = await sessionNamedBy(active);
  const key = `claude:${native}`;
  const recent = sessionEntryShowing(parts(page).recentlyDone, key);
  await expect(columnCountOf(parts(page).taken)).toHaveText("0 entries");
  await expect(recent).toHaveCount(1);
  const folder = path.join(dashboard.home, "git", "open-dough");
  renameSync(folder, `${folder}.away`);
  await markDoneAnyway(active);
  await expect(active).toContainText("The session could not be marked done.");
  await expect(await sessionAction(active, "Mark as done")).toBeFocused();
  expect((await savedRecords(dashboard))[0]?.doneAt).toBeUndefined();
  await expect(recent).toHaveCount(1);
  renameSync(`${folder}.away`, folder);
  idleBetweenSteps(dashboard, native);
  await markDoneAnyway(active);
  await expect(recent).toBeFocused();
  await expect(sessionStateOf(recent)).toHaveText("Done");
  expect((await savedRecords(dashboard))[0]?.doneAt).toBeDefined();
  await sessionsSidebarParts(page).button.click();
  await expect(sessionsSidebarParts(page).entries).toHaveCount(0);
  await reloadUntilRead(page);
  await expect(recent).toHaveCount(1);
  const doneAt = (await savedRecords(dashboard))[0]?.doneAt;
  await showColumn(page, "Recently done");
  const beforeReopen = dashboard.claudeAttaches().length;
  dashboard.claudeSessionBecomes(native, "forgotten");
  await openTerminalControl(recent).click();
  await expect(terminal.getByRole("status")).toContainText(
    "Disconnected from the session",
  );
  expect((await savedRecords(dashboard))[0]?.doneAt).toBe(doneAt);
  expect(dashboard.claudeAttaches()).toHaveLength(beforeReopen);
  await expect(recent).toHaveCount(1);
  await closeSidePanel(terminal);
  await expect(openTerminalControl(recent)).toBeFocused();
});

test("deleting a Taken story's last session returns the keyboard to its card and keeps the story counted", async ({
  page,
  dashboard,
}) => {
  keepLocalSession(dashboard, "the only local session", queuedIdentity);
  await publishMembership(page, { backlog: queuedStoryTaken });
  await page.goto("/");
  dashboard.claudeListingFails(true);
  await reloadUntilRead(page);
  const { taken } = parts(page);
  const card = storyCard(taken, queuedTitle);
  const entry = sessionEntriesIn(card);
  await expect(sessionStateOf(entry)).toContainText("State unknown");
  await showColumn(page, "Taken");
  await (await askToDeleteRecord(entry)).confirm.click();
  await expect(entry).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(columnCountOf(taken)).toHaveText("1 entry");
  expect(await savedRecords(dashboard)).toEqual([]);
});
