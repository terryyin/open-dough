// StoryNotesDialog mounted alone inside the page's reads, so its note
// announcements speak on the page: changes go to the case, which answers each
// with the next queued answer (accepting by default), and input stays in-page.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { onTestFinished, vi } from "vitest";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { StoryNotesDialog } from "../../src/StoryNotesDialog.tsx";
import type { StoryNote, StoryNoteChange } from "../../src/storyNote.ts";
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

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
export function openDialog(
  notes: readonly StoryNote[],
  { unreadable = false } = {},
) {
  const changes: StoryNoteChange[] = [];
  const next: Answer[] = [];
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  onTestFinished(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
  });
  const onChange = (change: StoryNoteChange) => {
    changes.push(change);
    return answers[next.shift() ?? "accept"]();
  };
  const props = { identity, title, unreadable, onChange, onClose: vi.fn() };
  const showNotes = (shown: readonly StoryNote[]) => {
    act(() => {
      root.render(
        createElement(
          PageReadsOnPage,
          { reads: pageReadsSupplying({}) },
          createElement(StoryNotesDialog, { ...props, notes: shown }),
        ),
      );
    });
  };
  showNotes(notes);
  const dialog = present(host.querySelector("dialog"), "dialog");
  const button = (name: string, within: Element) =>
    present(
      [...within.querySelectorAll("button")].find(
        (candidate) => candidate.textContent === name && !candidate.hidden,
      ),
      `"${name}" button`,
    );
  const click = (control: HTMLButtonElement) =>
    act(() => {
      control.click();
      return Promise.resolve();
    });
  const savedNote = () =>
    present(dialog.querySelector('[aria-label="Saved notes"] > li'), "note");
  const field = () => dialog.querySelector("textarea");
  const texts = (selector: string) =>
    [...dialog.querySelectorAll(selector)].map((found) => found.textContent);
  return {
    dialog,
    changes,
    answerNext: (answer: Answer) => next.push(answer),
    showNotes,
    button: (name: string) => button(name, dialog),
    press: (name: string) => click(button(name, dialog)),
    savedNote,
    noteButton: (name: string) => button(name, savedNote()),
    pressOnNote: (name: string) => click(button(name, savedNote())),
    composer: () => present(dialog.querySelector("form"), "composer"),
    field,
    type: (text: string) => {
      present(field(), "note text").value = text;
    },
    alerts: () => texts('[role="alert"]'),
    announcement: () => texts('[role="status"]').join(""),
    noteTexts: () => texts(".story-note-text"),
  };
}
