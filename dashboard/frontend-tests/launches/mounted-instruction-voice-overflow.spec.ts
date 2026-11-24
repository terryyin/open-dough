import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  audioInput,
  mountInstructionVoice,
  originalDraft,
} from "./instruction-voice-page.ts";

test("an over-limit recording blocks Start and Record until its review is added, and Start sends the final edit", async () => {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  await voice.field.fill(originalDraft);
  const transcript = "x".repeat(4_001 - originalDraft.length - 2);
  voice.transcribe.mockResolvedValueOnce({ text: transcript });
  await voice.recordClip(capture);
  await expect.element(voice.candidate).toHaveValue(transcript);
  await expect.element(voice.field).toHaveValue(originalDraft);
  await expect.element(voice.field).toHaveAttribute("readonly");
  await expect.element(voice.start).toBeDisabled();
  await expect.element(voice.record).toBeDisabled();
  await expect
    .element(voice.status)
    .toHaveTextContent("Review or discard the transcript before Start.");
  const shortened = transcript.slice(0, -3);
  await voice.candidate.fill(shortened);
  await voice.add.click();
  await expect
    .element(voice.field)
    .toHaveValue(`${originalDraft}\n\n${shortened}`);
  await expect.element(voice.field).toHaveFocus();
  await expect.element(voice.candidate).not.toBeInTheDocument();
  await voice.ready();
  const edited = `${originalDraft}\n\nReview the launch dialog before implementing`;
  await voice.field.fill(edited);
  await voice.start.click();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(voice.send.mock.calls.map(([request]) => request.instruction)).toEqual(
    [edited],
  );
  expect(voice.transcribe).toHaveBeenCalledTimes(1);
});

test("Discard in review keeps the draft focused, and Escape in review leaves the reopened dialog empty", async () => {
  const capture = audioInput();
  const voice = await mountInstructionVoice();
  const transcript = "x".repeat(4_100);
  await voice.field.fill(originalDraft);
  voice.transcribe.mockResolvedValueOnce({ text: transcript });
  await voice.recordClip(capture);
  await expect.element(voice.candidate).toHaveValue(transcript);
  await expect.element(voice.candidate).toHaveFocus();
  await expect.element(voice.field).toHaveValue(originalDraft);
  await userEvent.tab();
  await expect
    .element(
      voice.dialog.getByRole("button", {
        name: "Discard transcript",
        exact: true,
      }),
    )
    .toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(voice.candidate).not.toBeInTheDocument();
  await expect.element(voice.field).toHaveValue(originalDraft);
  await expect.element(voice.field).toHaveFocus();

  voice.transcribe.mockResolvedValueOnce({ text: transcript });
  await voice.recordClip(capture);
  await expect.element(voice.candidate).toHaveValue(transcript);
  await userEvent.keyboard("{Escape}");
  await expect.element(voice.dialog).not.toBeInTheDocument();
  await voice.action.click();
  await expect.element(voice.field).toHaveValue("");
  await expect.element(voice.candidate).not.toBeInTheDocument();
  expect(voice.send).not.toHaveBeenCalled();
});
