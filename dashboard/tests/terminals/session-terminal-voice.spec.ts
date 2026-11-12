import { closeSidePanel, control } from "../sidePanelFrame.ts";
import { test, expect } from "../support/voiceTest.ts";
import { voiceBrowserOptions } from "../support/voiceRecovery.ts";
import { observeMicrophone, seedVoiceKey } from "../support/voicePage.ts";
import {
  expectTerminalInputFocused,
  expectTerminalText,
  focusTerminalInput,
  insertTerminalText,
  pressTerminalKey,
  terminalPromptsControl,
  terminalPromptsMenu,
  terminalScreenParts,
} from "../terminalScreenPage.ts";
import {
  awaitRecordingBytes,
  beginTerminalClip,
  dictateMenuItem,
  expectClipStopped,
  expectVoiceStatus,
  expectVoiceStatusEmpty,
  expectVoiceStatusText,
  openTerminalPrompts,
  openTerminalVoice,
  stopRecordingControl,
  stopTerminalClip,
  unfocusedPromptButtons,
} from "../support/terminalVoicePage.ts";
import {
  noteTerminalTraffic,
  expectFittedInput,
  focusByTouch,
} from "../touchTerminalPage.ts";
import { tapWhereShown, box } from "../pageLayout.ts";

test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("keyboard dictation preserves typed input, offers one safe transcript, then edits and submits only on Enter", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  provider.setText("the header\nthen \u001b[31mthe controls\u0007");
  provider.hold();
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  const input = terminalScreenParts(panel).input;
  await expectVoiceStatusEmpty(panel);
  await insertTerminalText(page, "Review ");
  // The explicit toolbar escape preserves ordinary native Tab and Escape.
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-describedby", /.+/);
  await pressTerminalKey(page, "Tab");
  await expect.poll(() => sent).toContain("\t");
  await pressTerminalKey(page, "Backspace");
  await pressTerminalKey(page, "Alt+F10");
  await expect(
    panel.getByRole("group", { name: "Session actions", exact: true }),
  ).toBeFocused();
  await pressTerminalKey(page, "Tab");
  await expect(terminalPromptsControl(panel)).toBeFocused();
  await pressTerminalKey(page, "Enter");
  const menu = terminalPromptsMenu(panel);
  await expect(
    menu.getByRole("menuitem", { name: "OK", exact: true }),
  ).toBeFocused();
  await pressTerminalKey(page, "End");
  await expect(dictateMenuItem(menu)).toBeFocused();
  await pressTerminalKey(page, "Enter");
  await expect(menu).toHaveCount(0);
  await expect(terminalPromptsControl(panel)).toHaveCount(0);
  await expectVoiceStatus(panel, "Recording…");
  await focusTerminalInput(panel);
  await insertTerminalText(page, "also ");
  await expect(
    panel.getByRole("button", { name: "Close", exact: true }),
  ).toBeEnabled();
  await awaitRecordingBytes(page);
  await pressTerminalKey(page, "Alt+F10");
  await pressTerminalKey(page, "Tab");
  await expect(stopRecordingControl(panel)).toBeFocused();
  await pressTerminalKey(page, "Space");
  await expectVoiceStatusText(panel, "Transcribing…");
  await focusTerminalInput(panel);
  await insertTerminalText(page, "later ");
  await expect.poll(() => provider.calls.length).toBe(1);
  provider.release();
  await expectVoiceStatusEmpty(panel);
  const transcript = "the header then the controls";
  await expect
    .poll(() => sent.filter((value) => value === transcript))
    .toEqual([transcript]);
  await expectTerminalText(panel, transcript);
  await expectTerminalText(panel, "Review");
  await expectTerminalInputFocused(panel);
  expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  await pressTerminalKey(page, "Backspace");
  await insertTerminalText(page, "!");
  await pressTerminalKey(page, "Enter");
  await expect
    .poll(() => dashboard.claudeAttaches()[0]?.lines)
    .toEqual(["Review also later the header then the control!"]);
  expect(provider.calls).toHaveLength(1);
});

test("terminal dictation preserves a transcript beyond the launch field limit without submitting", async ({
  page,
  dashboard,
  provider,
  launchJourney,
}) => {
  seedVoiceKey(dashboard.home);
  const text = `${"spoken ".repeat(600)}end`;
  provider.setText(text);
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect
    .poll(() => sent.filter((value) => value === text))
    .toEqual([text]);
  await expectTerminalText(panel, "end");
  expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  await pressTerminalKey(page, "Enter");
  await expect.poll(() => dashboard.claudeAttaches()[0]?.lines).toEqual([text]);
});

test.describe("phone terminal microphone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test("touch records and stops with compact ordered actions and input room at reduced height", async ({
    page,
    dashboard,
    provider,
    launchJourney,
  }) => {
    await unfocusedPromptButtons(page);
    seedVoiceKey(dashboard.home);
    provider.setText("the session header");
    const { sizes, sent } = noteTerminalTraffic(page);
    const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
    const prompts = terminalPromptsControl(panel);
    const done = panel.getByRole("button", {
      name: "Mark as done",
      exact: true,
    });
    const close = control(panel, "Close");
    expect((await box(prompts)).x).toBeLessThan((await box(done)).x);
    await focusByTouch(panel);
    await insertTerminalText(page, "Review ");
    const menu = await openTerminalPrompts(panel);
    await tapWhereShown(dictateMenuItem(menu));
    await expect(menu).toHaveCount(0);
    await expect(prompts).toHaveCount(0);
    await expectVoiceStatus(panel, "Recording…");
    await awaitRecordingBytes(page);
    await tapWhereShown(stopRecordingControl(panel));
    await expectClipStopped(page, panel);
    await expect
      .poll(() => sent.filter((value) => value === "the session header"))
      .toEqual(["the session header"]);
    await expectTerminalText(panel, "header");
    await expectTerminalInputFocused(panel);
    expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
    await insertTerminalText(page, "X");
    await pressTerminalKey(page, "Backspace");
    await insertTerminalText(page, " please");
    await pressTerminalKey(page, "Enter");
    await expect
      .poll(() => dashboard.claudeAttaches()[0]?.lines)
      .toEqual(["Review the session header please"]);
    await page.setViewportSize({ width: 390, height: 400 });
    await expectFittedInput(panel, sizes);
    for (const control of [prompts, done, close]) {
      await expect(control).toBeInViewport({ ratio: 1 });
      const bounds = await box(control);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await closeSidePanel(panel, { using: "touch" });
    await expect(panel).toHaveCount(0);
  });
});
