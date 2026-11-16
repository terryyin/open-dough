// Choosing the model in a launch dialog, on the launch journey's committed
// origin (../../dashboard/tests/launchJourney.ts): one representative dialog
// offers Model beside Host after its instruction field on Default, and a
// chosen model reaches the synthetic `claude`
// (../../dashboard/tests/fixtures/fake-claude) as `--model`; another proves
// Default starts without `--model`, and a launched choice does not carry into
// the next opening. Claude Code's Reasoning effort offers its own setting and
// five levels, and a chosen one reaches `claude` as `--effort`. The real
// `claude` is never reached. How the launch boundary takes a model across
// request kinds is
// ../../dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts;
// the host switch, dismissal and keyboard order of the dialog are
// ../../dashboard/frontend-tests/launches/agent-launch-model.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { storyCardSessions } from "../../dashboard/tests/dashboardPage.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import {
  notRefinedStory,
  readyStory,
  type LaunchJourney,
} from "../../dashboard/tests/launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

const defaultChoice = "Default (your Claude Code setting)";
const choices = [defaultChoice, "Fable", "Opus", "Sonnet"];

// The three launch actions, each opened from the page and answering its
// dialog.
async function actions(page: Page, launchJourney: LaunchJourney) {
  const { card, start, refine, dialog, refinementDialog } =
    await openTakenBacklog(page, launchJourney);
  return {
    card,
    execution: {
      open: () => start(readyStory).click(),
      dialog,
    },
    refinement: {
      open: () => refine(notRefinedStory).click(),
      dialog: refinementDialog,
    },
    session: {
      open: () => startSession(page, "Open Dough").click(),
      dialog: startSessionDialog(page, "Open Dough"),
    },
  };
}

const modelOf = (dialog: Locator) =>
  dialog.getByRole("combobox", { name: "Model" });

const effortOf = (dialog: Locator) =>
  dialog.getByRole("combobox", { name: "Reasoning effort" });

const modelArgs = (argv: readonly string[]) => {
  const at = argv.indexOf("--model");
  return at === -1 ? [] : argv.slice(at, at + 2);
};

test("the refinement dialog offers Model after the instruction on Default, and choosing Opus starts the session with --model opus", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { refinement: action } = await actions(page, launchJourney);

  await action.open();
  const select = modelOf(action.dialog);
  await expect(select).toBeVisible();
  await expect(select.locator("option")).toHaveText(choices);
  await expect(select).toHaveValue("");
  const [field, choice] = await Promise.all([
    action.dialog.getByRole("textbox").boundingBox(),
    select.boundingBox(),
  ]);
  if (!field || !choice) throw new Error("not laid out");
  expect(choice.y).toBeGreaterThanOrEqual(field.y + field.height);

  await select.selectOption({ label: "Opus" });
  await action.dialog.getByRole("button", { name: "Start" }).click();

  await expect(action.dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.argv[1]).toBe("--name");
  expect(call?.argv[2]).toContain("Refinement");
  expect(modelArgs(call?.argv ?? [])).toEqual(["--model", "opus"]);
});

test("the execution dialog offers Claude Code's efforts whatever the model, and Opus with high starts the session with --effort high", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { execution: action } = await actions(page, launchJourney);

  await action.open();
  const effort = effortOf(action.dialog);
  const efforts = [
    "Use your Claude Code setting",
    "low",
    "medium",
    "high",
    "xhigh",
    "max",
  ];
  await expect(effort.locator("option")).toHaveText(efforts);
  await expect(effort).toHaveValue("");
  await modelOf(action.dialog).selectOption({ label: "Opus" });
  await expect(effort.locator("option")).toHaveText(efforts);
  await effort.selectOption({ label: "high" });
  await action.dialog.getByRole("button", { name: "Start" }).click();

  await expect(action.dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const argv = dashboard.claudeLaunchCalls()[0]?.argv ?? [];
  const at = argv.indexOf("--model");
  expect(argv.slice(at, at + 4)).toEqual([
    "--model",
    "opus",
    "--effort",
    "high",
  ]);
});

test("the session dialog left on Default starts the session without --model, at Open Dough's default effort", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { session: action } = await actions(page, launchJourney);

  await action.open();
  await action.dialog.getByRole("button", { name: "Start" }).click();

  await expect(action.dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  expect(dashboard.claudeLaunchCalls()[0]?.argv).not.toContain("--model");
  expect(dashboard.claudeLaunchCalls()[0]?.argv.slice(3, 5)).toEqual([
    "--effort",
    "medium",
  ]);
});

test("Opus launched from a dialog, the same dialog opens again on Default", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { session } = await actions(page, launchJourney);

  await session.open();
  await modelOf(session.dialog).selectOption({ label: "Opus" });
  await session.dialog.getByRole("button", { name: "Start" }).click();
  await expect(session.dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);

  await session.open();
  await expect(modelOf(session.dialog)).toHaveValue("");
  await session.dialog.getByRole("button", { name: "Start" }).click();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(2);
  const [first, second] = dashboard.claudeLaunchCalls();
  expect(modelArgs(first?.argv ?? [])).toEqual(["--model", "opus"]);
  expect(second?.argv).not.toContain("--model");
});

test("a refused launch with Opus says Launch failed beside its action, closes the dialog, and lists no session", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("refused");
  const { card, execution } = await actions(page, launchJourney);

  await execution.open();
  await modelOf(execution.dialog).selectOption({ label: "Opus" });
  await execution.dialog.getByRole("button", { name: "Start" }).click();

  await expect(execution.dialog).toBeHidden();
  await expect(card(readyStory).locator(".launch-problem")).toContainText(
    "Launch failed: Claude Code refused to start a session",
  );
  await expect(card(readyStory).locator(".launch-problem")).toContainText(
    "Opus",
  );
  await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
  expect(dashboard.claudeCalls()).toHaveLength(1);
});
