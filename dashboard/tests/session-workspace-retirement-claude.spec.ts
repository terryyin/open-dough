// Recorded Claude workspace retirement uses the shared passive final report.
import { readFileSync, rmSync } from "node:fs";
import type { APIResponse } from "@playwright/test";
import { test, expect } from "./dashboardTest.ts";
import { stored } from "./support/codexLaunch.ts";
import {
  storyCardAttentionOf,
  storyCardSessions,
  parts,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "./sessionsSidebarPage.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import {
  recordedClaude as recorded,
  report,
  save,
  storeFile,
} from "./support/retainedReport.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { markAsDone, markDone } from "./support/markDone.ts";
import { workspaceMissing } from "../src/sessionAccess.ts";
test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

test("retired Claude preparation opens retained report after refresh without waking and preserves read/done intent", async ({
  page,
  dashboard,
}) => {
  const { record, workspace } = await recorded(dashboard);
  dashboard.claudeSessionBecomes(record.session.sessionId, "blocked");
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await reloadUntilRead(page);
  await settled();
  const entry = storyCardSessions(card(notRefinedStory));
  await expect(sessionStateOf(entry)).toContainText("Completed with attention");
  await expect(sessionStateOf(entry)).not.toContainText("Needs input");
  await expect(entry).toContainText(
    "Mark as done acknowledges this session; it does not complete the story.",
  );
  await expect(storyCardAttentionOf(card(notRefinedStory))).toHaveText(
    "1 session needs attention",
  );
  await expect(card(notRefinedStory)).toContainText("Not assessed as ready");
  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await expectSessionsSidebarSessionEntryShown(
    sidebar.entries,
    "Completed with attention: Mark as done acknowledges this session; it does not complete the story.",
    "ready",
  );
  await expect(sidebar.badge).toHaveAttribute(
    "aria-label",
    "1 session needs attention",
  );
  await sidebar.button.click();
  await expect(entry).toContainText("saved workspace is missing");
  await entry.getByRole("button", { name: "Read final report" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".final-report-text")).toHaveText(report);
  await expect(panel).toContainText(
    "Mark as done acknowledges this session; it does not complete the story.",
  );
  await expect(panel).toContainText(workspace);
  expect(dashboard.claudeAttaches()).toEqual([]);
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await entry.getByRole("button", { name: "Mark as read" }).click();
  await expect
    .poll(() => stored(dashboard.home)[0]?.reportRead)
    .toBe(record.completion?.receipt);
  await expect(sessionStateOf(entry)).toContainText("Completed with attention");
  await expect(entry.locator(".session-unread-report")).toHaveCount(0);
  await sidebar.button.click();
  await expectSessionsSidebarSessionEntryShown(
    sidebar.entries,
    "Completed with attention: Mark as done acknowledges this session; it does not complete the story.",
    "ready",
  );
  await sidebar.button.click();
  await entry.getByRole("button", { name: "Read final report" }).click();
  await markDone(panel);
  await expect(panel).toHaveCount(0);
  const doneAt = stored(dashboard.home)[0]?.doneAt;
  expect(doneAt).toBeDefined();
  await reloadUntilRead(page);
  await settled();
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: record.session.sessionId });
  await expect(recent).toContainText("Done");
  await expect(card(notRefinedStory)).toBeVisible();
  await expect(card(notRefinedStory)).toContainText("Not assessed as ready");
  await expect(
    card(notRefinedStory).getByRole("button", { name: "Start execution" }),
  ).toBeEnabled();
  await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(0);
  await recent.getByRole("button", { name: "Read final report" }).click();
  await expect(panel.locator(".final-report-text")).toHaveText(report);
  expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
});

for (const context of ["preparation", "start"] as const) {
  test(`Claude ${context} removed after available observation falls back passively with existing done intent`, async ({
    page,
    dashboard,
  }) => {
    const { record, workspace } = await recorded(dashboard);
    if (context === "start") {
      const preparation = record.preparation;
      if (preparation === undefined) throw new Error("Missing preparation");
      record.start = {
        ...preparation,
        mode: "story-branch",
        publisherId: "recorded-publisher",
        publishedSha: "recorded-sha",
      };
      delete record.preparation;
    }
    const doneAt = new Date(Date.now() - 60_000).toISOString();
    record.doneAt = doneAt;
    record.reportRead = record.completion?.receipt;
    save(dashboard.home, [record]);
    const baseline = readFileSync(storeFile(dashboard.home), "utf8");
    let observation: APIResponse | undefined;
    await page.route("**/__agent-launch", async (route) => {
      observation ??= await route.fetch({
        headers: { ...route.request().headers(), origin: dashboard.origin },
      });
      expect(observation.status()).toBe(200);
      await route.fulfill({ response: observation });
    });
    const { settled } = await openStoryColumnsJourney(page, journey);
    await settled();
    const entry = parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: record.session.sessionId });
    const open = entry.getByRole("button", { name: "Open terminal" });
    await expect(open).toBeVisible();
    rmSync(workspace, { recursive: true });
    await open.click();
    const panel = page.getByRole("region", { name: "Final report" });
    await expect(panel.locator(".final-report-text")).toHaveText(report);
    await expect(panel).toContainText("saved workspace is missing");
    await expect(
      page.getByRole("region", { name: "Terminal", exact: true }),
    ).toHaveCount(0);
    await expect(markAsDone(panel)).toHaveCount(0);
    expect(dashboard.claudeAttaches()).toEqual([]);
    expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
    await panel.getByRole("button", { name: "Close", exact: true }).click();
    await expect(open).toBeFocused();
  });
}

test("missing Claude workspace with quiet empty completion keeps report and directory facts independent without waking", async ({
  page,
  dashboard,
}) => {
  const { workspace } = await recorded(dashboard, "");
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  await storyCardSessions(card(notRefinedStory))
    .getByRole("button", { name: "Read final report" })
    .click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel).toContainText(
    "Quiet completion was recorded with no attention message.",
  );
  await expect(panel).toContainText(
    "Claude Code cannot read a native final report here.",
  );
  await expect(panel).toContainText(workspaceMissing);
  await expect(panel).not.toContainText(
    "No retained final report is available.",
  );
  await expect(panel.locator(".final-report-text")).toHaveCount(0);
  expect(dashboard.claudeAttaches()).toEqual([]);
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
});

for (const context of ["existing", "legacy"] as const) {
  test(`Claude ${context} workspace retains terminal attachment`, async ({
    page,
    dashboard,
  }) => {
    const { record } = await recorded(dashboard);
    if (context === "legacy") {
      delete record.preparation;
      save(dashboard.home, [record]);
    }
    const { card, settled } = await openStoryColumnsJourney(page, journey);
    await settled();
    const entry = storyCardSessions(card(notRefinedStory));
    await entry.getByRole("button", { name: "Open terminal" }).click();
    const panel = page.getByRole("region", { name: "Terminal", exact: true });
    await expect(panel).toBeVisible();
    await expect
      .poll(() => dashboard.claudeAttaches().map((attach) => attach.id))
      .toEqual([
        record.session.host === "claude" ? record.session.shortId : "",
      ]);
    await expect(panel).toContainText("attached");
  });
}
