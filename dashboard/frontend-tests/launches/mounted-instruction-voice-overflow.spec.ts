import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  audioInput,
  mountInstructionVoice,
  originalDraft,
} from "./instruction-voice-page.ts";

test("exactly 4,000 combined characters including the separator append and Start sends them unchanged", async () => {
  audioInput();
  const voice = await mountInstructionVoice("story");
  await voice.field.fill(originalDraft);
  const transcript = "x".repeat(4_000 - originalDraft.length - 2);
  voice.transcribe.mockResolvedValueOnce({ text: transcript });
  await voice.recordClip();
  const combined = `${originalDraft}\n\n${transcript}`;
  await expect.element(voice.field).toHaveValue(combined);
  await expect.element(voice.candidate).not.toBeInTheDocument();
  await voice.ready();
  expect(voice.transcribe).toHaveBeenCalledTimes(1);
  expect(voice.send).not.toHaveBeenCalled();
  await voice.start.click();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(voice.send.mock.calls.map(([request]) => request.instruction)).toEqual(
    [combined],
  );
});

test("one character over keeps both drafts; keyboard shortening adds once and Start sends only the final edit", async () => {
  audioInput();
  const voice = await mountInstructionVoice();
  await voice.field.fill(originalDraft);
  const transcript = "x".repeat(4_001 - originalDraft.length - 2);
  voice.transcribe.mockResolvedValueOnce({ text: transcript });
  await voice.recordClip();
  await expect.element(voice.candidate).toHaveValue(transcript);
  await expect.element(voice.candidate).toHaveFocus();
  await expect.element(voice.field).toHaveValue(originalDraft);
  await expect.element(voice.field).toHaveAttribute("readonly");
  await expect.element(voice.start).toBeDisabled();
  await expect.element(voice.record).toBeDisabled();
  await expect.element(voice.add).toBeDisabled();
  expect(voice.transcribe).toHaveBeenCalledTimes(1);
  expect(voice.send).not.toHaveBeenCalled();

  await voice.candidate.fill(" \n ");
  await expect.element(voice.add).toBeDisabled();
  await expect
    .element(
      voice.dialog.getByText(
        "Enter transcript text to add, or discard this transcript.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect.element(voice.field).toHaveValue(originalDraft);
  const shortened = ` ${transcript.slice(0, -3)} `;
  await voice.candidate.fill(shortened);
  await expect.element(voice.add).toBeEnabled();
  await userEvent.tab();
  await expect.element(voice.add).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect
    .element(voice.field)
    .toHaveValue(`${originalDraft}\n\n${shortened}`);
  await expect.element(voice.field).toHaveFocus();
  await expect.element(voice.candidate).not.toBeInTheDocument();
  await expect.element(voice.add).not.toBeInTheDocument();
  await voice.ready();
  expect(voice.transcribe).toHaveBeenCalledTimes(1);

  const edited = `${originalDraft}\n\nReview the launch dialog before implementing`;
  await voice.field.fill(edited);
  await voice.start.click();
  await expect.element(voice.dialog).not.toBeInTheDocument();
  expect(voice.send.mock.calls.map(([request]) => request.instruction)).toEqual(
    [edited],
  );
});

test("the full over-limit transcript stays editable; discard keeps the draft and either dismissal clears review", async () => {
  audioInput();
  const voice = await mountInstructionVoice();
  const transcript = `Transcript beginning\n${"x".repeat(4_100)}\nTranscript end`;
  await voice.field.fill(originalDraft);
  voice.transcribe.mockResolvedValueOnce({ text: transcript });
  await voice.recordClip();
  await expect.element(voice.candidate).toHaveValue(transcript);
  await expect.element(voice.candidate).not.toHaveAttribute("readonly");
  await expect.element(voice.candidate).toHaveFocus();
  await expect.element(voice.field).toHaveValue(originalDraft);
  await userEvent.tab();
  await expect.element(voice.discard).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(voice.candidate).not.toBeInTheDocument();
  await expect.element(voice.field).toHaveValue(originalDraft);
  await expect.element(voice.field).toHaveFocus();
  await voice.ready();

  await voice.recordClip();
  await expect
    .element(voice.field)
    .toHaveValue(`${originalDraft}\n\nDo not implement yet`);
  expect(voice.transcribe).toHaveBeenCalledTimes(2);
  for (const dismiss of ["Cancel", "Escape"] as const) {
    await voice.field.fill(originalDraft);
    voice.transcribe.mockResolvedValueOnce({ text: transcript });
    await voice.recordClip();
    await expect.element(voice.candidate).toHaveValue(transcript);
    await expect.element(voice.field).toHaveValue(originalDraft);
    if (dismiss === "Cancel") await voice.cancel.click();
    else await userEvent.keyboard("{Escape}");
    await expect.element(voice.dialog).not.toBeInTheDocument();
    await voice.action.click();
    await expect.element(voice.field).toHaveValue("");
    await expect.element(voice.candidate).not.toBeInTheDocument();
    await voice.ready();
  }
  expect(voice.transcribe).toHaveBeenCalledTimes(4);
  expect(voice.send).not.toHaveBeenCalled();
});
