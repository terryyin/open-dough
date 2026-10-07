// Recorded Claude workspace retirement uses the shared passive report panel.
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import type { APIResponse } from "@playwright/test";
import { test, expect } from "./dashboardTest.ts";
import { stored } from "./support/codexLaunch.ts";
import { launch, refinementRequest } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  notRefinedIdentity,
  notRefinedStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { report, save, storeFile } from "./support/retainedReport.ts";
import { completionReport } from "./support/completionReport.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryStagesJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryStagesJourney();
});
test.afterAll(() => (journey as StoryStagesJourney | undefined)?.cleanup());

async function recorded(dashboard: DashboardServer, message = report) {
  await launch(dashboard, {
    ...refinementRequest,
    identity: notRefinedIdentity,
    title: notRefinedStory,
  });
  const record = stored(dashboard.home)[0];
  if (record === undefined) throw new Error("Missing Claude launch");
  const workspace = path.join(dashboard.home, "retired-claude-workspace");
  mkdirSync(workspace);
  record.preparation = {
    identity: notRefinedIdentity,
    workspace,
    branch: "claude/retired",
    remote: "origin",
    target: "main",
  };
  record.completion = completionReport({ message });
  dashboard.claudeSessionBecomes(record.session.sessionId, "done-exited");
  save(dashboard.home, [record]);
  return { record, workspace };
}

test("retired Claude preparation opens retained report after refresh without waking and preserves read/done intent", async ({
  page,
  dashboard,
}) => {
  const { record, workspace } = await recorded(dashboard);
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card } = await openStoryStagesJourney(page, journey);
  await page.reload();
  const entry = cardSessions(card(notRefinedStory));
  await expect(entry).toContainText("saved workspace is missing");
  await entry.getByRole("button", { name: "Read final report" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".session-final-report")).toHaveText(report);
  await expect(panel).toContainText(workspace);
  expect(dashboard.claudeAttaches()).toEqual([]);
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await entry.getByRole("button", { name: "Mark as read" }).click();
  await expect
    .poll(() => stored(dashboard.home)[0]?.reportRead)
    .toBe(record.completion?.receipt);
  await entry.getByRole("button", { name: "Read final report" }).click();
  await panel.getByRole("button", { name: "Mark as done" }).click();
  await expect(panel).toHaveCount(0);
  const doneAt = stored(dashboard.home)[0]?.doneAt;
  expect(doneAt).toBeDefined();
  await page.reload();
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: record.session.sessionId });
  await expect(recent).toContainText("Done");
  await recent.getByRole("button", { name: "Read final report" }).click();
  await expect(panel.locator(".session-final-report")).toHaveText(report);
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
    const doneAt = "2026-10-01T00:00:00Z";
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
    await openStoryStagesJourney(page, journey);
    const entry = parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: record.session.sessionId });
    const open = entry.getByRole("button", { name: "Open terminal" });
    await expect(open).toBeVisible();
    rmSync(workspace, { recursive: true });
    await open.click();
    const panel = page.getByRole("region", { name: "Final report" });
    await expect(panel.locator(".session-final-report")).toHaveText(report);
    await expect(panel).toContainText("saved workspace is missing");
    await expect(
      page.getByRole("region", { name: "Terminal", exact: true }),
    ).toHaveCount(0);
    await expect(
      panel.getByRole("button", { name: "Mark as done" }),
    ).toHaveCount(0);
    expect(dashboard.claudeAttaches()).toEqual([]);
    expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
    await panel.getByRole("button", { name: "Close", exact: true }).click();
    await expect(open).toBeFocused();
  });
}

for (const [cause, oldProblem] of [
  [
    "requires terminal input",
    "Native rename requires terminal input while the reporting sender is still working. Use Mark as done after reporting finishes.",
  ],
  [
    "No terminal attachment",
    "No terminal attachment is available to confirm native rename.",
  ],
] as const) {
  test(`Recently done renames a retired-workspace Claude session with the old ${cause} problem`, async ({
    page,
    dashboard,
  }) => {
    const { record, workspace } = await recorded(dashboard);
    dashboard.claudeSessionBecomes(record.session.sessionId, "done-live");
    rmSync(workspace, { recursive: true });
    record.doneAt = "2026-10-01T00:00:00Z";
    record.doneProblem = `Local done mark retained. Claude Code rename failed: ${oldProblem}`;
    save(dashboard.home, [record]);
    const doneName = `done-${record.session.name}`;
    await openStoryStagesJourney(page, journey);
    const recent = parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: record.session.sessionId });
    await expect(recent).toContainText(record.doneProblem);
    await expect(recent).toContainText("saved workspace is missing");
    expect(dashboard.claudeAttaches()).toEqual([]);

    await recent.getByRole("button", { name: "Mark as done" }).click();

    await expect(recent).toContainText(`Named ${doneName}`);
    await expect(recent).not.toContainText(oldProblem);
    await expect(recent.locator(".launch-problem")).toHaveText("");
    expect(stored(dashboard.home)[0]).not.toHaveProperty("doneProblem");
    expect(
      dashboard
        .claudeListing()
        .find((each) => each["sessionId"] === record.session.sessionId),
    ).toMatchObject({ name: doneName });
    expect(dashboard.claudeAttaches()).toEqual([
      expect.objectContaining({
        id: record.session.host === "claude" ? record.session.shortId : "",
        lines: [`/rename ${doneName}`],
      }),
    ]);
    await expect(
      page.getByRole("region", { name: "Terminal", exact: true }),
    ).toHaveCount(0);
  });
}

test("missing Claude workspace without retained report explains the limitation without waking", async ({
  page,
  dashboard,
}) => {
  const { workspace } = await recorded(dashboard, "");
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card } = await openStoryStagesJourney(page, journey);
  await cardSessions(card(notRefinedStory))
    .getByRole("button", { name: "Read final report" })
    .click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel).toContainText("No retained final report is available.");
  await expect(panel).toContainText(
    "Claude Code cannot read a native final report here.",
  );
  await expect(panel).toContainText("saved workspace is missing");
  await expect(panel.locator(".session-final-report")).toHaveCount(0);
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
    const { card } = await openStoryStagesJourney(page, journey);
    const entry = cardSessions(card(notRefinedStory));
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
