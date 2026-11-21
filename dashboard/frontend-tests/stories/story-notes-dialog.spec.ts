// StoryNotesDialog mounted alone: changes go to the case, input stays in-page.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StoryNotesDialog } from "../../src/StoryNotesDialog.tsx";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
  type StoryNote,
  type StoryNoteChange,
} from "../../src/storyNote.ts";
import {
  storyNoteNotDeleted,
  storyNoteNotSaved,
  storyNotesUnreadable,
} from "../../src/storyNotes.ts";

const title = "Keep notes beside a story";
const identity = "SEED-001#keep-notes";
const storyContext = `${title} · ${identity}`;
const lineContext = {
  view: "Intent → Changes",
  path: "src/result.ts",
  oldPath: "src/before.ts",
  comparison: { name: "Published completion", baseline: "abc", tree: "def" },
  line: { number: 7, side: "new", text: "return result;" },
} as const;
const lineNote = makeMe.aStoryNote.withContext(lineContext).please();
const lineContextWords = [
  "Intent → Changes",
  "src/before.ts → src/result.ts",
  "Published completion abc → def",
  "Line 7 · new",
  "return result;",
];

const answers = {
  accept: () => Promise.resolve(),
  refuse: () => Promise.reject(new Error("422 refused")),
  unreachable: () => Promise.reject(new TypeError("Failed to fetch")),
};
type Answer = keyof typeof answers;

