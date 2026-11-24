import { createElement, useState } from "react";
import { expect, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { InstructionTranscriptionSource } from "../../src/instructionTranscriptionSource.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { SettingsNavigation } from "../../src/settingsNavigation.ts";
import type { StoryNoteChange, StoryNoteContext } from "../../src/storyNote.ts";
import { StoryNotesDialog } from "../../src/StoryNotesDialog.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

export const notes = page.getByRole("dialog", {
  name: "Story notes",
  exact: true,
});
export const noteText = notes.getByRole("textbox", {
  name: "Note text",
  exact: true,
});
export const noteAction = (name: string) =>
  notes.getByRole("button", { name, exact: true });
export const transcriptEditor = notes.getByRole("textbox", {
  name: "Transcript to shorten",
});

const configured = () => Promise.resolve(true);

export function holdAnswer<T>() {
  let deliver: (value: T) => void = () => {
    throw new Error("No held answer.");
  };
  const answer = new Promise<T>((resolve) => {
    deliver = resolve;
  });
  return { answer, deliver };
}

export async function mountNoteDictation({
  context,
  onConfigured = configured,
}: {
  readonly context?: StoryNoteContext;
  readonly onConfigured?: InstructionTranscriptionSource["configured"];
} = {}) {
  const story = makeMe.aWorkEntry
    .with({
      identity: "SEED-001#keep-notes",
      title: "Keep notes beside a story",
    })
    .please();
  const transcribe = vi.fn<InstructionTranscriptionSource["transcribe"]>();
  const changes = vi
    .fn<(change: StoryNoteChange) => Promise<void>>()
    .mockResolvedValue(undefined);
  const openSettings = vi.fn<(onReturn: () => void) => void>();
  const reads = pageReadsSupplying({
    transcription: { configured: onConfigured, transcribe },
  });

  function NotesOnPage() {
    const [open, setOpen] = useState(false);
    return createElement(
      PageReadsOnPage,
      { reads },
      createElement(
        SettingsNavigation.Provider,
        { value: openSettings },
        createElement(
          "button",
          {
            onClick: () => {
              setOpen(true);
            },
          },
          "Open note composer",
        ),
        open
          ? createElement(StoryNotesDialog, {
              ...story,
              notes: [],
              unreadable: false,
              onChange: changes,
              onClose: () => {
                setOpen(false);
              },
              ...(context === undefined ? {} : { context }),
            })
          : null,
      ),
    );
  }

  await mountComponent(createElement(NotesOnPage));
  return {
    story,
    changes,
    transcribe,
    openSettings,
    open: async () => {
      await userEvent.click(
        page.getByRole("button", { name: "Open note composer" }),
      );
      if (context === undefined) await userEvent.click(noteAction("Add note"));
      await expect.element(noteText).toHaveFocus();
    },
  };
}

export async function noteStatus(status: string) {
  await expect.element(notes.getByText(status, { exact: true })).toBeVisible();
}

export async function noteIsBusy() {
  await expect.element(noteAction("Save note")).toBeDisabled();
  await expect.element(noteAction("Dictate")).toBeDisabled();
  await expect.element(noteAction("Cancel")).toBeEnabled();
  await expect.element(noteText).toHaveAttribute("readonly");
}

export async function noteIsReady() {
  await expect.element(noteText).not.toHaveAttribute("readonly");
  await expect.element(noteAction("Save note")).toBeEnabled();
  await expect.element(noteAction("Dictate")).toBeEnabled();
}

export async function startNoteClip() {
  await userEvent.click(noteAction("Dictate"));
  await noteStatus("Recording… Stop recording when you are finished.");
  await noteIsBusy();
}

export async function recordNoteClip() {
  await startNoteClip();
  await userEvent.click(noteAction("Stop recording"));
}
