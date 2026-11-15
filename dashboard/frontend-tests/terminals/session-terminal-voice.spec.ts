// Terminal dictation against controlled transcription answers and an
// attached-terminal substitute: preserves typed input, offers one safe
// transcript, and phone compact actions keep input room. Provider failures,
// session switch abort and Mark-as-done capture cancel stay with
// ../../../e2e/terminals/session-terminal-voice-lifecycle.spec.ts; retained
// transcript through reconnect with
// ../../../e2e/terminals/session-terminal-voice-recovery.spec.ts.

import { closeSidePanel, control } from "../../tests/sidePanelFrame.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../tests/support/frontendTerminalVoice.ts";
import { microphoneBrowserOptions } from "../../tests/support/voiceRecovery.ts";
import {
  expectTerminalInputFocused,
  expectTerminalText,
  focusTerminalInput,
  insertTerminalText,
  pressTerminalKey,
  terminalPromptsControl,
  terminalPromptsMenu,
  terminalScreenParts,
} from "../../tests/terminalScreenPage.ts";
import { observeMicrophone } from "../../tests/support/voicePage.ts";
import {
  awaitRecordingBytes,
  beginTerminalClip,
  dictateMenuItem,
  expectClipStopped,
  expectVoiceStatus,
  expectVoiceStatusEmpty,
  expectVoiceStatusText,
  openTerminalPrompts,
  stopRecordingControl,
  stopTerminalClip,
  unfocusedPromptButtons,
} from "../../tests/support/terminalVoicePage.ts";
import { focusByTouch } from "../../tests/touchTerminalPage.ts";
import { tapWhereShown, box } from "../../tests/pageLayout.ts";
import type { FrontendTranscription } from "../../tests/support/frontendTranscriptionSubstitutes.ts";

function requireTranscription(
  transcription: FrontendTranscription | undefined,
): FrontendTranscription {
  if (transcription === undefined) {
    throw new Error("expected frontend transcription answers");
  }
  return transcription;
}

test.use(microphoneBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("keyboard dictation preserves typed input, offers one safe transcript, then edits and submits only on Enter", async ({
  page,
  frontendServices,
}) => {
  const opened = await openFrontendTerminalVoice(page, frontendServices);
  const transcription = requireTranscription(opened.transcription);
  const { panel, sent } = opened;
  transcription.answerText("the header\nthen \u001b[31mthe controls\u0007");
  const held = transcription.holdNext();
  const input = terminalScreenParts(panel).input;
  await expectVoiceStatusEmpty(panel);
  await insertTerminalText(page, "Review ");
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
  await held.received;
  held.release();
  await held.delivered;
  await expectVoiceStatusEmpty(panel);
  const transcript = "the header then the controls";
  await expect
    .poll(() => sent.filter((value) => value === transcript))
    .toEqual([transcript]);
  await expectTerminalText(panel, transcript);
  await expectTerminalText(panel, "Review");
  await expectTerminalInputFocused(panel);
  expect(sent.some((value) => value.includes("\r"))).toBe(false);
  await pressTerminalKey(page, "Backspace");
  await insertTerminalText(page, "!");
  await pressTerminalKey(page, "Enter");
  await expect
    .poll(() => sent.some((value) => value.includes("\r")))
    .toBe(true);
  expect(transcription.clips()).toBe(1);
});

test("terminal dictation preserves a transcript beyond the launch field limit without submitting", async ({
  page,
  frontendServices,
}) => {
  const text = `${"spoken ".repeat(600)}end`;
  const opened = await openFrontendTerminalVoice(page, frontendServices);
  const transcription = requireTranscription(opened.transcription);
  const { panel, sent } = opened;
  transcription.answerText(text);
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await expect
    .poll(() => sent.filter((value) => value === text))
    .toEqual([text]);
  await expectTerminalText(panel, "end");
  expect(sent.some((value) => value.includes("\r"))).toBe(false);
  await pressTerminalKey(page, "Enter");
  await expect
    .poll(() => sent.some((value) => value.includes("\r")))
    .toBe(true);
});

test.describe("phone terminal microphone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test("touch records and stops with compact ordered actions and input room at reduced height", async ({
    page,
    frontendServices,
  }) => {
    await unfocusedPromptButtons(page);
    const opened = await openFrontendTerminalVoice(page, frontendServices, {
      press: tapWhereShown,
    });
    const transcription = requireTranscription(opened.transcription);
    const { panel, sent } = opened;
    transcription.answerText("the session header");
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
    expect(sent.some((value) => value.includes("\r"))).toBe(false);
    await insertTerminalText(page, "X");
    await pressTerminalKey(page, "Backspace");
    await insertTerminalText(page, " please");
    await pressTerminalKey(page, "Enter");
    await expect
      .poll(() => sent.some((value) => value.includes("\r")))
      .toBe(true);
    await page.setViewportSize({ width: 390, height: 400 });
    for (const fitted of [prompts, done, close]) {
      await expect(fitted).toBeInViewport({ ratio: 1 });
      const bounds = await box(fitted);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await closeSidePanel(panel, { using: "touch" });
    await expect(panel).toHaveCount(0);
  });
});