function present<T>(found: T | null | undefined, what: string): T {
  if (found === null || found === undefined) throw new Error(`No ${what}`);
  return found;
}

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
function openDialog(notes: readonly StoryNote[], { unreadable = false } = {}) {
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
      root.render(createElement(StoryNotesDialog, { ...props, notes: shown }));
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

test("the dialog, a saved note and the add composer name the story", async () => {
  const notes = openDialog([makeMe.aStoryNote.please()]);
  expect(notes.dialog.open).toBe(true);
  expect(notes.dialog.querySelector("h2")?.textContent).toBe("Story notes");
  expect(notes.dialog.textContent).toContain(title);
  expect(notes.dialog.textContent).toContain(identity);
  expect(notes.savedNote().textContent).toContain(storyContext);
  await notes.press("Add note");
  expect(document.activeElement).toBe(notes.field());
  expect(notes.composer().textContent).toContain(storyContext);
});

test("a blank save asks for nothing and keeps the draft", async () => {
  const notes = openDialog([]);
  await notes.press("Add note");
  notes.type("   ");
  await notes.press("Save note");
  expect(notes.changes).toEqual([]);
  expect(notes.field()?.value).toBe("   ");
});

test("saving a note asks for one add to the story and announces it", async () => {
  const notes = openDialog([]);
  await notes.press("Add note");
  notes.type("First observation");
  await notes.press("Save note");
  expect(notes.changes).toEqual([
    { action: "add", identity, text: "First observation" },
  ]);
  expect(notes.announcement()).toBe("Note saved to this story.");
  expect(notes.field()).toBeNull();
});

test.each<Answer>(["refuse", "unreachable"])(
  "a save the dashboard answers with %s keeps its draft and says so; saving again saves",
  async (failure) => {
    const notes = openDialog([]);
    await notes.press("Add note");
    const draft = "Keep the observation when saving fails.";
    notes.type(draft);
    notes.answerNext(failure);
    await notes.press("Save note");
    expect(notes.alerts()).toEqual([storyNoteNotSaved]);
    expect(notes.field()?.value).toBe(draft);
    await notes.press("Save note");
    expect(notes.alerts()).toEqual([]);
    expect(notes.announcement()).toBe("Note saved to this story.");
    expect(notes.changes).toEqual([
      { action: "add", identity, text: draft },
      { action: "add", identity, text: draft },
    ]);
  },
);

test("a line note shows its line context on the note and in its edit", async () => {
  const notes = openDialog([lineNote]);
  await notes.pressOnNote("Edit");
  for (const words of lineContextWords) {
    expect(notes.savedNote().textContent).toContain(words);
    expect(notes.composer().textContent).toContain(words);
  }
});

test("editing a line note asks for an edit of its text alone and returns focus to Edit", async () => {
  const notes = openDialog([lineNote]);
  await notes.pressOnNote("Edit");
  expect(document.activeElement).toBe(notes.field());
  expect(notes.field()?.value).toBe(lineNote.text);
  notes.type("Updated observation");
  await notes.press("Save note");
  expect(notes.announcement()).toBe("Note updated.");
  expect(document.activeElement).toBe(notes.noteButton("Edit"));
  expect(notes.changes).toEqual([
    { action: "edit", identity, id: lineNote.id, text: "Updated observation" },
  ]);
});

test("cancelling the delete question keeps the note and returns focus to Delete", async () => {
  const notes = openDialog([makeMe.aStoryNote.withText("Kept").please()]);
  await notes.pressOnNote("Delete");
  expect(document.activeElement).toBe(notes.noteButton("Cancel"));
  await notes.pressOnNote("Cancel");
  expect(document.activeElement).toBe(notes.noteButton("Delete"));
  expect(notes.noteTexts()).toEqual(["Kept"]);
  expect(notes.changes).toEqual([]);
});

test("deleting a note asks for one delete and focuses Add note once it is gone", async () => {
  const note = makeMe.aStoryNote.please();
  const notes = openDialog([note]);
  await notes.pressOnNote("Delete");
  await notes.pressOnNote("Delete");
  expect(notes.announcement()).toBe("Note deleted.");
  expect(notes.changes).toEqual([{ action: "delete", identity, id: note.id }]);
  notes.showNotes([]);
  expect(document.activeElement).toBe(notes.button("Add note"));
});

test("saving an unchanged edit of a sent note asks for the edit and shows the answered waiting state", async () => {
  const at = "2026-11-17T00:00:00.000Z";
  const sent = makeMe.aStoryNote.savedAt(at).deliveredAs(at).please();
  const notes = openDialog([sent]);
  expect(notes.savedNote().textContent).toContain(storyNoteSentToFollowUp);
  await notes.pressOnNote("Edit");
  await notes.press("Save note");
  expect(notes.announcement()).toBe("Note updated.");
  expect(notes.changes).toEqual([
    { action: "edit", identity, id: sent.id, text: sent.text },
  ]);
  notes.showNotes([{ ...sent, editedAt: "2026-11-17T00:20:00.000Z" }]);
  expect(notes.savedNote().textContent).toContain(storyNoteWaitingForFollowUp);
});

test("a refused edit keeps the typed text and the original note", async () => {
  const notes = openDialog([makeMe.aStoryNote.withText("Original").please()]);
  await notes.pressOnNote("Edit");
  notes.type("Typed edit survives refusal");
  notes.answerNext("refuse");
  await notes.press("Save note");
  expect(notes.alerts()).toEqual([storyNoteNotSaved]);
  expect(notes.field()?.value).toBe("Typed edit survives refusal");
  expect(notes.noteTexts()).toEqual(["Original"]);
});

test("a refused deletion keeps the note, says so and keeps focus on Delete", async () => {
  const notes = openDialog([makeMe.aStoryNote.withText("Original").please()]);
  notes.answerNext("refuse");
  await notes.pressOnNote("Delete");
  await notes.pressOnNote("Delete");
  expect(notes.alerts()).toEqual([storyNoteNotDeleted]);
  expect(document.activeElement).toBe(notes.noteButton("Delete"));
  expect(notes.noteTexts()).toEqual(["Original"]);
});

test("unreadable notes say so in the dialog", () => {
  const notes = openDialog([], { unreadable: true });
  expect(notes.alerts()).toEqual([storyNotesUnreadable]);
});
