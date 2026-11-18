// Codex model choices in Start session's dialog, read from controlled host
// choices answers: a slow read keeps Start usable and the keyboard where it
// was, an unreadable one offers Retry, host changes and fresh openings reset
// the choice, and Cancel asks for nothing; a late answer cannot replace
// another host's or another project's current choices. Discovering the
// catalog from Codex and launching on it is
// ../../../e2e/launches/agent-launch-codex-model.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import {
  installFrontendLaunchBoundary,
  nativeCodexChoices,
} from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { doughnutSource } from "../../test-support/support/frontendServiceState.ts";
import { chooseProject } from "../../test-support/dashboardPage.ts";
import { startSession } from "../../test-support/launchStoryCardPage.ts";
import { givePageItsTurns } from "../../test-support/pageRequestNotes.ts";

test("slow/unavailable discovery retains focus, retry works, host changes and fresh openings reset; cancel creates nothing", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  boundary.answerChoices("codex", nativeCodexChoices);
  await openFrontendTakenBacklog(page);
  const open = startSession(page, "Open Dough");
  await open.click();
  const dialog = page.getByRole("dialog");
  const held = boundary.holdNextChoices();
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog.getByRole("textbox").focus();
  await expect(dialog).toContainText("Reading Codex model choices");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  boundary.answerChoices("codex", "unreadable");
  held.release();
  await expect(
    dialog.getByRole("button", { name: "Retry model choices" }),
  ).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await expect(
    dialog.getByLabel("Reasoning effort", { exact: true }),
  ).toHaveValue("");
  await expect(dialog.getByLabel("Host", { exact: true })).toHaveValue("codex");
  boundary.answerChoices("codex", nativeCodexChoices);
  await dialog.getByRole("button", { name: "Retry model choices" }).click();
  await expect(
    dialog.getByLabel("Model", { exact: true }).locator("option"),
  ).toHaveCount(3);
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  await dialog.getByLabel("Host", { exact: true }).selectOption("claude");
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await open.click();
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await page.keyboard.press("Escape");
  expect(boundary.acceptances).toEqual([]);
});

test("a late catalog reply cannot replace another host's current options", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  boundary.answerChoices("codex", nativeCodexChoices);
  await openFrontendTakenBacklog(page);
  await startSession(page, "Open Dough").click();
  const dialog = page.getByRole("dialog");
  const held = boundary.holdNextChoices();
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await expect
    .poll(() => boundary.choicesAsked())
    .toEqual([{ source: "open-dough", host: "codex" }]);
  await dialog.getByLabel("Host", { exact: true }).selectOption("claude");
  held.release();
  await expect(
    dialog.getByLabel("Model", { exact: true }).locator("option"),
  ).toHaveText([
    "Default (your Claude Code setting)",
    "Fable",
    "Opus",
    "Sonnet",
  ]);
  await page.keyboard.press("Escape");
});

test.describe("project catalog isolation", () => {
  test("a late reply from the previous project cannot replace the current project's choices", async ({
    page,
    frontendServices,
  }) => {
    frontendServices.projects.push(doughnutSource);
    const boundary = await installFrontendLaunchBoundary(page);
    boundary.answerChoices(
      "codex",
      { models: nativeCodexChoices.models.slice(0, 1) },
      "open-dough",
    );
    boundary.answerChoices(
      "codex",
      {
        models: [
          {
            model: "project-luna",
            name: "Project Luna",
            description: "Current catalog",
            efforts: [],
          },
        ],
      },
      "doughnut",
    );
    await openFrontendTakenBacklog(page);
    await startSession(page, "Open Dough").click();
    const dialog = page.getByRole("dialog");
    const held = boundary.holdNextChoices();
    await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
    await expect
      .poll(() => boundary.choicesAsked())
      .toEqual([{ source: "open-dough", host: "codex" }]);
    await page.keyboard.press("Escape");
    await chooseProject(page, "Doughnut");
    await startSession(page, "Doughnut").click();
    await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
    const choices = dialog
      .getByLabel("Model", { exact: true })
      .locator("option");
    await expect(choices).toHaveText(["Use Codex setting", "Project Luna"]);
    held.release();
    // The previous project's reply is answered and the page has read it.
    await held.delivered;
    await givePageItsTurns(page);
    await expect(choices).toHaveText(["Use Codex setting", "Project Luna"]);
    await page.keyboard.press("Escape");
  });
});
