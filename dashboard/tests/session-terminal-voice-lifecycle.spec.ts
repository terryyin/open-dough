import { test, expect } from "./support/voiceTest.ts";
import { voiceBrowserOptions } from "./support/voiceRecovery.ts";
import {
  observeMicrophone,
  seedVoiceKey,
  stoppedTracks,
  voiceKey,
  holdMicrophonePermission,
  holdCompletedVoiceResponse,
} from "./support/voicePage.ts";
import {
  beginTerminalClip,
  openTerminalVoice,
  stopTerminalClip,
} from "./support/terminalVoicePage.ts";
import { noteTerminalTraffic } from "./touchTerminalPage.ts";
import { instructionProblems } from "../src/instructionTranscription.ts";

test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("terminal failures announce safe guidance, preserve ordinary typing and require an explicit successful retry", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  const { sent } = noteTerminalTraffic(page);
  const { panel, open } = await openTerminalVoice(
    page,
    dashboard,
    launchJourney,
  );
  const record = panel.getByRole("button", {
    name: "Dictate into terminal",
    exact: true,
  });
  await record.click();
  await expect(panel.getByRole("alert")).toContainText(
    "Configure an OpenAI API key",
  );
  await expect(
    panel.getByRole("button", { name: "Open OpenAI settings" }),
  ).toBeVisible();
  seedVoiceKey(dashboard.home);
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = () =>
      Promise.reject(new DOMException("private", "NotAllowedError"));
  });
  await record.click();
  await expect(panel.getByRole("alert")).toHaveText(
    instructionProblems.permission,
  );
  await page.evaluate(() => {
    Object.defineProperty(window, "MediaRecorder", {
      value: undefined,
      configurable: true,
    });
  });
  await record.click();
  await expect(panel.getByRole("alert")).toHaveText(
    instructionProblems.unavailable,
  );
  // Reload restores the actual recording API after the unsupported/refusal variants.
  await page.reload();
  await open();
  await expect(panel.locator(".xterm-rows")).toContainText("Claude Code");
  provider.setText("\u0003\n\u001b[2J");
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect(panel.getByRole("alert")).toHaveText(instructionProblems.empty);
  provider.reply(500, JSON.stringify({ error: "private-provider-diagnostic" }));
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect(panel.getByRole("alert")).toContainText(
    "Transcription could not finish",
  );
  await expect(record).toBeEnabled();
  await panel.locator(".xterm-helper-textarea").focus();
  await page.keyboard.type("typed ");
  expect(sent).not.toContain("\u0003\n\u001b[2J");
  const calls = provider.calls.length;
  await page.waitForTimeout(150);
  expect(provider.calls).toHaveLength(calls);
  provider.setText("retry");
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect(panel.getByRole("status")).toBeEmpty();
  await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
  await expect(panel.locator(".xterm-rows")).toContainText("typed retry");
  await page.keyboard.press("Enter");
  await expect
    .poll(() => dashboard.claudeAttaches().at(-1)?.lines)
    .toEqual(["typed retry"]);
  expect(await panel.textContent()).not.toContain(voiceKey);
  expect(await panel.textContent()).not.toContain(
    "private-provider-diagnostic",
  );
});

test("Close releases capture and a late permission grant cannot record into a reopened session", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  const { panel, open } = await openTerminalVoice(
    page,
    dashboard,
    launchJourney,
  );
  await beginTerminalClip(page, panel);
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  await open();
  const permission = await holdMicrophonePermission(page);
  await panel.getByRole("button", { name: "Dictate into terminal" }).click();
  await permission.requested();
  await expect(panel.getByRole("status")).toHaveText(
    "Waiting for microphone permission…",
  );
  await expect(
    panel.getByRole("button", { name: "Dictate into terminal" }),
  ).toBeDisabled();
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await open();
  await permission.grant();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  await expect(panel.getByRole("status")).toBeEmpty();
  expect(provider.calls).toHaveLength(0);
  expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
});

test("switching sessions aborts held transcription and a completed late response cannot enter B or reopened A", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  const { sent } = noteTerminalTraffic(page);
  const { panel, open } = await openTerminalVoice(
    page,
    dashboard,
    launchJourney,
  );
  provider.hold();
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect.poll(() => provider.calls.length).toBe(1);
  await expect(panel.getByRole("status")).toHaveText("Transcribing…");
  await open("Voice session B");
  await expect.poll(provider.disconnected).toBe(1);
  provider.release();
  await expect(panel.getByRole("status")).toBeEmpty();
  await open();
  const delivery = await holdCompletedVoiceResponse(page);
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await delivery.ready();
  await open("Voice session B");
  await delivery.release();
  await expect(panel.getByRole("status")).toBeEmpty();
  await open();
  await expect(panel.getByRole("status")).toBeEmpty();
  expect(sent).toEqual([]);
  expect(
    dashboard.claudeAttaches().every((attach) => attach.lines.length === 0),
  ).toBe(true);
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { voiceObservation: { requests: AbortSignal[] } }
      ).voiceObservation.requests.every((request) => request.aborted),
    ),
  ).toBe(true);
});

test("successful Mark as done closes the terminal and cancels its active capture", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  await beginTerminalClip(page, panel);
  await panel
    .locator("header")
    .getByRole("button", { name: "Mark as done", exact: true })
    .click();
  await panel
    .getByRole("group", { name: "Mark it done anyway?" })
    .getByRole("button", { name: "Mark as done", exact: true })
    .click();
  await expect(panel).toHaveCount(0);
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  expect(provider.calls).toHaveLength(0);
});

test("an unavailable attachment retains the full completed transcript and Discard sends nothing", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  const transcript = "retain all these words ".repeat(210).trim();
  provider.setText(transcript);
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  const delivery = await holdCompletedVoiceResponse(page);
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await delivery.ready();
  await dashboard.close();
  await expect(panel.getByRole("status")).toContainText(
    "Disconnected from the session",
  );
  await delivery.release();
  const retained = panel.getByRole("textbox", { name: "Unsent transcript" });
  await expect(retained).toHaveValue(transcript);
  await expect(
    panel.getByRole("button", { name: "Dictate into terminal" }),
  ).toBeDisabled();
  expect(sent).toEqual([]);
  await panel.getByRole("button", { name: "Discard transcript" }).click();
  await expect(retained).toHaveCount(0);
  await expect(
    panel.getByRole("button", { name: "Dictate into terminal" }),
  ).toBeEnabled();
  expect(sent).toEqual([]);
});
