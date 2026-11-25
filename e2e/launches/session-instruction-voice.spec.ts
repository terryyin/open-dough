import { readdirSync } from "node:fs";
import path from "node:path";
import { mergeTests } from "@playwright/test";
import {
  test as voiceTest,
  expect,
} from "../../dashboard/test-support/support/voiceTest.ts";
import { test as startOriginTest } from "../../dashboard/test-support/support/startOriginTest.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import { reloadUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import { inIncidentRecord } from "../../dashboard/test-support/support/machineRecordNames.ts";
import { voiceBrowserOptions } from "../../dashboard/test-support/support/voiceRecovery.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  openStartSession,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  readyStory,
  readyIdentity,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  observeMicrophone,
  recordClip,
  saveVoiceKey,
  seedVoiceKey,
  voiceKey,
} from "../../dashboard/test-support/support/voicePage.ts";
import {
  apiKey,
  save,
  status,
} from "../../dashboard/test-support/support/openAISettingsPage.ts";
import { back } from "../../dashboard/test-support/support/systemSettingsPage.ts";
import {
  expectClaudeAdHocDraft,
  expectInstalledClaudeStory,
  readClaudeLaunch,
} from "./claudeLaunchObservation.ts";

const test = mergeTests(voiceTest, startOriginTest);
test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("saved settings survive restart; two real clips append once and the reviewed story instruction reaches native argv only after Start", async ({
  page,
  dashboard,
  provider,
  origin,
}) => {
  const board = await openInstalledStoryBoard(page, origin);
  await saveVoiceKey(page);
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    port,
    projectFolders: ["open-dough"],
    extraEnv: provider.extraEnv,
  });
  try {
    restarted.claudeScenario("launched");
    await reloadUntilRead(page);
    const {
      dialog,
      instruction: field,
      submit,
    } = await board.open(readyStory, "Execution");
    await field.fill("Keep this work local");
    // Recording writes nothing; the incident record any read may append to
    // is not a file recording would write.
    const homeFiles = () =>
      readdirSync(restarted.home, { recursive: true, encoding: "utf8" })
        .filter((name) => !inIncidentRecord(name))
        .sort();
    const before = await originMain(origin);
    const filesBeforeRecording = homeFiles();
    await recordClip(page, dialog);
    await expect(field).toHaveValue(
      "Keep this work local\n\nDo not implement yet",
    );
    provider.setText("Inspect Open Dough first");
    await recordClip(page, dialog);
    await expect(field).toHaveValue(
      "Keep this work local\n\nDo not implement yet\n\nInspect Open Dough first",
    );
    expect(restarted.claudeCalls()).toEqual([]);
    expect(homeFiles()).toEqual(filesBeforeRecording);
    expect(await originMain(origin)).toBe(before);
    expect(
      restarted
        .ghCalls()
        .some((call) => call.includes("POST") || call.includes("PATCH")),
    ).toBe(false);
    expect(provider.calls).toHaveLength(2);
    for (const call of provider.calls) {
      expect(call.authorization).toBe(`Bearer ${voiceKey}`);
      expect(call.model).toBe("gpt-transcribe");
      expect(call.type).toBe("audio/webm");
      expect(call.filename).toBe("instruction.webm");
      expect(call.bytes).toBeGreaterThan(0);
    }
    const edited =
      "Keep this work local\n\nReview the launch dialog before implementing";
    await field.fill(edited);
    const accepted = nextAcceptedAttemptId(page);
    await submit();
    const outcome = await settledOutcome(restarted, await accepted);
    const launch = readClaudeLaunch(restarted, outcome, 0);
    await expect(dialog).toBeHidden();
    expect(launch.started.name).toBe(`Open Dough · Execution · ${readyStory}`);
    const publishedSha = await originMain(origin);
    expect(publishedSha).not.toBe(before);
    expectInstalledClaudeStory(restarted, launch, {
      invocation: `/dough-execute-plan ${readyIdentity}`,
      handoff: "Established start:",
      workspace: path.join(origin.project, ".worktrees", "story-b"),
      publishedSha,
      instruction: edited,
    });
  } finally {
    await restarted.close();
  }
});

test("missing-key settings trip retains the launch draft and retry feeds the final unattached instruction", async ({
  page,
  dashboard,
  provider,
  origin,
}) => {
  await openInstalledStoryBoard(page, origin);
  dashboard.claudeScenario("launched");
  const { dialog, submit } = await openStartSession(page, "Open Dough");
  const field = startSessionField(dialog);
  await field.fill("Keep my draft");
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Configure an OpenAI API key",
  );
  expect(provider.calls).toHaveLength(0);
  await expect(field).toBeEditable();
  await dialog.getByRole("button", { name: "Open OpenAI settings" }).click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await apiKey(page).fill(voiceKey);
  await save(page).click();
  await expect(status(page)).toHaveText("API key: Configured");
  await back(page).click();
  await expect(dialog).toBeVisible();
  await expect(field).toHaveValue("Keep my draft");
  await expect(field).toBeFocused();
  await recordClip(page, dialog);
  await expect(field).toHaveValue("Keep my draft\n\nDo not implement yet");
  expect(dashboard.claudeCalls()).toEqual([]);
  const edited = "Keep my draft\n\nReview this first";
  await field.fill(edited);
  const accepted = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await accepted);
  expectClaudeAdHocDraft(
    dashboard,
    outcome,
    edited,
    "Open Dough · Ad hoc · Keep my draft Review this first",
  );
});

test("a transcript bringing the instruction to exactly 4,000 characters, separator included, reaches the story session unchanged", async ({
  page,
  dashboard,
  provider,
  origin,
}) => {
  const board = await openInstalledStoryBoard(page, origin);
  seedVoiceKey(dashboard.home);
  dashboard.claudeScenario("launched");
  const {
    dialog,
    instruction: field,
    submit,
  } = await board.open(readyStory, "Execution");
  const typed = "Keep this work local";
  await field.fill(typed);
  const transcript = "x".repeat(4_000 - typed.length - 2);
  provider.setText(transcript);
  await recordClip(page, dialog);
  const combined = `${typed}\n\n${transcript}`;
  await expect(field).toHaveValue(combined);
  const accepted = nextAcceptedAttemptId(page);
  await submit();
  const outcome = await settledOutcome(dashboard, await accepted);
  expectInstalledClaudeStory(
    dashboard,
    readClaudeLaunch(dashboard, outcome, 0),
    {
      invocation: `/dough-execute-plan ${readyIdentity}`,
      handoff: "Established start:",
      workspace: path.join(origin.project, ".worktrees", "story-b"),
      publishedSha: await originMain(origin),
      instruction: combined,
    },
  );
  expect(provider.calls).toHaveLength(1);
});
