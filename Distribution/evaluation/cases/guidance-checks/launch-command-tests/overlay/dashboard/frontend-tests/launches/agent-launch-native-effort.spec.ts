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
import {
  launchDialogControls,
  startSession,
} from "../../tests/launchStoryCardPage.ts";
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
  const controls = launchDialogControls(dialog);
  const { model, effort } = controls;
  await controls.chooseHost("codex");
  await controls.chooseModel("native-sol");
  await expect(controls.effortChoices).toHaveText([
    "Use Codex setting",
    "low — Quick",
    "ultra — Deep",
  ]);
  await controls.chooseEffort("ultra");
  await controls.chooseModel("native-luna");
  await expect(effort).toHaveValue("ultra");
  await expect(effort).toHaveAttribute("aria-invalid", "true");
  await controls.showsEffortFeedback("cannot be verified");
  await expect(controls.startButton).toBeDisabled();
  await controls.chooseEffort("low");
  await controls.chooseModel("native-sol");
  await expect(effort).toHaveValue("low");
  await expect(controls.startButton).toBeEnabled();
  await dialog.getByRole("textbox").focus();
  for (const next of [
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    controls.host,
    model,
    effort,
  ]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }
  await controls.chooseEffort("");
  await expect(effort).not.toHaveAttribute("aria-invalid", "true");
  await controls.chooseModel("native-luna");
  await controls.chooseEffort("low");
  await controls.chooseHost("claude");
  await expect(effort).toHaveValue("medium");
  await controls.chooseHost("codex");
  await expect(effort).toHaveValue("");
  await controls.chooseModel("native-sol");
  await controls.chooseEffort("ultra");
  await controls.dismiss("Cancel");
  await open.click();
  await expect(effort).toHaveValue("");
  await expect(model).toHaveValue("");
  await controls.dismiss("Escape");
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
  const controls = launchDialogControls(dialog);
  await controls.chooseHost("codex");
  await expect(controls.effortChoices).toHaveCount(3);
  await expect(dialog).toContainText(
    "Codex resolves its configured reasoning effort in the launch workspace",
  );
  const start = controls.startButton;
  await expect(start).toBeEnabled();
  await expect(start).toBeInViewport();
  await controls.chooseEffort("ultra");
  await expect(dialog).toContainText(
    "will be verified there before initial input",
  );
  await page.setViewportSize(twiceZoomedWindow);
  await expect(start).toBeInViewport();
  await controls.chooseEffort("");
  await expect(start).toBeEnabled();
  await controls.dismiss("Escape");
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
  const controls = launchDialogControls(dialog);
  const { effort } = controls;
  await controls.chooseHost("cursor");
  await controls.chooseModel("fixture-orb");
  await controls.chooseEffort("high");
  await controls.chooseModel("fixture-luna");
  await expect(effort).toHaveValue("high");
  await expect(effort).toHaveAttribute("aria-invalid", "true");
  await expect(controls.startButton).toBeDisabled();
  await expect(dialog).toContainText("cannot be verified");
  await controls.chooseEffort("medium");
  await expect(effort).not.toHaveAttribute("aria-invalid", "true");
  await expect(controls.startButton).toBeEnabled();
});
