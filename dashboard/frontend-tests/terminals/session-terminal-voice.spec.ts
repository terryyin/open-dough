// Controlled transcription and attached-terminal input. Keyboard access and
// phone layout have their own focused journeys beside this file.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { openFrontendTerminalVoice } from "../../test-support/support/frontendTerminalVoice.ts";
import { microphoneBrowserOptions } from "../../test-support/support/voiceRecovery.ts";
import {
  chooseTerminalPrompt,
  expectTerminalInputFocused,
  expectTerminalText,
  replaceLastTerminalCharacter,
  submitTerminalInput,
  writeTerminalInput,
} from "../../test-support/terminalScreenPage.ts";
import { observeMicrophone } from "../../test-support/support/voicePage.ts";
import {
  expectVoiceStatus,
  expectVoiceStatusText,
  finishTerminalDictation,
  startTerminalDictation,
} from "../../test-support/support/terminalVoicePage.ts";

test.use(microphoneBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

test("dictation sanitizes one transcript, preserves typing during capture and transcription, and remains editable until Enter", async ({
  page,
  frontendServices,
}) => {
  const { panel, sent, transcription } = await openFrontendTerminalVoice(
    page,
    frontendServices,
  );
  if (transcription === undefined)
    throw new Error("expected transcription answers");
  transcription.answerText("the header\nthen \u001b[31mthe controls\u0007");
  const held = transcription.holdNext();
  await writeTerminalInput(panel, "Review ");
  await startTerminalDictation(panel, { using: "keyboard" });
  await writeTerminalInput(panel, "also ");
  await finishTerminalDictation(panel, { using: "keyboard" });
  await held.received;
  await writeTerminalInput(panel, "later ");
  held.release();
  await held.delivered;
  const transcript = "the header then the controls";
  await expect
    .poll(() => sent.filter((value) => value === transcript))
    .toEqual([transcript]);
  await expectTerminalText(panel, `Review also later ${transcript}`);
  await expectTerminalInputFocused(panel);
  expect(sent.some((value) => /[\r\n]/.test(value))).toBe(false);
  const beforeEdit = sent.length;
  await replaceLastTerminalCharacter(panel, "!");
  await submitTerminalInput(panel);
  await expect.poll(() => sent.slice(beforeEdit).join("")).toBe("\u007f!\r");
  expect(transcription.clips()).toBe(1);
});

test("keyboard quick replies remain usable during recording without ending dictation", async ({
  page,
  frontendServices,
}) => {
  const { panel, sent, transcription } = await openFrontendTerminalVoice(
    page,
    frontendServices,
  );
  if (transcription === undefined)
    throw new Error("expected transcription answers");
  transcription.answerText("the header");
  const held = transcription.holdNext();
  await startTerminalDictation(panel, { using: "keyboard" });
  await chooseTerminalPrompt(panel, "OK", { using: "keyboard" });
  await expect
    .poll(() => sent.filter((value) => value === "OK"))
    .toEqual(["OK"]);
  await expectVoiceStatus(panel, "Recording…");
  await finishTerminalDictation(panel, { using: "keyboard" });
  await held.received;
  await expectVoiceStatusText(panel, "Transcribing…");
  held.release();
  await held.delivered;
  await expect
    .poll(() => sent.filter((value) => value === "the header"))
    .toEqual(["the header"]);
});

test("terminal dictation preserves a transcript beyond the launch field limit without submitting", async ({
  page,
  frontendServices,
}) => {
  const text = `${"spoken ".repeat(600)}end`;
  const { panel, sent, transcription } = await openFrontendTerminalVoice(
    page,
    frontendServices,
  );
  if (transcription === undefined)
    throw new Error("expected transcription answers");
  transcription.answerText(text);
  await startTerminalDictation(panel);
  await finishTerminalDictation(panel);
  await expect
    .poll(() => sent.filter((value) => value === text))
    .toEqual([text]);
  await expectTerminalText(panel, "end");
  expect(sent.some((value) => /[\r\n]/.test(value))).toBe(false);
});
