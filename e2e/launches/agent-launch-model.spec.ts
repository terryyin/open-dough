// Model and reasoning effort reach Claude and the saved launch request on
// installed projects. A blank ad hoc launch keeps the session dialog's defaults.
import path from "node:path";
import { realpathSync } from "node:fs";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  instructionField,
  openStartSession,
  storyLaunchChoices,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  readyIdentity,
  readyStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { claudeRefinementRepository } from "../../dashboard/test-support/support/claudeRefinementRepository.ts";
import {
  expectInstalledClaudeStory,
  readClaudeLaunch,
} from "./claudeLaunchObservation.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";

test.use({
  projectFolders: ["open-dough"],
  originRepository: claudeRefinementRepository(),
});

const choices = [
  "Default (your Claude Code setting)",
  "Fable",
  "Opus",
  "Sonnet",
];

test("the refinement dialog offers Model after the instruction on Default, and choosing Opus starts the session with --model opus", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const board = await openInstalledStoryBoard(page, origin);
  const { dialog, submit } = await board.open(notRefinedStory, "Refinement");
  const selection = storyLaunchChoices(dialog);
  await expect(selection.model).toBeVisible();
  await selection.showsModels("", choices);
  const [field, model] = await Promise.all([
    instructionField(dialog).boundingBox(),
    selection.model.boundingBox(),
  ]);
  if (!field || !model) throw new Error("not laid out");
  expect(model.y).toBeGreaterThanOrEqual(field.y + field.height);

  await selection.chooseModel("opus");
  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const launch = readClaudeLaunch(dashboard, outcome, before);
  await expect(dialog).toBeHidden();
  expect(launch.started.name).toContain("Refinement");
  expect(launch.started.model).toBe("opus");
  expect(launch.record.request.model).toBe("opus");
  expectInstalledClaudeStory(dashboard, launch, {
    invocation: `/dough-story-refinement ${notRefinedIdentity}`,
    handoff: "Established preparation:",
    workspace: path.join(origin.project, ".worktrees", "story-c"),
    publishedSha: await originMain(origin),
  });
});

test("the execution dialog offers Claude Code's efforts whatever the model, and Opus with high starts the session with --effort high", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const board = await openInstalledStoryBoard(page, origin);
  const { dialog, submit } = await board.open(readyStory, "Execution");
  const selection = storyLaunchChoices(dialog);
  const efforts = [
    "low",
    "medium (Open Dough default)",
    "high (about 3× the cost of medium)",
    "xhigh (about 3× the cost of medium)",
    "max (about 7× the cost of medium)",
  ];
  await expect(selection.effort.locator("option")).toHaveText(efforts);
  await expect(selection.effort).toHaveValue("medium");
  await selection.chooseModel("opus");
  await expect(selection.effort.locator("option")).toHaveText(efforts);
  await selection.effort.selectOption("high");

  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const launch = readClaudeLaunch(dashboard, outcome, before);
  await expect(dialog).toBeHidden();
  expect(launch.started).toMatchObject({ model: "opus", effort: "high" });
  expect(launch.record.request).toMatchObject({
    model: "opus",
    effort: "high",
  });
  expectInstalledClaudeStory(dashboard, launch, {
    invocation: `/dough-execute-plan ${readyIdentity}`,
    handoff: "Established start:",
    workspace: path.join(origin.project, ".worktrees", "story-b"),
    publishedSha: await originMain(origin),
  });
});

test("the session dialog left on Default starts the session without --model, at Open Dough's default effort", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  await openInstalledStoryBoard(page, origin);
  const { dialog, submit } = await openStartSession(page, "Open Dough");

  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const { started, record } = readClaudeLaunch(dashboard, outcome, before);
  await expect(dialog).toBeHidden();
  expect(started).not.toHaveProperty("model");
  expect(started.effort).toBe("medium");
  expect(started.cwd).toBe(realpathSync(origin.project));
  expect(record.request).not.toHaveProperty("model");
  expect(record.request.effort).toBe("medium");
});

test("Opus launched from a dialog, the same dialog opens again on Default", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  await openInstalledStoryBoard(page, origin);
  const first = await openStartSession(page, "Open Dough");
  await storyLaunchChoices(first.dialog).chooseModel("opus");
  const before = dashboard.claudeLaunches().length;
  const acceptance = nextAcceptedAttemptId(page);
  await first.submit();
  const outcome = await settledOutcome(dashboard, await acceptance);
  const selected = readClaudeLaunch(dashboard, outcome, before);
  await expect(first.dialog).toBeHidden();

  const second = await openStartSession(page, "Open Dough");
  await expect(storyLaunchChoices(second.dialog).model).toHaveValue("");
  const defaultBefore = dashboard.claudeLaunches().length;
  const defaultAcceptance = nextAcceptedAttemptId(page);
  await second.submit();
  const defaultOutcome = await settledOutcome(
    dashboard,
    await defaultAcceptance,
  );
  const defaulted = readClaudeLaunch(dashboard, defaultOutcome, defaultBefore);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
  expect(selected.started.model).toBe("opus");
  expect(selected.record.request.model).toBe("opus");
  expect(defaulted.started).not.toHaveProperty("model");
  expect(defaulted.record.request).not.toHaveProperty("model");
});

test("a refused launch with Opus says Launch failed beside its action, closes the dialog, and lists no session", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("refused");
  const board = await openInstalledStoryBoard(page, origin);
  const { dialog, submit } = await board.open(readyStory, "Execution");
  await storyLaunchChoices(dialog).chooseModel("opus");
  await submit();

  await expect(dialog).toBeHidden();
  await expect(board.launchProblem(readyStory)).toContainText(
    "Launch failed: Claude Code refused to start a session",
  );
  await expect(board.launchProblem(readyStory)).toContainText("Opus");
  await expect(storyCardSessions(board.card(readyStory))).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});
