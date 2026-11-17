// Model and Reasoning effort in the launch dialogs, against controlled
// answers: switching the host returns a Claude Code effort to the new host's
// own setting, Claude Code opens on medium with measured cost words,
// a dismissed choice asks for nothing and every dialog resets its settings, and the refinement dialog's keyboard
// order follows its reading order when no options are offered. A chosen
// model reaching the session is ../../../e2e/launches/agent-launch-model.spec.ts.

import type { Locator, Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import {
  backlogLaunchers,
  launchDialogControls,
  startSession,
  startSessionDialog,
} from "../../tests/launchStoryCardPage.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";

// The three launch actions, each opened from the page and answering its
// dialog.
function actions(page: Page) {
  const { start, dialog, refine, refinementDialog } = backlogLaunchers(page);
  return {
    execution: { open: () => start(readyStory).click(), dialog },
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

const modelOf = (dialog: Locator) => launchDialogControls(dialog).model;
const effortOf = (dialog: Locator) => launchDialogControls(dialog).effort;

test("low chosen for Claude Code, switching the host to Codex returns the effort to Use Codex setting", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const { session: action } = actions(page);

  await action.open();
  const controls = launchDialogControls(action.dialog);
  await controls.chooseEffort("low");
  await controls.chooseHost("codex");

  // The dialog names its host.
  const codexDialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Codex",
  });
  await expect(effortOf(codexDialog)).toHaveValue("");
  await expect(effortOf(codexDialog).locator("option:checked")).toHaveText(
    "Use Codex setting",
  );
  await launchDialogControls(codexDialog).chooseHost("claude");
  await expect(controls.effort).toHaveValue("medium");
});

for (const dismiss of ["Cancel", "Escape"] as const) {
  test(`Fable and max chosen then ${dismiss} starts nothing, and every dialog opens again on Default model and medium effort`, async ({
    page,
  }) => {
    const boundary = await installFrontendLaunchBoundary(page);
    await openFrontendTakenBacklog(page);
    const { execution, refinement, session } = actions(page);
    const all = [execution, refinement, session];

    for (const action of all) {
      await action.open();
      const controls = launchDialogControls(action.dialog);
      await expect(controls.effort).toHaveValue("medium");
      await controls.chooseModel("fable");
      await controls.chooseEffort("max");
      await controls.dismiss(dismiss);
    }
    for (const action of all) {
      await action.open();
      const controls = launchDialogControls(action.dialog);
      await expect(controls.model).toHaveValue("");
      await expect(controls.effort).toHaveValue("medium");
      await controls.dismiss("Escape");
    }

    expect(boundary.acceptances).toEqual([]);
  });
}

test("Opus execution opens on medium with cost words and an untouched Start sends medium", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const { execution } = actions(page);
  await execution.open();
  const controls = launchDialogControls(execution.dialog);
  await expect(controls.effort).toHaveValue("medium");
  await expect(controls.effortChoices).toHaveText([
    "low",
    "medium (Open Dough default)",
    "high (about 3× medium’s cost)",
    "xhigh (about 3× medium’s cost)",
    "max (about 7× medium’s cost)",
  ]);
  await controls.chooseModel("opus");
  await expect(controls.effort).toHaveValue("medium");
  await controls.showsEffortFeedback("medium (Open Dough default)");
  await controls.showsEffortFeedback(
    "Approximate costs measured on Opus slice agents across different stories.",
  );
  await controls.start();
  await expect.poll(() => boundary.acceptances).toHaveLength(1);
  expect(boundary.acceptances[0]).toMatchObject({
    host: "claude",
    model: "opus",
    effort: "medium",
  });
});

test("choosing max names its measured cost before Start sends max", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const { execution } = actions(page);
  await execution.open();
  const controls = launchDialogControls(execution.dialog);
  await controls.chooseModel("opus");
  await controls.chooseEffort("max");
  await expect(controls.effort).toHaveValue("max");
  await controls.showsEffortFeedback("max (about 7× medium’s cost)");
  await controls.showsEffortFeedback(
    "Approximate costs measured on Opus slice agents across different stories.",
  );
  await controls.start();
  await expect.poll(() => boundary.acceptances).toHaveLength(1);
  expect(boundary.acceptances[0]).toMatchObject({
    host: "claude",
    model: "opus",
    effort: "max",
  });
});

test("the dialog opens in the instruction field, and Tab reaches Record, Attach images, Host, Model, Reasoning effort, the session's tracking, Command details, Cancel, then Start", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const { refinement } = actions(page);

  await refinement.open();
  const { dialog } = refinement;
  await expect(
    dialog.getByRole("textbox", { name: "Instruction (optional)" }),
  ).toBeFocused();
  for (const next of [
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    launchDialogControls(dialog).host,
    modelOf(dialog),
    effortOf(dialog),
    dialog.getByRole("radio", { name: "Standard" }),
    dialog.locator("summary", { hasText: "Command details" }),
    dialog.getByRole("button", { name: "Cancel" }),
    dialog.getByRole("button", { name: "Start" }),
  ]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }
  expect(boundary.acceptances).toEqual([]);
});
