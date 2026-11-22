import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  fitTranscript,
  TranscriptReview,
} from "../../src/TranscriptReview.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const draft = "Keep this work local";

test("a transcript fits when draft, separator and transcript total at most 4,000 characters", () => {
  const exact = "x".repeat(4_000 - draft.length - 2);
  expect(fitTranscript(draft, exact)).toBe(`${draft}\n\n${exact}`);
  expect(fitTranscript(draft, `${exact}x`)).toBeUndefined();
  expect(fitTranscript(draft, "x".repeat(4_100))).toBeUndefined();
  expect(fitTranscript("", "x".repeat(4_000))).toBe("x".repeat(4_000));
});

async function review(transcript: string) {
  const onAdd = vi.fn<(text: string) => void>();
  const onDiscard = vi.fn<() => void>();
  await mountComponent(
    createElement(TranscriptReview, {
      transcript,
      draft,
      subject: "instruction",
      onAdd,
      onDiscard,
    }),
  );
  return {
    onAdd,
    onDiscard,
    candidate: page.getByRole("textbox", { name: "Transcript to shorten" }),
    add: page.getByRole("button", { name: "Add transcript", exact: true }),
    discard: page.getByRole("button", {
      name: "Discard transcript",
      exact: true,
    }),
  };
}

test("a blank edit cannot be added and keyboard shortening adds the edited transcript once", async () => {
  const transcript = "x".repeat(4_001 - draft.length - 2);
  const shown = await review(transcript);
  await expect.element(shown.candidate).toHaveValue(transcript);
  await expect.element(shown.candidate).toHaveFocus();
  await expect
    .element(
      page.getByText(
        "This transcript exceeds the instruction limit. Your instruction was kept. Shorten the complete transcript, then add it or discard it.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect.element(shown.add).toBeDisabled();
  await shown.candidate.fill(" \n ");
  await expect.element(shown.add).toBeDisabled();
  await expect
    .element(
      page.getByText(
        "Enter transcript text to add, or discard this transcript.",
        { exact: true },
      ),
    )
    .toBeVisible();
  const shortened = ` ${transcript.slice(0, -3)} `;
  await shown.candidate.fill(shortened);
  await expect
    .element(
      page.getByText(
        "4,000 of 4,000 combined characters, including the separator.",
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect.element(shown.add).toBeEnabled();
  await userEvent.tab();
  await expect.element(shown.add).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(shown.onAdd.mock.calls).toEqual([[shortened]]);
  expect(shown.onDiscard).not.toHaveBeenCalled();
});

test("the full well-over transcript stays editable and Discard adds nothing", async () => {
  const transcript = `Transcript beginning\n${"x".repeat(4_100)}\nTranscript end`;
  const shown = await review(transcript);
  await expect.element(shown.candidate).toHaveValue(transcript);
  await expect.element(shown.candidate).not.toHaveAttribute("readonly");
  await expect.element(shown.candidate).toHaveFocus();
  await expect.element(shown.add).toBeDisabled();
  await userEvent.tab();
  await expect.element(shown.discard).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(shown.onDiscard).toHaveBeenCalledTimes(1);
  expect(shown.onAdd).not.toHaveBeenCalled();
});
