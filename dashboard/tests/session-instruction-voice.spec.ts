import { readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { test, expect } from "./support/voiceTest.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
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
  voiceKey,
} from "./support/voicePage.ts";
import { apiKey, save, status } from "./support/openAISettingsPage.ts";
import { back } from "./support/systemSettingsPage.ts";

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

test("saved settings survive restart; two real clips append once and the reviewed story instruction reaches native argv only after Start", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  await saveVoiceKey(page);
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: provider.machine,
    github: dashboard.github,
    port,
    projectFolders: ["open-dough"],
    extraEnv: provider.extraEnv,
  });
  try {
    restarted.claudeScenario("launched");
    const { start, dialog } = await openTakenBacklog(page, journey);
    await start(notRefinedStory).click();
    const field = dialog.getByRole("textbox", {
      name: "Instruction (optional)",
    });
    await field.fill("Keep this work local");
    const filesBeforeRecording = readdirSync(restarted.home, {
      recursive: true,
    }).sort();
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
    expect(readdirSync(restarted.home, { recursive: true }).sort()).toEqual(
      filesBeforeRecording,
    );
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
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect
      .poll(() => restarted.claudeLaunchCalls())
      .toEqual([
        {
          argv: [
            "--bg",
            "--name",
            `Open Dough · Execution · ${notRefinedStory}`,
            `/dough-execute-plan ${notRefinedIdentity}\n\n${edited}`,
          ],
          cwd: realpathSync(path.join(restarted.home, "git", "open-dough")),
        },
      ]);
  } finally {
    await restarted.close();
  }
});

test("missing-key settings trip retains the launch draft and retry feeds the final unattached instruction", async ({
  page,
  dashboard,
  provider,
}) => {
  await openTakenBacklog(page, journey);
  dashboard.claudeScenario("launched");
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
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
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => dashboard.claudeLaunchCalls())
    .toEqual([
      {
        argv: [
          "--bg",
          "--name",
          "Open Dough · Ad hoc · Keep my draft Review this first",
          edited,
        ],
        cwd: realpathSync(path.join(dashboard.home, "git", "open-dough")),
      },
    ]);
});
