import { expect, test } from "vitest";
import { instructionProblems } from "../../src/instructionTranscription.ts";
import {
  audioInput,
  mountInstructionVoice,
  originalDraft,
} from "./instruction-voice-page.ts";

const privateDiagnostic = "private-provider-diagnostic";

async function recoversFrom(failure: "permission" | "device" | "format") {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  await voice.field.fill(originalDraft);
  if (failure === "format") capture.format.mockReturnValue(false);
  else {
    capture.getUserMedia.mockRejectedValueOnce(
      new DOMException(
        privateDiagnostic,
        failure === "permission" ? "NotAllowedError" : "NotFoundError",
      ),
    );
  }
  await voice.record.click();
  await expect
    .element(voice.problem)
    .toHaveTextContent(instructionProblems[failure]);
  await expect.element(voice.field).toHaveValue(originalDraft);
  expect(voice.dialog.element().textContent).not.toContain(privateDiagnostic);
  await voice.ready();
  expect(capture.tracks()).toEqual([]);
  expect(voice.transcribe).not.toHaveBeenCalled();

  if (failure === "permission") {
    await voice.recordClip();
    await expect
      .element(voice.field)
      .toHaveValue(`${originalDraft}\n\nDo not implement yet`);
    await expect.element(voice.problem).not.toBeInTheDocument();
  }
  const typed = `${originalDraft}\n\nReview before implementing`;
  await voice.field.fill(typed);
  expect(voice.send).not.toHaveBeenCalled();
  await voice.start.click();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(voice.send.mock.calls.map(([request]) => request.instruction)).toEqual(
    [typed],
  );
  expect(voice.transcribe).toHaveBeenCalledTimes(
    failure === "permission" ? 1 : 0,
  );
}

test("permission refusal makes no transcription request and an explicit retry works in the same dialog", async () => {
  await recoversFrom("permission");
});

test("an unavailable device makes no transcription request and typed Start works in the same dialog", async () => {
  await recoversFrom("device");
});

test("an unsupported recording format makes no transcription request and typed Start works in the same dialog", async () => {
  await recoversFrom("format");
});
