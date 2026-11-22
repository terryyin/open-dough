import { expect, test } from "vitest";
import { instructionProblems } from "../../src/instructionTranscription.ts";
import {
  audioInput,
  mountInstructionVoice,
  originalDraft,
} from "./instruction-voice-page.ts";

const privateDiagnostic = "private-provider-diagnostic";

const captureError = (name: string) =>
  new DOMException(privateDiagnostic, name);

type InstructionVoice = Awaited<ReturnType<typeof mountInstructionVoice>>;

async function failsToRecord(
  voice: InstructionVoice,
  capture: ReturnType<typeof audioInput>,
  failure: keyof typeof instructionProblems,
) {
  await voice.record.click();
  await expect
    .element(voice.problem)
    .toHaveTextContent(instructionProblems[failure]);
  await expect.element(voice.field).toHaveValue(originalDraft);
  expect(voice.dialog.element().textContent).not.toContain(privateDiagnostic);
  await voice.ready();
  expect(capture.tracks()).toEqual([]);
}

async function startsTyped(voice: InstructionVoice) {
  const typed = `${originalDraft}\n\nReview before implementing`;
  await voice.field.fill(typed);
  expect(voice.send).not.toHaveBeenCalled();
  await voice.start.click();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(voice.send.mock.calls.map(([request]) => request.instruction)).toEqual(
    [typed],
  );
}

test("permission refusal makes no transcription request and an explicit retry works in the same dialog", async () => {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  await voice.field.fill(originalDraft);
  capture.getUserMedia.mockRejectedValueOnce(captureError("NotAllowedError"));
  await failsToRecord(voice, capture, "permission");
  expect(voice.transcribe).not.toHaveBeenCalled();
  await voice.recordClip();
  await expect
    .element(voice.field)
    .toHaveValue(`${originalDraft}\n\nDo not implement yet`);
  await expect.element(voice.problem).not.toBeInTheDocument();
  await startsTyped(voice);
  expect(voice.transcribe).toHaveBeenCalledTimes(1);
});

test("an unavailable device and an unsupported recording format make no transcription request and typed Start works in the same dialog", async () => {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  await voice.field.fill(originalDraft);
  capture.getUserMedia.mockRejectedValueOnce(captureError("NotFoundError"));
  await failsToRecord(voice, capture, "device");
  capture.format.mockReturnValue(false);
  await failsToRecord(voice, capture, "format");
  await startsTyped(voice);
  expect(voice.transcribe).not.toHaveBeenCalled();
});
