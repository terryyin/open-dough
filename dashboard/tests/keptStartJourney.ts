// A claim published without a session, kept on this machine as a start: the
// real installed `execution-start.mjs` and a real bare origin
// (./support/startOrigin.ts) stand behind the page, which reads that origin as
// GitHub would (./committedOrigin.ts); the synthetic `claude` refuses the
// first launch. The card then says "Launch failed:" and that the story is
// Taken by the Agent its claim names, no session started, with the workspace;
// once origin shows the story Taken and the page is reloaded, Story A's Taken
// card offers Start execution (./agent-launch-start-taken.spec.ts).

import { existsSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expect, test as base } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

export const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
    await use(origin);
    origin.cleanup();
  },
  dashboard: async ({ github, origin }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: launchWaitMs,
    });
    await use(server);
    await server.close();
  },
});

export const workspaceShown = "~/git/open-dough/.worktrees/story-a";

export const startAction = (card: Locator) =>
  card.getByRole("button", { name: "Start execution" });

// Story B is Taken by another agent and Story A is queued; Story A's refused
// first launch publishes its Take and keeps the start, and once origin shows
// it Taken, the page, reloaded, shows its Taken card.
export async function reachKeptStart(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  await origin.takenByAnotherAgent(otherQueuedIdentity);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const { backlog, taken, source } = parts(page);
  const backlogCard = backlog.getByRole("article", { name: "Story A" });
  const takenCard = taken.getByRole("article", { name: "Story A" });
  const otherTakenCard = taken.getByRole("article", { name: "Story B" });
  await expect(backlogCard).toBeVisible();
  await expect(otherTakenCard).toBeVisible();
  await expect(startAction(otherTakenCard)).toHaveCount(0);

  // The first launch: the start publishes the Take, `claude` refuses.
  dashboard.claudeScenario("refused");
  await startAction(backlogCard).click();
  await page
    .getByRole("dialog", { name: "Start execution in Claude Code" })
    .getByRole("button", { name: "Start" })
    .click();
  await expect(backlogCard.locator(".launch-problem")).toContainText(
    `Launch failed: Claude Code refused to start a session in ${workspaceShown}.`,
    { timeout: launchWaitMs },
  );
  const profile = (await origin.takenProfiles()).find(
    (each) => each["identity"] === queuedIdentity,
  );
  const agent = String(profile?.["agent"]);
  await expect(backlogCard.locator(".launch-problem")).toContainText(
    `Taken by ${agent}; no session started. Workspace ${workspaceShown}.`,
  );
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  expect(existsSync(workspace)).toBe(true);

  // Origin shows the story Taken; after a reload its Taken card shows.
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  published.advanceTo(revision);
  await page.reload();
  await expect(source).toContainText(revision);
  await expect(takenCard).toBeVisible();
  await expect(backlog.getByRole("article", { name: "Story A" })).toHaveCount(
    0,
  );
  await page.reload();
  return { takenCard, otherTakenCard, workspace };
}
