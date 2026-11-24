// An Intent story's Notes as a reader meets them from Intent → Changes: the
// Purpose reading whose controls start a note, the composer naming where the
// note comes from, saving it, and a saved note in the story's Notes.
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { storyNotesNames as names } from "../../test-support/storyNotesNames.ts";

export const notesDialog = page.getByRole("dialog", {
  name: names.dialog,
  exact: true,
});
export const purpose = page.getByRole("region", {
  name: "Purpose",
  exact: true,
});
const noteText = notesDialog.getByRole("textbox", {
  name: names.field,
  exact: true,
});

// The open composer names each of `context`, and returns its words.
export async function expectComposerNames(context: readonly string[]) {
  await expect.element(noteText).toBeVisible();
  const composer = noteText.element().closest("form")?.textContent ?? "";
  for (const text of context) expect(composer).toContain(text);
  return composer;
}

export async function saveNote(text: string) {
  await userEvent.fill(noteText, text);
  await notesDialog
    .getByRole("button", { name: names.save, exact: true })
    .click();
  await expect.element(notesDialog).not.toBeInTheDocument();
}

// Opens the story's Notes from its header and returns the saved note holding
// `text` once it shows.
export async function savedNote(header: Locator, text: string) {
  await header.getByRole("button", { name: names.control }).click();
  const entry = notesDialog
    .getByRole("list", { name: names.savedNotes })
    .getByRole("listitem")
    .filter({ hasText: text });
  await expect.element(entry).toBeVisible();
  return entry.element().textContent;
}
