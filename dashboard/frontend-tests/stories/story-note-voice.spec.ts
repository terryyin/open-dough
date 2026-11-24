import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import type { StoryNoteContext } from "../../src/storyNote.ts";
import { audioInput } from "../launches/instruction-voice-page.ts";
import {
  holdAnswer,
  mountNoteDictation,
  noteAction,
  noteIsBusy,
  noteIsReady,
  notes,
  noteStatus,
  noteText,
  recordNoteClip,
  transcriptEditor,
} from "./story-note-dictation-page.ts";

test("Taken line dictation waits for permission and transcription, then permits correction before saving exact context", async () => {
  const capture = audioInput();
  const permission = holdAnswer<MediaStream>();
  capture.getUserMedia.mockImplementationOnce(() => permission.answer);
  const context: StoryNoteContext = {
    view: "Intent → Changes",
    path: "story.txt",
    comparison: {
      name: "All changes",
      baseline: "a".repeat(40),
      tree: "b".repeat(40),
    },
    line: { number: 1, side: "new", text: "Kept line" },
  };
  const { story, changes, transcribe, open } = await mountNoteDictation({
    context,
  });
  const held = holdAnswer<{ text: string }>();
  transcribe.mockImplementationOnce(() => held.answer);
  await open();
  for (const fact of [
    `${story.title} · ${story.identity}`,
    "Intent → Changes",
    "story.txt",
    `All changes ${context.comparison.baseline} → ${context.comparison.tree}`,
    "Line 1 · new",
    "Kept line",
  ]) {
    await expect.element(notes.getByText(fact, { exact: true })).toBeVisible();
  }
  await noteText.fill("Typed observation");
  await userEvent.click(noteAction("Dictate"));
  await expect.poll(() => capture.getUserMedia.mock.calls.length).toBe(1);
  await noteStatus("Waiting for microphone permission…");
  await noteIsBusy();
  permission.deliver(await capture.openStream());
  await noteStatus("Recording… Stop recording when you are finished.");
  await userEvent.click(noteAction("Cancel"));
  await expect.element(notes).not.toBeInTheDocument();
  await expect
    .poll(() => capture.tracks().map((track) => track.readyState))
    .toEqual(["ended"]);
  expect(transcribe).not.toHaveBeenCalled();

  await open();
  await noteText.fill("Typed observation");
  await recordNoteClip();
  await expect.poll(() => transcribe.mock.calls.length).toBe(1);
  expect(transcribe.mock.lastCall?.[0].size).toBeGreaterThan(0);
  await expect
    .poll(() => capture.tracks().map((track) => track.readyState))
    .toEqual(["ended", "ended"]);
  await noteStatus("Transcribing…");
  await noteIsBusy();
  expect(changes).not.toHaveBeenCalled();
  held.deliver({ text: "Check this misstated line" });
  await expect
    .element(noteText)
    .toHaveValue("Typed observation\n\nCheck this misstated line");
  await noteIsReady();

  const corrected = "Typed observation\n\nCheck this corrected line";
  await noteText.fill(corrected);
  await userEvent.click(noteAction("Save note"));
  await expect
    .element(notes.getByText("Note saved to this story.", { exact: true }))
    .toBeVisible();
  expect(changes.mock.calls).toEqual([
    [{ action: "add", identity: story.identity, text: corrected, context }],
  ]);
});

test("over-limit transcript is reviewed, shortened or discarded without losing the note", async () => {
  audioInput();
  const { story, changes, transcribe, open } = await mountNoteDictation();
  const tooLong = "x".repeat(4_001);
  transcribe.mockResolvedValue({ text: tooLong });
  await open();
  for (const name of ["Dictate", "Cancel", "Save note", "Close"]) {
    await userEvent.keyboard("{Tab}");
    await expect.element(noteAction(name)).toHaveFocus();
  }
  await noteText.fill("Keep this note");
  await recordNoteClip();
  await expect.element(transcriptEditor).toHaveValue(tooLong);
  await expect.element(transcriptEditor).toHaveFocus();
  await noteIsBusy();
  await expect.element(noteText).toHaveValue("Keep this note");
  await expect.element(noteAction("Add transcript")).toBeDisabled();
  await expect
    .element(notes.getByRole("alert"))
    .toHaveTextContent(
      "This transcript exceeds the note limit. Your note was kept. Shorten the complete transcript, then add it or discard it.",
    );
  await transcriptEditor.fill("Corrected transcript");
  await userEvent.click(noteAction("Add transcript"));
  const kept = "Keep this note\n\nCorrected transcript";
  await expect.element(noteText).toHaveValue(kept);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await recordNoteClip();
    await expect.element(transcriptEditor).toHaveValue(tooLong);
    await userEvent.click(noteAction("Discard transcript"));
    await expect.element(transcriptEditor).not.toBeInTheDocument();
    await noteIsReady();
    await expect.element(noteText).toHaveValue(kept);
  }
  await userEvent.click(noteAction("Save note"));
  await expect
    .element(notes.getByText("Note saved to this story.", { exact: true }))
    .toBeVisible();
  expect(changes.mock.calls).toEqual([
    [{ action: "add", identity: story.identity, text: kept }],
  ]);
});
