import { sessionAction } from "./support/sessionEntryDisclosure.ts";
import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  localEntries,
  publishMembership,
  savedLocalSessionRecords,
} from "./localTakenSessions.ts";
import { columnPagingControl, rem, showColumn } from "./boardPage.ts";
import {
  expectMembership,
  shortRevision,
  parts,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import { emptyBacklog, publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import {
  at,
  placed,
  publishedFiles,
  queuedIdentity,
  queuedTitle,
  repository,
} from "./recentlyDoneRecords.ts";
import { keptSessions } from "./recentlyDoneSessions.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

// Keep rename waiting within one expectation; timing is not this journey’s subject.
test.use({
  projectFolders: ["open-dough", "doughnut"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
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
  if (!story || !local || story.session.host !== "claude")
    throw new Error("Missing raw sessions");
  const secondId = id(queuedTitle, placed.executedOpenSessionLaunched);
  await keepLaunchRecords(dashboard, [
    {
      ...story,
      session: {
        ...story.session,
        sessionId: secondId,
        shortId: secondId.slice(0, 8),
      },
      launchedAt: at(now, placed.executedOpenSessionLaunched),
    },
    story,
    local,
  ]);
  await launched(dashboard, "doughnut");
  const backlog = `${publishedFiles()[".planning/PRODUCT-BACKLOG.md"]?.replace("## Taken\n\n## Backlog list", "## Taken")}\n## Backlog list\n`;
  await publishMembership(page, backlog);
  await page.setViewportSize({ width: 40 * rem, height: 900 });
  await page.goto("/");
  await expectMembership(page, { taken: [queuedTitle], backlog: [] });
  await expect(columnPagingControl(page, "Taken")).toHaveText(
    "Taken 2 entries",
  );
  await showColumn(page, "Taken");
  const { taken, recentlyDone } = parts(page);
  await expect(taken.locator(".column-count")).toHaveText("2 entries");
  await expect(taken.locator("[data-story-card] .session-entry")).toHaveCount(
    2,
  );
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
  await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
  await expect(taken).not.toContainText("No Taken entries");
  await publishFiles(page, {
    repository,
    revision: "d3".repeat(20),
    files: { ".planning/PRODUCT-BACKLOG.md": emptyBacklog },
  });
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
  await expect(taken.locator(".column-count")).toHaveText("3 entries");
  await showColumn(page, "Taken");
  for (const session of [
    local.session.sessionId,
    story.session.sessionId,
    secondId,
  ]) {
    await showColumn(page, "Taken");
    const entry = parts(page).taken.locator(
      `[data-shows-session="claude:${session}"]`,
    );
    idleBetweenSteps(dashboard, session);
    await markDoneAnyway(entry);
    await expect(entry).toHaveCount(0);
  }
  await expect(localEntries(page)).toHaveCount(0);
  await expect(taken.locator(".column-count")).toHaveText("0 entries");
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(recentlyDone.locator(".session-entry")).toHaveCount(3);
  await expect(parts(page).readRevision).toContainText(
    shortRevision("d3".repeat(20)),
  );
  expect(
    (await savedLocalSessionRecords(dashboard)).every(
      (record) => record.doneAt !== undefined,
    ),
  ).toBe(true);
  expect(
    (await savedLocalSessionRecords(dashboard))
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
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("inspect local work");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await terminal.getByRole("button", { name: "Close" }).click();
  const active = localEntries(page);
  await expect(active).toHaveCount(1);
  const native = await sessionNamedBy(active);
  const key = `claude:${native}`;
  const recent = parts(page).recentlyDone.locator(
    `[data-shows-session="${key}"]`,
  );
  await expect(parts(page).taken.locator(".column-count")).toHaveText(
    "1 entry",
  );
  await expect(parts(page).taken).not.toContainText("No Taken entries");
  await expect(recent).toHaveCount(0);
  const folder = path.join(dashboard.home, "git", "open-dough");
  renameSync(folder, `${folder}.away`);
  await markDoneAnyway(active);
  await expect(active).toContainText("The session could not be marked done.");
  await expect(await sessionAction(active, "Mark as done")).toBeFocused();
  expect(
    (await savedLocalSessionRecords(dashboard))[0]?.doneAt,
  ).toBeUndefined();
  await expect(recent).toHaveCount(0);
  renameSync(`${folder}.away`, folder);
  idleBetweenSteps(dashboard, native);
  await markDoneAnyway(active);
  await expect(active).toHaveCount(0);
  await expect(recent).toBeFocused();
  await expect(sessionStateOf(recent)).toHaveText("Done");
  expect((await savedLocalSessionRecords(dashboard))[0]?.doneAt).toBeDefined();
  await sessionsSidebarParts(page).button.click();
  await expect(sessionsSidebarParts(page).entries).toHaveCount(0);
  await reloadUntilRead(page);
  await expect(recent).toHaveCount(1);
  const doneAt = (await savedLocalSessionRecords(dashboard))[0]?.doneAt;
  await showColumn(page, "Recently done");
  const beforeReopen = dashboard.claudeAttaches().length;
  dashboard.claudeSessionBecomes(native, "forgotten");
  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(terminal.getByRole("status")).toContainText(
    "Disconnected from the session",
  );
  expect((await savedLocalSessionRecords(dashboard))[0]?.doneAt).toBe(doneAt);
  expect(dashboard.claudeAttaches()).toHaveLength(beforeReopen);
  await expect(recent).toHaveCount(1);
  await expect(active).toHaveCount(0);
  await terminal.getByRole("button", { name: "Close" }).click();
  await expect(
    recent.getByRole("button", { name: "Open terminal" }),
  ).toBeFocused();
});

test("deleting its last local Taken entry returns the keyboard to Taken and settles its empty count", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await publishMembership(page);
  await page.goto("/");
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("the only local session");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("attached");
  await panel.getByRole("button", { name: "Close" }).click();
  dashboard.claudeListingFails(true);
  await reloadUntilRead(page);
  const entry = localEntries(page);
  await expect(sessionStateOf(entry)).toContainText("State unknown");
  await showColumn(page, "Taken");
  await (await sessionAction(entry, "Delete record…")).click();
  await entry
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(entry).toHaveCount(0);
  const { taken } = parts(page);
  await expect(taken).toBeFocused();
  await expect(taken.locator(".column-count")).toHaveText("0 entries");
  await expect(taken).toContainText("No Taken entries are recorded.");
  expect(await savedLocalSessionRecords(dashboard)).toEqual([]);
});
