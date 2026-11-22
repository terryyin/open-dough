// StoryNotesDialog mounted alone: changes go to the case, input stays in-page.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
} from "../../src/storyNote.ts";
import {
  storyNoteNotDeleted,
  storyNoteNotSaved,
  storyNotesUnreadable,
} from "../../src/storyNotesReadSource.ts";
import {
  identity,
  openDialog,
  title,
  type Answer,
} from "./story-notes-dialog-page.ts";

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

test("the dialog, a saved note and the add composer name the story", async () => {
  const notes = await openDialog([makeMe.aStoryNote.please()]);
  await expect.poll(() => notes.dialog.open).toBe(true);
  await expect
    .poll(() => notes.dialog.querySelector("h2")?.textContent)
    .toBe("Story notes");
  await expect.poll(() => notes.dialog.textContent).toContain(title);
  await expect.poll(() => notes.dialog.textContent).toContain(identity);
  await expect
    .poll(() => notes.savedNote().textContent)
    .toContain(storyContext);
  await notes.press("Add note");
  await expect.poll(() => notes.focused()).toBe("note text");
  await expect.poll(() => notes.composer().textContent).toContain(storyContext);
});

test("a blank save asks for nothing and keeps the draft", async () => {
  const notes = await openDialog([]);
  await notes.press("Add note");
  await notes.type("   ");
  await notes.press("Save note");
  expect(notes.changes).toEqual([]);
  await expect.poll(() => notes.field()?.value).toBe("   ");
});

test("saving a note asks for one add to the story and announces it", async () => {
  const notes = await openDialog([]);
  await notes.press("Add note");
  await notes.type("First observation");
  await notes.press("Save note");
  await expect
    .poll(() => notes.announcement())
    .toBe("Note saved to this story.");
  expect(notes.changes).toEqual([
    { action: "add", identity, text: "First observation" },
  ]);
  await expect.poll(() => notes.field()).toBeNull();
});

test.each<Answer>(["refuse", "unreachable"])(
  "a save the dashboard answers with %s keeps its draft and says so; saving again saves",
  async (failure) => {
    const notes = await openDialog([]);
    await notes.press("Add note");
    const draft = "Keep the observation when saving fails.";
    await notes.type(draft);
    notes.answerNext(failure);
    await notes.press("Save note");
    await expect.poll(() => notes.alerts()).toEqual([storyNoteNotSaved]);
    await expect.poll(() => notes.field()?.value).toBe(draft);
    await notes.press("Save note");
    await expect.poll(() => notes.alerts()).toEqual([]);
    await expect
      .poll(() => notes.announcement())
      .toBe("Note saved to this story.");
    expect(notes.changes).toEqual([
      { action: "add", identity, text: draft },
      { action: "add", identity, text: draft },
    ]);
  },
);

test("a line note shows its line context on the note and in its edit", async () => {
  const notes = await openDialog([lineNote]);
  await notes.pressOnNote("Edit");
  for (const words of lineContextWords) {
    await expect.poll(() => notes.savedNote().textContent).toContain(words);
    await expect.poll(() => notes.composer().textContent).toContain(words);
  }
});

test("editing a line note asks for an edit of its text alone and returns focus to Edit", async () => {
  const notes = await openDialog([lineNote]);
  await notes.pressOnNote("Edit");
  await expect.poll(() => notes.focused()).toBe("note text");
  await expect.poll(() => notes.field()?.value).toBe(lineNote.text);
  await notes.type("Updated observation");
  await notes.press("Save note");
  await expect.poll(() => notes.announcement()).toBe("Note updated.");
  await expect.poll(() => notes.focused()).toBe("note Edit");
  expect(notes.changes).toEqual([
    { action: "edit", identity, id: lineNote.id, text: "Updated observation" },
  ]);
});

test("cancelling the delete question keeps the note and returns focus to Delete", async () => {
  const notes = await openDialog([makeMe.aStoryNote.withText("Kept").please()]);
  await notes.pressOnNote("Delete");
  await expect.poll(() => notes.focused()).toBe("note Cancel");
  await notes.pressOnNote("Cancel");
  await expect.poll(() => notes.focused()).toBe("note Delete");
  await expect.poll(() => notes.noteTexts()).toEqual(["Kept"]);
  expect(notes.changes).toEqual([]);
});

test("deleting a note asks for one delete and focuses Add note once it is gone", async () => {
  const note = makeMe.aStoryNote.please();
  const notes = await openDialog([note]);
  await notes.pressOnNote("Delete");
  await expect.poll(() => notes.focused()).toBe("note Cancel");
  await notes.pressOnNote("Delete");
  await expect.poll(() => notes.announcement()).toBe("Note deleted.");
  expect(notes.changes).toEqual([{ action: "delete", identity, id: note.id }]);
  notes.showNotes([]);
  await expect.poll(() => notes.focused()).toBe("Add note");
});

test("saving an unchanged edit of a sent note asks for the edit and shows the answered waiting state", async () => {
  const at = "2026-11-17T00:00:00.000Z";
  const sent = makeMe.aStoryNote.savedAt(at).deliveredAs(at).please();
  const notes = await openDialog([sent]);
  await expect
    .poll(() => notes.savedNote().textContent)
    .toContain(storyNoteSentToFollowUp);
  await notes.pressOnNote("Edit");
  await notes.press("Save note");
  await expect.poll(() => notes.announcement()).toBe("Note updated.");
  expect(notes.changes).toEqual([
    { action: "edit", identity, id: sent.id, text: sent.text },
  ]);
  notes.showNotes([{ ...sent, editedAt: "2026-11-17T00:20:00.000Z" }]);
  await expect
    .poll(() => notes.savedNote().textContent)
    .toContain(storyNoteWaitingForFollowUp);
});

test("a refused edit keeps the typed text and the original note", async () => {
  const notes = await openDialog([
    makeMe.aStoryNote.withText("Original").please(),
  ]);
  await notes.pressOnNote("Edit");
  await notes.type("Typed edit survives refusal");
  notes.answerNext("refuse");
  await notes.press("Save note");
  await expect.poll(() => notes.alerts()).toEqual([storyNoteNotSaved]);
  await expect
    .poll(() => notes.field()?.value)
    .toBe("Typed edit survives refusal");
  await expect.poll(() => notes.noteTexts()).toEqual(["Original"]);
});

test("a refused deletion keeps the note, says so and keeps focus on Delete", async () => {
  const notes = await openDialog([
    makeMe.aStoryNote.withText("Original").please(),
  ]);
  notes.answerNext("refuse");
  await notes.pressOnNote("Delete");
  await expect.poll(() => notes.focused()).toBe("note Cancel");
  await notes.pressOnNote("Delete");
  await expect.poll(() => notes.alerts()).toEqual([storyNoteNotDeleted]);
  await expect.poll(() => notes.focused()).toBe("note Delete");
  await expect.poll(() => notes.noteTexts()).toEqual(["Original"]);
});

test("unreadable notes say so in the dialog", async () => {
  const notes = await openDialog([], { unreadable: true });
  await expect.poll(() => notes.alerts()).toEqual([storyNotesUnreadable]);
});
