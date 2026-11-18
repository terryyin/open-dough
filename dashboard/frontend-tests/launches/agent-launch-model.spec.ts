// Model and Reasoning effort in the launch dialogs, against controlled
// answers: Claude Code's effort opens on Open Dough's default, medium, and
// names the relative cost of higher levels before Start, which asks for the
// shown level; switching the host returns the effort to the new host's own
// default; a model and effort chosen then dismissed ask for nothing and every
// dialog kind opens again on Default and medium; and the refinement dialog's
// keyboard order follows its reading order when no options are offered. A
// chosen model and effort reaching the session is
// ../../../e2e/launches/agent-launch-model.spec.ts.

import type { Locator, Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import {
  backlogLaunchers,
  startSession,
  startSessionDialog,
} from "../../test-support/launchStoryCardPage.ts";
import {
  notRefinedStory,
  readyStory,
} from "../../test-support/launchJourney.ts";

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

const modelOf = (dialog: Locator) =>
  dialog.getByRole("combobox", { name: "Model" });

const effortOf = (dialog: Locator) =>
  dialog.getByRole("combobox", { name: "Reasoning effort" });

test("Claude Code's effort opens on medium as Open Dough's default and names the cost of high, xhigh and max; Start asks for the shown level", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const { execution: action } = actions(page);

  await action.open();
  const effort = effortOf(action.dialog);
  await expect(effort.locator("option")).toHaveText([
    "low",
    "medium (Open Dough default)",
    "high (about 3× the cost of medium)",
    "xhigh (about 3× the cost of medium)",
    "max (about 7× the cost of medium)",
  ]);
  await expect(effort).toHaveValue("medium");
  await expect(effort).toHaveAccessibleDescription(
    "medium (Open Dough default) applies to this session only.",
  );
  await action.dialog.getByRole("button", { name: "Start" }).click();
  await expect(action.dialog).toBeHidden();

  await action.open();
  await effort.selectOption("max");
  await expect(effort).toHaveAccessibleDescription(
    "max (about 7× the cost of medium) applies to this session only.",
  );
  await effort.selectOption("low");
  await expect(effort).toHaveAccessibleDescription(
    "low applies to this session only.",
  );
  await effort.selectOption("max");
  await action.dialog.getByRole("button", { name: "Start" }).click();
  await expect(action.dialog).toBeHidden();

  expect(boundary.acceptances.map((request) => request.effort)).toEqual([
    "medium",
    "max",
  ]);
});

test("low chosen for Claude Code, switching the host to Codex returns the effort to Use Codex setting, and back to Claude Code shows medium", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const { session: action } = actions(page);

  await action.open();
  await effortOf(action.dialog).selectOption({ label: "low" });
  await action.dialog
    .getByRole("combobox", { name: "Host" })
    .selectOption({ label: "Codex" });

  // The dialog names its host.
  const codexDialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Codex",
  });
  await expect(effortOf(codexDialog)).toHaveValue("");
  await expect(effortOf(codexDialog).locator("option:checked")).toHaveText(
    "Use Codex setting",
  );

  await codexDialog
    .getByRole("combobox", { name: "Host" })
    .selectOption({ label: "Claude Code" });
  await expect(effortOf(action.dialog)).toHaveValue("medium");
});

for (const dismiss of ["Cancel", "Escape"] as const) {
  test(`Fable and max chosen then ${dismiss} starts nothing, and every dialog opens again on Default and medium`, async ({
    page,
  }) => {
    const boundary = await installFrontendLaunchBoundary(page);
    await openFrontendTakenBacklog(page);
    const { execution, refinement, session } = actions(page);
    const all = [execution, refinement, session];

    for (const action of all) {
      await action.open();
      await expect(effortOf(action.dialog)).toHaveValue("medium");
      await modelOf(action.dialog).selectOption({ label: "Fable" });
      await effortOf(action.dialog).selectOption("max");
      if (dismiss === "Cancel") {
        await action.dialog.getByRole("button", { name: "Cancel" }).click();
      } else {
        await page.keyboard.press("Escape");
      }
      await expect(action.dialog).toBeHidden();
    }
    for (const action of all) {
      await action.open();
      await expect(modelOf(action.dialog)).toHaveValue("");
      await expect(effortOf(action.dialog)).toHaveValue("medium");
      await page.keyboard.press("Escape");
      await expect(action.dialog).toBeHidden();
    }

    expect(boundary.acceptances).toEqual([]);
  });
}

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
    dialog.getByRole("combobox", { name: "Host" }),
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
