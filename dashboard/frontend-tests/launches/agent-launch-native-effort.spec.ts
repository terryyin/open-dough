// Reasoning effort beside a native host's listed models in Start session's
// dialog, from controlled host choices answers: a Codex model change keeps a
// compatible effort and retains an incompatible one as invalid with linked
// feedback that blocks Start, in keyboard order; a configured model the
// catalog does not list leaves efforts to Codex and keeps Start in view when
// narrow or zoomed; a Cursor model change retains an unsupported effort as
// invalid and blocks Start. Cursor's choices are what the boundary makes of
// the Cursor stand-in's listing (../../server/hosts/cursor/modelIds.ts).
// Launches on these choices are ../../../e2e/launches/agent-launch-codex-effort.spec.ts
// and ../../../e2e/launches/agent-launch-cursor-model-effort.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import {
  installFrontendLaunchBoundary,
  nativeCodexChoices,
} from "../../tests/support/frontendLaunchSubstitutes.ts";
import { startSession } from "../../tests/launchStoryCardPage.ts";
import { twiceZoomedWindow } from "../../tests/accessibleReading.ts";
import {
  cursorEffortModels,
  cursorModels,
  cursorOtherEffortModels,
} from "../../tests/support/fakeCursorModels.ts";
import { projectCursorModels } from "../../server/hosts/cursor/modelIds.ts";

test("model changes preserve compatible effort and retain incompatible selection with linked keyboard feedback", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  boundary.answerChoices("codex", nativeCodexChoices);
  await openFrontendTakenBacklog(page);
  const open = startSession(page, "Open Dough");
  await open.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  const model = dialog.getByLabel("Model", { exact: true });
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await model.selectOption("native-sol");
  await expect(effort.locator("option")).toHaveText([
    "Use Codex setting",
    "low — Quick",
    "ultra — Deep",
  ]);
  await effort.selectOption("ultra");
  await model.selectOption("native-luna");
  await expect(effort).toHaveValue("ultra");
  await expect(effort).toHaveAttribute("aria-invalid", "true");
  const feedback = await effort.getAttribute("aria-describedby");
  if (!feedback) throw new Error("Effort feedback missing");
  await expect(page.locator(`[id="${feedback}"]`)).toContainText(
    "cannot be verified",
  );
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await effort.selectOption("low");
  await model.selectOption("native-sol");
  await expect(effort).toHaveValue("low");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await dialog.getByRole("textbox").focus();
  for (const next of [
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    dialog.getByLabel("Host", { exact: true }),
    model,
    effort,
  ]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }
  await effort.selectOption("");
  await expect(effort).not.toHaveAttribute("aria-invalid", "true");
  await model.selectOption("native-luna");
  await effort.selectOption("low");
  await dialog.getByLabel("Host", { exact: true }).selectOption("claude");
  await expect(effort).toHaveValue("");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await expect(effort).toHaveValue("");
  await model.selectOption("native-sol");
  await effort.selectOption("ultra");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await open.click();
  await expect(effort).toHaveValue("");
  await expect(model).toHaveValue("");
  await page.keyboard.press("Escape");
});

test("unknown configured custom model leaves defaults usable and efforts delegated; narrow and 200% reading retains Start", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  boundary.answerChoices("codex", {
    ...nativeCodexChoices,
    configuredModel: "custom-model",
  });
  await openFrontendTakenBacklog(page);
  await page.setViewportSize({ width: 390, height: 600 });
  await startSession(page, "Open Dough").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await expect(effort.locator("option")).toHaveCount(3);
  await expect(dialog).toContainText(
    "Codex resolves its configured reasoning effort in the launch workspace",
  );
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toBeEnabled();
  await expect(start).toBeInViewport();
  await effort.selectOption("ultra");
  await expect(dialog).toContainText(
    "will be verified there before initial input",
  );
  await page.setViewportSize(twiceZoomedWindow);
  await expect(start).toBeInViewport();
  await effort.selectOption("");
  await expect(start).toBeEnabled();
  await page.keyboard.press("Escape");
});

test("switching Cursor model retains unsupported effort as invalid and blocks Start", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  boundary.answerChoices("cursor", {
    models: projectCursorModels([
      ...cursorModels,
      ...cursorEffortModels,
      ...cursorOtherEffortModels,
    ]),
  });
  await openFrontendTakenBacklog(page);
  await startSession(page, "Open Dough").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  const models = dialog.getByRole("combobox", { name: "Model" });
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await models.selectOption("fixture-orb");
  await effort.selectOption("high");
  await models.selectOption("fixture-luna");
  await expect(effort).toHaveValue("high");
  await expect(effort).toHaveAttribute("aria-invalid", "true");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(dialog).toContainText("cannot be verified");
  await effort.selectOption("medium");
  await expect(effort).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
});
