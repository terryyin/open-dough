import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { hold } from "./launch-host-options-page.ts";
import {
  audioInput,
  mountInstructionVoice,
  originalDraft,
} from "./instruction-voice-page.ts";

const escape = () => userEvent.keyboard("{Escape}");

async function abandonsTranscription(dismiss: "Cancel" | "Escape") {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  const held = hold<{ text: string }>();
  voice.transcribe.mockReturnValueOnce(held.answer);
  await voice.field.fill("Discard this draft");
  await voice.recordClip();
  await expect.poll(() => voice.transcribe.mock.calls).toHaveLength(1);
  const call = voice.transcribe.mock.calls[0];
  if (call === undefined)
    throw new Error("The recording did not request transcription.");
  const [clip, signal] = call;
  expect(clip.type).toMatch(/^audio\//);
  expect(clip.size).toBeGreaterThan(0);
  expect(capture.tracks().map((track) => track.readyState)).toEqual(["ended"]);
  await expect.element(voice.status).toHaveTextContent("Transcribing…");
  await expect.element(voice.start).toBeDisabled();
  await expect.element(voice.field).toHaveAttribute("readonly");
  await expect.element(voice.cancel).toBeEnabled();
  if (dismiss === "Cancel") await voice.cancel.click();
  else await escape();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(signal.aborted).toBe(true);
  await voice.action.click();
  await expect.element(voice.field).toHaveValue("");
  held.resolve({ text: "Do not carry this into the new dialog" });
  await held.answer;
  await expect.element(voice.field).toHaveValue("");
  await voice.ready();
  expect(voice.transcribe).toHaveBeenCalledTimes(1);
  expect(voice.send).not.toHaveBeenCalled();
}

test("Cancel abandons a held transcription and a late reply leaves the next dialog empty", async () => {
  await abandonsTranscription("Cancel");
});

test("Escape abandons a held transcription and a late reply leaves the next dialog empty", async () => {
  await abandonsTranscription("Escape");
});

test("Escape stops active recording and late permission after either dismissal cannot populate the next dialog", async () => {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  await voice.begin();
  await escape();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(capture.tracks().map((track) => track.readyState)).toEqual(["ended"]);
  expect(voice.transcribe).not.toHaveBeenCalled();
  await voice.action.click();

  for (const dismiss of ["Cancel", "Escape"] as const) {
    const pending = hold<MediaStream>();
    const requested = hold<MediaStream>();
    capture.getUserMedia.mockImplementationOnce(async () => {
      const stream = await capture.openStream();
      requested.resolve(stream);
      return pending.answer;
    });
    await voice.field.fill(originalDraft);
    await voice.record.click();
    const stream = await requested.answer;
    await expect
      .element(voice.status)
      .toHaveTextContent("Waiting for microphone permission…");
    await expect.element(voice.start).toBeDisabled();
    await expect.element(voice.field).toHaveAttribute("readonly");
    if (dismiss === "Cancel") await voice.cancel.click();
    else await escape();
    await expect.element(voice.dialog).not.toBeInTheDocument();
    await voice.action.click();
    await expect.element(voice.field).toHaveValue("");
    expect(stream.getTracks().map((track) => track.readyState)).toEqual([
      "live",
    ]);
    pending.resolve(stream);
    await expect
      .poll(() => stream.getTracks().map((track) => track.readyState))
      .toEqual(["ended"]);
    await expect.element(voice.field).toHaveValue("");
    await voice.ready();
  }
  expect(voice.transcribe).not.toHaveBeenCalled();
  expect(voice.send).not.toHaveBeenCalled();
});

test("unexpected microphone track end keeps the typed draft editable without requesting transcription", async () => {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  await voice.field.fill(originalDraft);
  await voice.begin();
  for (const track of capture.tracks()) track.stop();
  await expect
    .element(voice.problem)
    .toHaveTextContent(
      "Microphone recording ended before Stop. Retry explicitly or type the instruction.",
    );
  await expect.element(voice.field).toHaveValue(originalDraft);
  await voice.ready();
  expect(capture.tracks().map((track) => track.readyState)).toEqual(["ended"]);
  expect(voice.transcribe).not.toHaveBeenCalled();
  expect(voice.send).not.toHaveBeenCalled();
});
