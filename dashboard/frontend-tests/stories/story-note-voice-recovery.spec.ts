import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { instructionProblems } from "../../src/instructionTranscription.ts";
import { audioInput } from "../launches/instruction-voice-page.ts";
import {
  holdAnswer,
  mountNoteDictation,
  noteAction,
  noteIsReady,
  notes,
  noteText,
  recordNoteClip,
  startNoteClip,
} from "./story-note-dictation-page.ts";

test("setup returns to the same draft; permission and transcription problems keep typed text", async () => {
  const capture = audioInput();
  const onConfigured = vi.fn<() => Promise<boolean>>().mockResolvedValue(false);
  const { story, changes, openSettings, open } = await mountNoteDictation({
    onConfigured,
  });
  await open();
  const draft = "Draft through setup";
  await noteText.fill(draft);
  await userEvent.click(noteAction("Dictate"));
  await expect
    .element(notes.getByRole("alert"))
    .toHaveTextContent(
      "Configure an OpenAI API key in System settings to dictate. You can also type the note.",
    );
  const closed = new Promise<void>((resolve) => {
    notes.element().addEventListener(
      "close",
      () => {
        resolve();
      },
      { once: true },
    );
  });
  await userEvent.click(noteAction("Open OpenAI settings"));
  await closed;
  await expect.element(notes).not.toBeInTheDocument();
  expect(openSettings).toHaveBeenCalledOnce();
  expect(changes).not.toHaveBeenCalled();
  expect(capture.getUserMedia).not.toHaveBeenCalled();
  onConfigured.mockResolvedValue(true);
  const returnToNote = openSettings.mock.lastCall?.[0];
  if (!returnToNote)
    throw new Error("Settings did not receive a return action.");
  returnToNote();
  await expect.element(noteText).toHaveFocus();
  await expect.element(noteText).toHaveValue(draft);

  capture.getUserMedia.mockRejectedValueOnce(
    new DOMException("refused", "NotAllowedError"),
  );
  await userEvent.click(noteAction("Dictate"));
  await expect
    .element(notes.getByRole("alert"))
    .toHaveTextContent(
      instructionProblems.permission.replaceAll("instruction", "note"),
    );
  await noteIsReady();
  await expect.element(noteText).toHaveValue(draft);
  await userEvent.click(noteAction("Save note"));
  await expect
    .element(notes.getByText("Note saved to this story.", { exact: true }))
    .toBeVisible();
  expect(changes.mock.calls).toEqual([
    [{ action: "add", identity: story.identity, text: draft }],
  ]);
});

test("Close stops recording and Cancel abandons transcription; a new composer receives no late text", async () => {
  const capture = audioInput();
  const { changes, transcribe, open } = await mountNoteDictation();
  await open();
  await startNoteClip();
  expect(capture.tracks().map((track) => track.readyState)).toEqual(["live"]);
  await userEvent.click(noteAction("Close"));
  await expect.element(notes).not.toBeInTheDocument();
  await expect
    .poll(() => capture.tracks().map((track) => track.readyState))
    .toEqual(["ended"]);
  expect(transcribe).not.toHaveBeenCalled();

  const held = holdAnswer<{ text: string }>();
  transcribe.mockImplementationOnce(() => held.answer);
  await open();
  await recordNoteClip();
  await expect.poll(() => transcribe.mock.calls.length).toBe(1);
  const signal = transcribe.mock.lastCall?.[1];
  expect(signal?.aborted).toBe(false);
  await userEvent.click(noteAction("Cancel"));
  await expect.poll(() => signal?.aborted).toBe(true);
  await userEvent.click(noteAction("Add note"));
  held.deliver({ text: "Stale transcript for the cancelled composer" });
  await held.answer;
  await expect.element(noteText).toHaveValue("");
  await noteIsReady();

  const draft = "Kept after transcription failure";
  await noteText.fill(draft);
  transcribe.mockResolvedValueOnce({ problem: instructionProblems.network });
  await recordNoteClip();
  await expect
    .element(notes.getByRole("alert"))
    .toHaveTextContent(
      instructionProblems.network.replaceAll("instruction", "note"),
    );
  await expect.element(noteText).toHaveValue(draft);
  await noteIsReady();
  expect(changes).not.toHaveBeenCalled();
});
