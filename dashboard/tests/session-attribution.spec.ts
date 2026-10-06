import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { publishPreparingJourney, storyA, storyC } from "./preparingJourney.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";

test.use({ projectFolders: ["open-dough"] });

test("a retained session keeps its allocation credit after release and a later preparation, and preserves known facts when history is missing", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  test.setTimeout(120_000);
  const journey = await publishPreparingJourney();
  afterGitHubStops(journey.cleanup);
  const reused = await journey.reuseRefiner();
  const show = async (revision: string) => {
    execFileSync("git", [
      "-C",
      journey.origin,
      "update-ref",
      "refs/heads/main",
      revision,
    ]);
    await page.reload();
  };
  const workspace = path.join(
    dashboard.home,
    "git/open-dough/.worktrees/c-refine",
  );
  mkdirSync(workspace, { recursive: true });
  const sessionId = dashboard.claudeListsSession({
    name: storyC,
    cwd: workspace,
    startedAt: Date.now(),
  });
  const record = {
    request: {
      source: "open-dough",
      identity: "SEED-C#c",
      title: storyC,
      workflow: "refinement",
      host: "claude",
      model: "Fable",
    },
    session: {
      host: "claude",
      sessionId,
      shortId: sessionId.slice(0, 8),
      name: storyC,
    },
    preparation: {
      identity: "SEED-C#c",
      workspace,
      branch: "claude/c-refine",
      remote: "origin",
      target: "main",
      agent: journey.preparers.refining,
      publishedSha: journey.refiningAllocation,
    },
    launchedAt: new Date().toISOString(),
  } satisfies LaunchRecord;
  const legacy: LaunchRecord = {
    ...record,
    request: { ...record.request, model: "claude-opus-5-5" },
    session: {
      host: "claude",
      name: storyC,
      sessionId: "22222222-aaaa-bbbb-cccc-000000000002",
      shortId: "22222222",
    },
    preparation: { ...record.preparation, publishedSha: undefined },
  };
  const unreadable: LaunchRecord = {
    ...record,
    request: { ...record.request, model: "claude-opus-5-5" },
    session: {
      host: "claude",
      name: storyC,
      sessionId: "33333333-aaaa-bbbb-cccc-000000000003",
      shortId: "33333333",
    },
    preparation: { ...record.preparation, publishedSha: "ff".repeat(20) },
  };
  const matchingId = dashboard.claudeListsSession({
    name: storyC,
    cwd: workspace,
    startedAt: Date.now(),
  });
  const matching: LaunchRecord = {
    ...record,
    request: { ...record.request, model: "claude-opus-5-5" },
    session: {
      host: "claude",
      name: storyC,
      sessionId: matchingId,
      shortId: matchingId.slice(0, 8),
    },
    completion: {
      receipt: "44444444-aaaa-4bbb-8ccc-000000000005",
      reference: "44444444-aaaa-4bbb-8ccc-000000000006",
      outcome: "completed",
      message: "Ready for slice planning",
      receivedAt: new Date().toISOString(),
    },
  };
  await keepLaunchRecords(dashboard, [record, legacy, unreadable, matching]);
  execFileSync("git", [
    "-C",
    journey.origin,
    "update-ref",
    "refs/heads/main",
    journey.announced,
  ]);
  await publishCommittedOrigin(page, {
    repoDir: journey.origin,
    revision: journey.announced,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", { name: storyC });
  const original = cardSessions(card).filter({ hasText: sessionId });
  const historical = `Session assignment: ${journey.preparers.refining} · Integration Checkout · Claude Code`;
  await expect(card.locator(".card-preparing .owner-line")).toHaveText(
    `${journey.preparers.refining} · Integration Checkout · Claude Code · claude-opus-5-5`,
  );
  await expect(original).toContainText(historical);
  await expect(original).toContainText("Model: Fable (requested)");
  const legacySession = cardSessions(card).filter({ hasText: "22222222" });
  const missing = cardSessions(card).filter({ hasText: "33333333" });
  const unknown = `Session assignment: ${journey.preparers.refining} · Human developer unknown · Claude Code`;
  await expect(legacySession).toContainText(unknown);
  await expect(missing).toContainText(unknown);
  const duplicate = cardSessions(card).filter({ hasText: matchingId });
  await expect(duplicate).toContainText("Ready for slice planning");
  await expect(duplicate.locator(".session-assignment")).toHaveCount(0);
  await expect(duplicate).toContainText(
    "Workspace ~/git/open-dough/.worktrees/c-refine",
  );
  await expect(
    duplicate.getByRole("button", { name: "Mark as read" }),
  ).toBeVisible();
  await expect(
    duplicate.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(
    duplicate.getByRole("button", { name: "Mark as done" }),
  ).toBeVisible();
  await expect(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: matchingId }),
  ).toHaveCount(0);
  await show(journey.refinedLanded);
  await expect(duplicate).toContainText(historical);
  await expect(duplicate).toContainText("Model: claude-opus-5-5 (requested)");
  await expect(original).toContainText(historical);
  await expect(original).toContainText("Model: Fable (requested)");
  await expect(original.locator(".session-state")).toHaveText("Working");
  await expect(
    original.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(card.locator(".preparing-activity")).toHaveCount(0);
  await expect(legacySession).toContainText(unknown);
  await expect(missing).toContainText(unknown);
  await expect(missing).toContainText("Model: claude-opus-5-5 (requested)");
  await show(journey.planningAnnounced);
  await expect(card.locator(".card-preparing")).toContainText(
    journey.preparers.planning,
  );
  await expect(original).toContainText(historical);
  await expect(original).not.toContainText(journey.preparers.planning);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: sessionId });
  await expect(recent).toHaveCount(0);
  await show(reused);
  const newAssignment = parts(page)
    .backlog.getByRole("article", { name: storyA })
    .locator(".owner-line")
    .filter({ hasText: journey.preparers.refining });
  await expect(newAssignment).toHaveText(
    `${journey.preparers.refining} · Later Allocator · Cursor · later-model`,
  );
  await expect(original).toContainText(historical);
  await expect(original).not.toContainText("Later Allocator");
});
