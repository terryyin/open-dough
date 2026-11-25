// Story-card execution and refinement publish to the same installed origin
// the board follows. Claude's process is synthetic and records its input.
import { realpathSync } from "node:fs";
import path from "node:path";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  storyCardSessionName,
  storyCardSessions,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyIdentity,
  readyStory,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { installedStoryLaunchInput } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";

test.use({
  projectFolders: ["open-dough"],
  originRepository: queuedRepositoryWithRoughStory(roughStoryC).please(),
});

const queued = {
  taken: [],
  backlog: [takenStory, readyStory, notRefinedStory],
};
const claimed = { taken: [readyStory], backlog: [takenStory, notRefinedStory] };

async function expectNativeStoryLaunch(
  dashboard: DashboardServer,
  origin: StartOrigin,
  {
    title,
    identity,
    workflow,
    command,
    slug,
    instruction,
  }: {
    title: string;
    identity: string;
    workflow: "Execution" | "Refinement";
    command: string;
    slug: string;
    instruction: string;
  },
) {
  const workspace = path.join(origin.project, ".worktrees", slug);
  const [started] = dashboard.claudeLaunches();
  expect(dashboard.claudeLaunches()).toHaveLength(1);
  expect(started).toMatchObject({
    name: `Open Dough · ${workflow} · ${title}`,
    cwd: realpathSync(workspace),
  });
  const sent = installedStoryLaunchInput(started?.instruction);
  expect(sent.invocation).toBe(`/${command} ${identity}`);
  expect(sent.handoff).toContain(
    workflow === "Execution"
      ? "Established start:"
      : "Established preparation:",
  );
  expect(sent.handoff).toContain(`- workspace: ${workspace}`);
  expect(sent.handoff).toContain(await originMain(origin));
  expect(sent.reporting).toContain("Dashboard reporting context:");
  expect(sent.instruction).toBe(instruction);
}

test("Ready execution publishes the Take and focuses its session on the same story card", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const board = await openInstalledStoryBoard(page, origin, { follows: false });
  await expectMembership(page, queued);
  await board.settled();
  const before = Date.now();
  const main = await originMain(origin);
  const launch = await board.open(readyStory, "Execution");
  const own = "refine and plan it first, then execute";
  await launch.instruction.fill(own);
  await launch.submit();
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
    .toHaveLength(1);

  const entry = storyCardSessions(board.card(readyStory));
  await expect(entry).toHaveCount(1);
  await expect(entry).toHaveAccessibleName(storyCardSessionName("Execution"));
  await expect(launch.dialog).toBeHidden();
  await expect(entry).toBeFocused();
  await expect(board.action(readyStory, "Execution")).toBeDisabled();
  await expect(board.action(readyStory, "Refinement")).toBeDisabled();
  await expect(sessionStateOf(entry)).toHaveText("Working");
  await expect(entry).toContainText("Execution started in Claude Code");
  await expect(entry).toContainText(
    "Local: launched from this dashboard on this machine.",
  );
  const launchedAt = Date.parse(
    (await entry.locator("time").getAttribute("datetime")) ?? "",
  );
  expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
  expect(launchedAt).toBeLessThanOrEqual(Date.now());
  await expect(entry).toContainText(/Session [0-9a-f]{8}-/);
  await expect(openTerminalControl(entry)).toBeVisible();
  await expectNativeStoryLaunch(dashboard, origin, {
    title: readyStory,
    identity: readyIdentity,
    workflow: "Execution",
    command: "dough-execute-plan",
    slug: "story-b",
    instruction: own,
  });
  expect(await originMain(origin)).not.toBe(main);
  await board.showPublished();
  await expectMembership(page, claimed);
  await expect(entry).toHaveCount(1);
  await expect(board.action(readyStory, "Execution")).toHaveCount(0);
  await expect(board.action(readyStory, "Refinement")).toHaveCount(0);
  await expect(storyCardSessions(board.card(takenStory))).toHaveCount(0);
  await expect(board.action(takenStory, "Execution")).toBeEnabled();
});

test("rough refinement publishes its Preparing assignment and opens its worktree", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const board = await openInstalledStoryBoard(page, origin);
  await expectMembership(page, queued);
  await board.settled();
  await expect(board.card(notRefinedStory)).toContainText(
    "Not assessed as ready",
  );
  const own = "Focus on the empty-state wording";
  const launch = await board.open(notRefinedStory, "Refinement");
  await launch.instruction.fill(own);
  await launch.submit();

  const entry = storyCardSessions(board.card(notRefinedStory));
  await expect(entry).toHaveCount(1);
  await expect(entry).toHaveAccessibleName(storyCardSessionName("Refinement"));
  await expect(launch.dialog).toBeHidden();
  await expect(entry).toBeFocused();
  await expect(entry).toContainText("Refinement started in Claude Code");
  await expectMembership(page, queued);
  await expect(board.action(notRefinedStory, "Refinement")).toBeDisabled();
  await expect(board.action(notRefinedStory, "Execution")).toBeDisabled();
  expect(await origin.takenProfiles()).toContainEqual(
    expect.objectContaining({
      identity: notRefinedIdentity,
      activity: "preparation",
    }),
  );
  await expectNativeStoryLaunch(dashboard, origin, {
    title: notRefinedStory,
    identity: notRefinedIdentity,
    workflow: "Refinement",
    command: "dough-story-refinement",
    slug: "story-c",
    instruction: own,
  });
});

test.describe("phone touch submission", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("only explicit Start sends the exact multiline draft and the card distinguishes accepted startup from a launched session", async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario("held");
    const board = await openInstalledStoryBoard(page, origin, {
      follows: false,
    });
    const launch = await board.open(readyStory, "Execution", "touch");
    const draft =
      "Refine this story first.\n\nKeep the exact next steps 日本語.\nThen execute.";
    await launch.instruction.fill(draft);
    for (const viewport of [
      { width: 844, height: 390 },
      { width: 390, height: 300 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(launch.instruction).toHaveValue(draft);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
    }
    await launch.submit();
    await expect(launch.dialog).toBeHidden();
    await expect(board.card(readyStory)).toContainText(
      /Local startup in progress|Starting execution in Claude Code/,
    );
    await expect(board.action(readyStory, "Execution")).toBeDisabled();
    const session = storyCardSessions(board.card(readyStory));
    await expect(session).toHaveCount(0);
    await expect
      .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
      .toHaveLength(1);
    await expectNativeStoryLaunch(dashboard, origin, {
      title: readyStory,
      identity: readyIdentity,
      workflow: "Execution",
      command: "dough-execute-plan",
      slug: "story-b",
      instruction: draft,
    });
    await page.setViewportSize({ width: 844, height: 390 });
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    dashboard.releaseHeldClaude();
    await expect(session).toHaveCount(1);
    await expect(session).toContainText("Execution started in Claude Code");
    await expect(sessionStateOf(session)).toHaveText("Working");
    await expect(session).toBeFocused();
    await board.showPublished();
    await expectMembership(page, claimed);
    await expect(session).toHaveCount(1);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});
