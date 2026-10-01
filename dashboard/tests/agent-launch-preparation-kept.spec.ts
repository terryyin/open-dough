// A preparation announced without a session offers its resume on the story's
// Backlog card (../server/agentLaunches.ts, ../src/CardLaunches.tsx). The real
// installed preparation start and a real bare origin (./support/startOrigin.ts)
// stand behind the page, which reads that origin as GitHub would
// (./committedOrigin.ts); the synthetic `claude` refuses the first launch. After
// a reload the story's Start refinement dialog names the kept workspace and says
// the announcement is already published, so Start publishes no second one, in
// place of the establishing sentence; another Backlog card keeps that sentence.
// Start opens the session in the same workspace with one preparation profile,
// and the offer goes.

import { realpathSync } from "node:fs";
import path from "node:path";
import { keptStarts, recordsOf } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expect, test } from "./support/preparationPage.ts";
import { parts } from "./dashboardPage.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

const workspaceShown = "~/git/open-dough/.worktrees/story-a";
const establishing = "Start also publishes";

test("a Backlog card offers the resume of a kept preparation start, and Start opens the session in the same workspace", async ({
  page,
  dashboard,
  origin,
}) => {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const { backlog } = parts(page);
  const card = backlog.getByRole("article", { name: "Story A" });
  const otherCard = backlog.getByRole("article", { name: "Story B" });
  const dialogOf = (from: typeof card) =>
    from.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(otherCard).toBeVisible();

  // With no kept start the establishing sentence shows.
  await dialogOf(card);
  await expect(dialog).toContainText(establishing);
  await page.keyboard.press("Escape");

  // The first launch announces with Opus; `claude` refuses.
  dashboard.claudeScenario("refused");
  await dialogOf(card);
  await dialog.getByLabel("Model", { exact: true }).selectOption("opus");
  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(card.locator(".launch-problem")).toContainText(
    `Launch failed: Claude Code refused to start a session in ${workspaceShown} with model Opus.`,
  );
  expect(await keptStarts(dashboard)).toMatchObject([
    {
      workflow: "refinement",
      source: "open-dough",
      identity: queuedIdentity,
      workspace: workspaceShown,
    },
  ]);

  // After a reload the card offers the resume; another card does not.
  await page.reload();
  await expect(card).toContainText("Started here, no session yet");
  await expect(otherCard).not.toContainText("Started here");
  await dialogOf(card);
  await expect(dialog).toContainText(
    "This story's Preparing announcement is already published on origin, so Start publishes no second one.",
  );
  await expect(dialog).toContainText(`in workspace ${workspaceShown}`);
  await expect(dialog).toContainText(
    "This start requested Claude Code with Opus model.",
  );
  await expect(dialog).not.toContainText(establishing);
  await page.keyboard.press("Escape");
  await dialogOf(otherCard);
  await expect(dialog).toContainText(establishing);
  await expect(dialog).not.toContainText("already published");
  await page.keyboard.press("Escape");

  // Start resumes: the session opens in the same workspace, one profile.
  dashboard.claudeScenario("launched");
  await dialogOf(card);
  await dialog.getByLabel("Model", { exact: true }).selectOption("sonnet");
  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(card.getByRole("list", { name: "Sessions" })).toContainText(
    `Workspace ${workspaceShown}`,
  );
  await expect(card).not.toContainText("Started here");
  expect(await keptStarts(dashboard)).toEqual([]);
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const launches = dashboard.claudeLaunchCalls();
  expect(launches).toHaveLength(2);
  expect(launches[1]?.cwd).toBe(realpathSync(workspace));
  expect(launches[1]?.argv.at(-1)).toContain(`- workspace: ${workspace}`);
  const profiles = (await origin.takenProfiles()).filter(
    (profile) => profile["identity"] === queuedIdentity,
  );
  expect(profiles).toHaveLength(1);
  expect(profiles[0]?.["activity"]).toBe("preparation");
  expect(profiles[0]?.["model"]).toBe("opus");
  expect(launches[1]?.argv).toContain("sonnet");
  expect(await recordsOf(dashboard, "open-dough")).toMatchObject([
    { request: { model: "sonnet" } },
  ]);
});
