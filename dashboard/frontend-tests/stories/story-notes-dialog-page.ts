// StoryNotesDialog mounted alone inside the page's reads, so its note
// announcements speak on the page: changes go to the case, which answers each
// with the next queued answer (accepting by default), and input stays in-page.
// Pressing and typing wait for the control they reach; cases wait for what
// the dialog then shows.
import { createElement } from "react";
import { vi } from "vitest";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { StoryNotesDialog } from "../../src/StoryNotesDialog.tsx";
import type { StoryNote, StoryNoteChange } from "../../src/storyNote.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

export const title = "Keep notes beside a story";
export const identity = "SEED-001#keep-notes";

const answers = {
  accept: () => Promise.resolve(),
  refuse: () => Promise.reject(new Error("422 refused")),
  unreachable: () => Promise.reject(new TypeError("Failed to fetch")),
};
export type Answer = keyof typeof answers;

function present<T>(found: T | null | undefined, what: string): T {
  if (found === null || found === undefined) throw new Error(`No ${what}`);
  return found;
}

export async function openDialog(
  notes: readonly StoryNote[],
  { unreadable = false } = {},
) {
  const changes: StoryNoteChange[] = [];
  const next: Answer[] = [];
  const onChange = (change: StoryNoteChange) => {
    changes.push(change);
    return answers[next.shift() ?? "accept"]();
  };
  const props = { identity, title, unreadable, onChange, onClose: vi.fn() };
  const holding = (held: readonly StoryNote[]) =>
    createElement(
      PageReadsOnPage,
      { reads: pageReadsSupplying({}) },
      createElement(StoryNotesDialog, { ...props, notes: held }),
    );
  const { rerender } = await mountComponent(holding(notes));
  const dialog = await vi.waitFor(() =>
    present(document.querySelector("dialog"), "dialog"),
  );
  const showNotes = (held: readonly StoryNote[]) => {
    rerender(holding(held));
  };
  const button = (name: string, within: Element) =>
    present(
      [...within.querySelectorAll("button")].find(
        (candidate) => candidate.textContent === name && !candidate.hidden,
      ),
      `"${name}" button`,
    );
  const click = async (control: () => HTMLButtonElement) => {
    (await vi.waitFor(control)).click();
  };
  const savedNotes = '[aria-label="Saved notes"] > li';
  const savedNote = () => present(dialog.querySelector(savedNotes), "note");
  const field = () => dialog.querySelector("textarea");
  // The focused control as cases name it: the note text, a saved note's button
  // as "note <name>", or another button by its name.
  const focused = () => {
    const active = document.activeElement;
    if (active !== null && active === field()) return "note text";
    if (!(active instanceof HTMLButtonElement)) return undefined;
    return active.closest(savedNotes) === null
      ? active.textContent
      : `note ${active.textContent}`;
  };
  const texts = (selector: string) =>
    [...dialog.querySelectorAll(selector)].map((found) => found.textContent);
  return {
    dialog,
    changes,
    answerNext: (answer: Answer) => next.push(answer),
    showNotes,
    press: (name: string) => click(() => button(name, dialog)),
    savedNote,
    pressOnNote: (name: string) => click(() => button(name, savedNote())),
    composer: () => present(dialog.querySelector("form"), "composer"),
    field,
    focused,
    type: async (text: string) => {
      (await vi.waitFor(() => present(field(), "note text"))).value = text;
    },
    alerts: () => texts('[role="alert"]'),
    announcement: () => texts('[role="status"]').join(""),
    noteTexts: () => texts(".story-note-text"),
  };
}
