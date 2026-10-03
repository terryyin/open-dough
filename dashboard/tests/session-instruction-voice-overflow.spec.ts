import { test, expect } from "./support/voiceTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchCardPage.ts";
import {
  notRefinedStory,
  notRefinedIdentity,
  publishLaunchJourney,
  type LaunchJourney,
} from "./launchJourney.ts";
import {
  observeMicrophone,
  recordClip,
  saveVoiceKey,
} from "./support/voicePage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use({
  projectFolders: ["open-dough"],
  permissions: ["microphone"],
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  },
});
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

const original = "Keep this work local";

test("exactly 4,000 combined characters, including the separator, append ordinarily and reach the story launch unchanged", async ({
  page,
  dashboard,
  provider,
}) => {
  const { start, dialog } = await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  dashboard.claudeScenario("launched");
  await start(notRefinedStory).click();
  const field = dialog.getByRole("textbox", { name: "Instruction (optional)" });
  await field.fill(original);
  const transcript = "x".repeat(4_000 - original.length - 2);
  provider.setText(transcript);
  await recordClip(page, dialog);
  const combined = `${original}\n\n${transcript}`;
  await expect(field).toHaveValue(combined);
  await expect(field).toBeEditable();
  await expect(
    dialog.getByRole("textbox", { name: "Transcript to shorten" }),
  ).toHaveCount(0);
  expect(provider.calls).toHaveLength(1);
  expect(dashboard.claudeCalls()).toEqual([]);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => dashboard.claudeLaunchCalls().map((call) => call.argv.at(-1)))
    .toEqual([`/dough-execute-plan ${notRefinedIdentity}\n\n${combined}`]);
});

test("one character over retains both drafts; keyboard shortening adds once and edited final text reaches the native session", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  dashboard.claudeScenario("launched");
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  const field = startSessionField(dialog);
  await field.fill(original);
  const transcript = "x".repeat(4_001 - original.length - 2);
  provider.setText(transcript);
  await recordClip(page, dialog);
  const candidate = dialog.getByRole("textbox", {
    name: "Transcript to shorten",
  });
  await expect(candidate).toHaveValue(transcript);
  await expect(candidate).toBeFocused();
  await expect(field).toHaveValue(original);
  await expect(field).toHaveAttribute("readonly", "");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "Record", exact: true }),
  ).toBeDisabled();
  const add = dialog.getByRole("button", {
    name: "Add transcript",
    exact: true,
  });
  await expect(add).toBeDisabled();
  expect(provider.calls).toHaveLength(1);
  expect(dashboard.claudeCalls()).toEqual([]);
  await candidate.fill(" \n ");
  await expect(add).toBeDisabled();
  await expect(
    dialog.getByText(
      "Enter transcript text to add, or discard this transcript.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(field).toHaveValue(original);
  // The net shortening is one character: the explicit review path exercises
  // the same 4,000/separator rule and preserves the edited outer whitespace.
  const shortened = ` ${transcript.slice(0, -3)} `;
  await candidate.fill(shortened);
  await expect(add).toBeEnabled();
  await page.keyboard.press("Tab");
  await expect(add).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue(`${original}\n\n${shortened}`);
  await expect(field).toBeFocused();
  await expect(field).toBeEditable();
  await expect(candidate).toHaveCount(0);
  await expect(add).toHaveCount(0);
  expect(provider.calls).toHaveLength(1);
  const edited = `${original}\n\nReview the launch dialog before implementing`;
  await field.fill(edited);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => dashboard.claudeLaunchCalls().map((call) => call.argv.at(-1)))
    .toEqual([edited]);
});

test("the complete transcript beyond 4,000 remains editable; keyboard discard and launch dismissal clear only transient review", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  const action = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  const field = startSessionField(dialog);
  const candidate = dialog.getByRole("textbox", {
    name: "Transcript to shorten",
  });
  const transcript = `Transcript beginning\n${"x".repeat(4_100)}\nTranscript end`;
  provider.setText(transcript);
  await action.click();
  await field.fill(original);
  await recordClip(page, dialog);
  await expect(candidate).toHaveValue(transcript);
  await expect(candidate).toBeEditable();
  await expect(candidate).toBeFocused();
  await expect(field).toHaveValue(original);
  await page.keyboard.press("Tab");
  const discard = dialog.getByRole("button", {
    name: "Discard transcript",
    exact: true,
  });
  await expect(discard).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(candidate).toHaveCount(0);
  await expect(field).toHaveValue(original);
  await expect(field).toBeFocused();
  await expect(field).toBeEditable();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  provider.setText("Do not implement yet");
  await recordClip(page, dialog);
  await expect(field).toHaveValue(`${original}\n\nDo not implement yet`);
  expect(provider.calls).toHaveLength(2);
  for (const dismiss of ["Cancel", "Escape"]) {
    await field.fill(original);
    provider.setText(transcript);
    await recordClip(page, dialog);
    await expect(candidate).toHaveValue(transcript);
    await expect(field).toHaveValue(original);
    if (dismiss === "Cancel") {
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(dialog).toBeHidden();
    await action.click();
    await expect(field).toHaveValue("");
    await expect(candidate).toHaveCount(0);
    await expect(field).toBeEditable();
    await expect(
      dialog.getByRole("button", { name: "Record", exact: true }),
    ).toBeEnabled();
  }
  expect(provider.calls).toHaveLength(4);
  expect(dashboard.claudeCalls()).toEqual([]);
});
