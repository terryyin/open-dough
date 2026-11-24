import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { InstructionTranscriptionSource } from "../../src/instructionTranscriptionSource.ts";
import { audioInput } from "../launches/instruction-voice-page.ts";
import {
  terminalInput,
  terminalStatus,
} from "../sessions/session-terminal-page.ts";
import {
  beginDictation,
  editAndSubmitTerminal,
  focusActionsByKeyboard,
  holdTerminalTranscript,
  stopDictation,
} from "./terminal-dictation-page.ts";
import { promptItem, prompts } from "./terminal-input-controls.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";
import { drawnRows, showsRow } from "./terminal-touch-input.ts";

const desktop = { width: 1280, height: 800 };
const configured = () => Promise.resolve(true);

test("dictation sanitizes one transcript, preserves typing during capture and transcription, and remains editable until Enter", async () => {
  const capture = audioInput();
  const held = holdTerminalTranscript(
    "the header\nthen \u001b[31mthe controls\u0007",
  );
  const transcribe = vi.fn<InstructionTranscriptionSource["transcribe"]>(
    () => held.answer,
  );
  const { sent } = await mountTerminalInput({
    viewport: desktop,
    transcription: { configured, transcribe },
  });

  await userEvent.keyboard("Review ");
  await beginDictation("keyboard");
  await terminalInput.click();
  await userEvent.keyboard("also ");
  await stopDictation("keyboard", capture);
  await expect.poll(() => transcribe.mock.calls.length).toBe(1);
  expect(transcribe.mock.lastCall?.[0].size).toBeGreaterThan(0);
  await expect.element(terminalStatus).toHaveTextContent("Transcribing…");
  await terminalInput.click();
  await userEvent.keyboard("later ");
  expect(sent().join("")).toBe("Review also later ");
  held.deliver();

  const transcript = "the header then the controls";
  await expect
    .poll(() => sent().filter((input) => input === transcript))
    .toEqual([transcript]);
  await showsRow(`Review also later ${transcript}`);
  await expect.element(terminalInput).toHaveFocus();
  expect(sent().some((input) => /[\r\n]/.test(input))).toBe(false);

  const beforeEdit = sent().length;
  await editAndSubmitTerminal("!");
  await expect.poll(() => sent().slice(beforeEdit).join("")).toBe("\u007f!\r");
  expect(transcribe).toHaveBeenCalledOnce();
});

test("keyboard quick replies remain usable during recording without ending dictation", async () => {
  const capture = audioInput();
  const held = holdTerminalTranscript("the header");
  const transcribe = vi.fn<InstructionTranscriptionSource["transcribe"]>(
    () => held.answer,
  );
  const { sent } = await mountTerminalInput({
    viewport: desktop,
    transcription: { configured, transcribe },
  });

  await beginDictation("keyboard");
  await focusActionsByKeyboard();
  await userEvent.keyboard("{Tab}{Tab}");
  await expect.element(prompts).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(promptItem("OK")).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(sent).toEqual(["OK"]);
  await expect
    .element(terminalStatus)
    .toHaveTextContent("Recording… Stop recording when you are finished.");
  expect(capture.tracks().map((track) => track.readyState)).toEqual(["live"]);
  expect(transcribe).not.toHaveBeenCalled();

  await stopDictation("keyboard", capture);
  await expect.poll(() => transcribe.mock.calls.length).toBe(1);
  await expect.element(terminalStatus).toHaveTextContent("Transcribing…");
  held.deliver();
  await expect.poll(sent).toEqual(["OK", "the header"]);
});

test("terminal dictation preserves a transcript beyond the launch field limit without submitting", async () => {
  const capture = audioInput();
  const text = `${"spoken ".repeat(600)}end`;
  const transcribe = vi
    .fn<InstructionTranscriptionSource["transcribe"]>()
    .mockResolvedValue({ text });
  const { sent } = await mountTerminalInput({
    viewport: desktop,
    transcription: { configured, transcribe },
  });

  await beginDictation("mouse");
  await stopDictation("mouse", capture);
  await expect.poll(sent).toEqual([text]);
  await expect
    .poll(() => drawnRows().some((row) => row.trimEnd().endsWith("end")))
    .toBe(true);
  expect(sent().some((input) => /[\r\n]/.test(input))).toBe(false);
});
