// Raw saved sessions and published files supply facts; the built dashboard
// determines the mixed columns, controls and counts through its real boundary.
import { renameSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { expect, test } from "./dashboardTest.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { edgeControl, rem, showColumn } from "./dashboardColumnsPage.ts";
import {
  expectMembership,
  parts,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchCardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  at,
  placed,
  publishedFiles,
  queuedIdentity,
  queuedTitle,
  repository,
  revision,
} from "./recentlyDoneRecords.ts";
import { keptSessions } from "./recentlyDoneSessions.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

const empty = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
const publish = (page: Parameters<typeof publishFiles>[0], backlog = empty) =>
  publishFiles(page, {
    repository,
    revision,
    files: { ".planning/PRODUCT-BACKLOG.md": backlog },
  });
const locals = (page: Parameters<typeof parts>[0]) =>
  parts(page).taken.locator(":scope > ol > li > .session-entry");
const saved = async (dashboard: Parameters<typeof recordsOf>[0]) =>
  (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];

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
  await publish(page, backlog);
  await page.setViewportSize({ width: 40 * rem, height: 900 });
  await page.goto("/");
  await expectMembership(page, { taken: [queuedTitle], backlog: [] });
  await expect(edgeControl(page, "Taken")).toHaveText("Taken 2 entries");
  await showColumn(page, "Taken");
  const { taken, recentlyDone } = parts(page);
  await expect(taken.locator(".stage-count")).toHaveText("2 entries");
  await expect(taken.locator("[data-work] .session-entry")).toHaveCount(2);
  await expect(locals(page)).toHaveCount(1);
  for (const [index, name] of [
    queuedTitle,
    "Ad hoc session for Open Dough session",
  ].entries())
    await expect(
      taken.locator(":scope > ol > li > article").nth(index),
    ).toHaveAccessibleName(name);
  await expect(locals(page).locator(".card-meta, .slice-progress")).toHaveCount(
    0,
  );
  await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
  await expect(taken).not.toContainText("No Taken entries");
  // Removing published membership leaves the same three open identities local,
  // ordered by launch, without creating a story or Take for any of them.
  await publishFiles(page, {
    repository,
    revision: "d3".repeat(20),
    files: { ".planning/PRODUCT-BACKLOG.md": empty },
  });
  await page.reload();
  await expectMembership(page, { taken: [], backlog: [] });
  for (const [index, key] of [
    `claude:${local.session.sessionId}`,
    `claude:${story.session.sessionId}`,
    `claude:${secondId}`,
  ].entries())
    await expect(locals(page).nth(index)).toHaveAttribute(
      "data-shows-session",
      key,
    );
  await expect(taken.locator(".stage-count")).toHaveText("3 entries");
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
  await expect(locals(page)).toHaveCount(0);
  await expect(taken.locator(".stage-count")).toHaveText("0 entries");
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(recentlyDone.locator(".session-entry")).toHaveCount(3);
  await expect(parts(page).source).toContainText("d3".repeat(20));
  expect(
    (await saved(dashboard)).every((record) => record.doneAt !== undefined),
  ).toBe(true);
  expect(
    (await saved(dashboard))
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
  await publish(page);
  await page.goto("/");
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("inspect local work");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await terminal.getByRole("button", { name: "Close" }).click();
  const active = locals(page);
  await expect(active).toHaveCount(1);
  const native = await sessionNamedBy(active);
  const key = `claude:${native}`;
  const recent = parts(page).recentlyDone.locator(
    `[data-shows-session="${key}"]`,
  );
  await expect(parts(page).taken.locator(".stage-count")).toHaveText("1 entry");
  await expect(parts(page).taken).not.toContainText("No Taken entries");
  await expect(recent).toHaveCount(0);
  const folder = path.join(dashboard.home, "git", "open-dough");
  renameSync(folder, `${folder}.away`);
  await markDoneAnyway(active);
  await expect(active).toContainText("The session could not be marked done.");
  await expect(
    active.getByRole("button", { name: "Mark as done" }),
  ).toBeFocused();
  expect((await saved(dashboard))[0]?.doneAt).toBeUndefined();
  await expect(recent).toHaveCount(0);
  renameSync(`${folder}.away`, folder);
  idleBetweenSteps(dashboard, native);
  await markDoneAnyway(active);
  await expect(active).toHaveCount(0);
  await expect(recent).toBeFocused();
  await expect(sessionStateOf(recent)).toHaveText("Done");
  expect((await saved(dashboard))[0]?.doneAt).toBeDefined();
  await sidebarParts(page).button.click();
  await expect(sidebarParts(page).entries).toHaveCount(0);
  await page.reload();
  await expect(recent).toHaveCount(1);
  const doneAt = (await saved(dashboard))[0]?.doneAt;
  // Native disappearance refuses terminal readiness before clearing local Done.
  await showColumn(page, "Recently done");
  const beforeReopen = dashboard.claudeAttaches().length;
  dashboard.claudeSessionBecomes(native, "forgotten");
  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(terminal.getByRole("status")).toContainText(
    "Disconnected from the session",
  );
  expect((await saved(dashboard))[0]?.doneAt).toBe(doneAt);
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
  await publish(page);
  await page.goto("/");
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await startSessionField(dialog).fill("the only local session");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("attached");
  await panel.getByRole("button", { name: "Close" }).click();
  dashboard.claudeListingFails(true);
  await page.reload();
  const entry = locals(page);
  await expect(sessionStateOf(entry)).toContainText("State unknown");
  await showColumn(page, "Taken");
  await entry.getByRole("button", { name: "Delete record…" }).click();
  await entry
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(entry).toHaveCount(0);
  await expect(parts(page).taken).toBeFocused();
  await expect(parts(page).taken.locator(".stage-count")).toHaveText(
    "0 entries",
  );
  await expect(parts(page).taken).toContainText(
    "No Taken entries are recorded.",
  );
  expect(await saved(dashboard)).toEqual([]);
});
