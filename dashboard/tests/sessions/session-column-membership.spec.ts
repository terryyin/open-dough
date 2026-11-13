import {
  askToDeleteRecord,
  sessionAction,
} from "../support/sessionEntryDisclosure.ts";
import { closeSidePanel } from "../sidePanelFrame.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../dashboardTest.ts";
import { launched } from "../agentTerminalBoundary.ts";
import { openTerminalControl, terminalPanel } from "../terminalScreenPage.ts";
import {
  localEntries,
  publishMembership,
  queuedStoryTaken,
  savedLocalSessionRecords as savedRecords,
} from "../localTakenSessions.ts";
import { columnPagingControl, rem, showColumn } from "../boardPage.ts";
import {
  columnCountOf,
  expectMembership,
  shortRevision,
  parts,
  sessionEntriesIn,
  sessionEntryShowing,
  sessionNamedBy,
  sessionStateOf,
} from "../dashboardPage.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../support/markDone.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import {
  at,
  placed,
  queuedIdentity,
  queuedTitle,
} from "../recentlyDoneRecords.ts";
import { keptSessions } from "../recentlyDoneSessions.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import { startAdHocAndClose } from "../support/startedAdHocSession.ts";
test.use({
  projectFolders: ["open-dough", "doughnut"],
  extraEnv: briefDoneRenameWait,
});
test("one Taken story with two sessions and one local session means two entries; published ordering precedes newest local launches, and another project's session is excluded", async ({
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
  await launched(dashboard, "doughnut");
  await publishMembership(page, { backlog: queuedStoryTaken });
  await page.setViewportSize({ width: 40 * rem, height: 900 });
  await page.goto("/");
  await expectMembership(page, { taken: [queuedTitle], backlog: [] });
  await expect(columnPagingControl(page, "Taken")).toHaveText(
    "Taken 2 entries",
  );
  await showColumn(page, "Taken");
  const { taken, recentlyDone } = parts(page);
  await expect(columnCountOf(taken)).toHaveText("2 entries");
  await expect(
    sessionEntriesIn(taken.locator("[data-story-card]")),
  ).toHaveCount(2);
  await expect(localEntries(page)).toHaveCount(1);
  for (const [index, name] of [
    queuedTitle,
    "Ad hoc session for Open Dough session",
  ].entries())
    await expect(
      taken.locator(":scope > ol > li > article").nth(index),
    ).toHaveAccessibleName(name);
  await expect(
    localEntries(page).locator(".story-card-meta, .slice-progress"),
  ).toHaveCount(0);
  await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
  await expect(taken).not.toContainText("No Taken entries");
  await publishMembership(page, { at: "d3".repeat(20) });
  await page.reload();
  await expectMembership(page, { taken: [], backlog: [] });
  for (const [index, key] of [
    `claude:${local.session.sessionId}`,
    `claude:${story.session.sessionId}`,
    `claude:${secondId}`,
  ].entries())
    await expect(localEntries(page).nth(index)).toHaveAttribute(
      "data-shows-session",
      key,
    );
  await expect(columnCountOf(taken)).toHaveText("3 entries");
  await showColumn(page, "Taken");
  for (const session of [
    local.session.sessionId,
    story.session.sessionId,
    secondId,
  ]) {
    await showColumn(page, "Taken");
    const entry = sessionEntryShowing(parts(page).taken, `claude:${session}`);
    idleBetweenSteps(dashboard, session);
    await markDoneAnyway(entry);
    await expect(entry).toHaveCount(0);
  }
  await expect(localEntries(page)).toHaveCount(0);
  await expect(columnCountOf(taken)).toHaveText("0 entries");
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(sessionEntriesIn(recentlyDone)).toHaveCount(3);
  await expect(parts(page).readRevision).toContainText(
    shortRevision("d3".repeat(20)),
  );
  expect(
    (await savedRecords(dashboard)).every(
      (record) => record.doneAt !== undefined,
    ),
  ).toBe(true);
  expect(
    (await savedRecords(dashboard))
      .filter((record) => record.request.workflow !== "ad-hoc")
      .every(
        (record) =>
          "identity" in record.request &&
          record.request.identity === queuedIdentity,
      ),
  ).toBe(true);
});

test("an actual no-story Start has one local Taken entry; direct Done refusal stays open, saved Done moves and receives focus, and refused reopening retains Done", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await publishMembership(page);
  await page.goto("/");
  await startAdHocAndClose(page, "Open Dough", "inspect local work");
  const terminal = terminalPanel(page);
  const active = localEntries(page);
  await expect(active).toHaveCount(1);
  const native = await sessionNamedBy(active);
  const key = `claude:${native}`;
  const recent = sessionEntryShowing(parts(page).recentlyDone, key);
  await expect(columnCountOf(parts(page).taken)).toHaveText("1 entry");
  await expect(parts(page).taken).not.toContainText("No Taken entries");
  await expect(recent).toHaveCount(0);
  const folder = path.join(dashboard.home, "git", "open-dough");
  renameSync(folder, `${folder}.away`);
  await markDoneAnyway(active);
  await expect(active).toContainText("The session could not be marked done.");
  await expect(await sessionAction(active, "Mark as done")).toBeFocused();
  expect((await savedRecords(dashboard))[0]?.doneAt).toBeUndefined();
  await expect(recent).toHaveCount(0);
  renameSync(`${folder}.away`, folder);
  idleBetweenSteps(dashboard, native);
  await markDoneAnyway(active);
  await expect(active).toHaveCount(0);
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
  await expect(active).toHaveCount(0);
  await closeSidePanel(terminal);
  await expect(openTerminalControl(recent)).toBeFocused();
});

test("deleting its last local Taken entry returns the keyboard to Taken and settles its empty count", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await publishMembership(page);
  await page.goto("/");
  await startAdHocAndClose(page, "Open Dough", "the only local session");
  dashboard.claudeListingFails(true);
  await reloadUntilRead(page);
  const entry = localEntries(page);
  await expect(sessionStateOf(entry)).toContainText("State unknown");
  await showColumn(page, "Taken");
  await (await askToDeleteRecord(entry)).confirm.click();
  await expect(entry).toHaveCount(0);
  const { taken } = parts(page);
  await expect(taken).toBeFocused();
  await expect(columnCountOf(taken)).toHaveText("0 entries");
  await expect(taken).toContainText("No Taken entries are recorded.");
  expect(await savedRecords(dashboard)).toEqual([]);
});
