import { chmodSync } from "node:fs";
import path from "node:path";
import { test, expect } from "./support/voiceTest.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { startSessionField } from "./launchCardPage.ts";
import {
  observeMicrophone,
  recordClip,
  voiceKey,
} from "./support/voicePage.ts";
import {
  openVoiceDraft,
  recovered,
  typedStart,
  voiceBrowserOptions,
  originalDraft,
} from "./support/voiceRecovery.ts";
import {
  instructionProblems,
  instructionSetupRequired,
} from "../src/instructionTranscription.ts";
import {
  openAISaveEndpoint,
  openAIRemoveEndpoint,
} from "../src/openAIConfiguration.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use({
  ...voiceBrowserOptions,
  extraEnv: async ({ provider }, use) => {
    await use({
      ...provider.extraEnv,
      OPENAI_API_KEY: "synthetic-environment-key-must-not-be-used",
    });
  },
});
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("missing saved key never consumes an environment key and permits typed Start", async ({
  page,
  dashboard,
  provider,
}) => {
  const dialog = await openVoiceDraft(page, journey, false);
  await dialog.getByRole("button", { name: "Record", exact: true }).click();
  await recovered(
    page,
    dashboard,
    provider,
    dialog,
    instructionSetupRequired,
    0,
    false,
  );
  await expect(
    dialog.getByRole("button", { name: "Open OpenAI settings" }),
  ).toBeVisible();
  await typedStart(dashboard, dialog);
  expect(provider.calls).toHaveLength(0);
});

test("the same running server consumes a replacement afresh, and removal during capture makes no later provider call despite an environment key", async ({
  page,
  dashboard,
  provider,
}) => {
  const dialog = await openVoiceDraft(page, journey);
  await recordClip(page, dialog);
  await expect(startSessionField(dialog)).toHaveValue(
    `${originalDraft}\n\nDo not implement yet`,
  );
  expect(provider.calls[0]?.authorization).toBe(`Bearer ${voiceKey}`);
  const replacement = "synthetic-replacement-voice-key";
  const saved = await page.request.post(
    new URL(openAISaveEndpoint, dashboard.baseURL).href,
    {
      headers: { Origin: dashboard.origin },
      data: { apiKey: replacement },
    },
  );
  expect(saved.status()).toBe(200);
  await startSessionField(dialog).fill(originalDraft);
  provider.setText("Replacement operation only");
  await recordClip(page, dialog);
  await expect(startSessionField(dialog)).toHaveValue(
    `${originalDraft}\n\nReplacement operation only`,
  );
  expect(provider.calls.map((call) => call.authorization)).toEqual([
    `Bearer ${voiceKey}`,
    `Bearer ${replacement}`,
  ]);
  await startSessionField(dialog).fill(originalDraft);
  await recordClip(page, dialog, async () => {
    const removed = await page.request.post(
      new URL(openAIRemoveEndpoint, dashboard.baseURL).href,
      {
        headers: { Origin: dashboard.origin },
        data: {},
      },
    );
    expect(removed.status()).toBe(200);
  });
  await recovered(
    page,
    dashboard,
    provider,
    dialog,
    instructionSetupRequired,
    2,
  );
  expect(await dialog.textContent()).not.toContain(replacement);
  expect(dashboard.output()).not.toContain(replacement);
  expect(dashboard.output()).not.toContain(
    "synthetic-environment-key-must-not-be-used",
  );
  await typedStart(dashboard, dialog);
  expect(provider.calls).toHaveLength(2);
});

test("unreadable saved key before or during capture preserves the draft and supports one explicit retry", async ({
  page,
  dashboard,
  provider,
}) => {
  const dialog = await openVoiceDraft(page, journey);
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/credentials/openai.json",
  );
  chmodSync(file, 0o000);
  try {
    await dialog.getByRole("button", { name: "Record", exact: true }).click();
    await recovered(
      page,
      dashboard,
      provider,
      dialog,
      instructionProblems.configuration,
      0,
      false,
    );
  } finally {
    chmodSync(file, 0o600);
  }
  try {
    await recordClip(page, dialog, () => {
      chmodSync(file, 0o000);
    });
    await recovered(
      page,
      dashboard,
      provider,
      dialog,
      instructionProblems.configuration,
      0,
    );
  } finally {
    chmodSync(file, 0o600);
  }
  provider.setText("Readable retry only");
  await recordClip(page, dialog);
  await expect(startSessionField(dialog)).toHaveValue(
    `${originalDraft}\n\nReadable retry only`,
  );
  expect(provider.calls).toHaveLength(1);
  expect(provider.calls[0]?.authorization).toBe(`Bearer ${voiceKey}`);
  await typedStart(dashboard, dialog);
  expect(provider.calls).toHaveLength(1);
});
