// The mounted Story notes page: the cues of the Playwright page object
// (../support/storyNotesPage.ts) under the same names, reading the same names
// (../storyNotesNames.ts).
import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
  storyNotesWaitingDescription,
} from "../../src/storyNote.ts";
import { storyNotesNames as n } from "../storyNotesNames.ts";
import { click, fill, press } from "./mountedActInput.ts";

export function storyNotesPage() {
  const dialog = page.getByRole("dialog", { name: n.dialog, exact: true });
  const field = dialog.getByRole("textbox", { name: n.field, exact: true });
  const entries = dialog
    .getByRole("list", { name: n.savedNotes })
    .getByRole("listitem");
  const noteTexts = () =>
    entries.elements().map((item) => item.querySelector(n.noteText));
  // A saved entry's whole text, found by its note text.
  const entryText = (text: string) =>
    noteTexts()
      .find((note) => note?.textContent === text)
      ?.closest("li")?.textContent;
  const inDialog = (selector: string) =>
    dialog.query()?.querySelector(selector)?.textContent;
  const action = (index: number, name: string) =>
    entries.nth(index).getByRole("button", { name, exact: true });
  const question = (index: number) =>
    entries.nth(index).getByRole("group", { name: n.deleteQuestion });
  const add = async () => {
    await click(dialog.getByRole("button", { name: n.add, exact: true }));
    await expect
      .element(dialog.getByRole("heading", { name: n.add, exact: true }))
      .toBeVisible();
  };
  return {
    expectCount: async (card: Locator, count: number) => {
      await expect
        .element(
          card.getByRole("button", { name: n.count(count), exact: true }),
        )
        .toBeVisible();
    },
    expectUnreadable: async (card: Locator, message: string) => {
      await expect
        .element(card.getByRole("status").filter({ hasText: message }))
        .toBeVisible();
      expect(card.getByRole("button", { name: n.counted }).elements()).toEqual(
        [],
      );
    },
    open: async (card: Locator) => {
      await click(card.getByRole("button", { name: n.control }));
      await expect.element(dialog).toBeVisible();
    },
    expectProblem: async (message: string) => {
      await expect
        .element(dialog.getByRole("alert").filter({ hasText: message }))
        .toBeVisible();
    },
    add,
    addNote: async (text: string) => {
      await add();
      await fill(field, text);
      await click(dialog.getByRole("button", { name: n.save, exact: true }));
      await expect.element(field).not.toBeInTheDocument();
    },
    expectContext: async (title: string, identity: string) => {
      await expect
        .element(dialog.getByText(title, { exact: true }))
        .toBeVisible();
      await expect
        .element(dialog.getByText(identity, { exact: true }))
        .toBeVisible();
    },
    expectSaved: async () => {
      await expect.poll(() => inDialog(n.announcement)).toBe(n.saved);
      expect(page.getByText(n.saved, { exact: true }).elements()).toHaveLength(
        1,
      );
      await expect.element(field).not.toBeInTheDocument();
      expect(dialog.getByRole("alert").elements()).toEqual([]);
    },
    expectEntryActions: async (index: number) => {
      await expect.element(action(index, n.edit)).toBeVisible();
      await expect.element(action(index, n.delete)).toBeVisible();
    },
    type: async (text: string) => {
      await fill(field, text);
    },
    save: async () => {
      await click(dialog.getByRole("button", { name: n.save, exact: true }));
    },
    expectComposing: async (text: string) => {
      await expect.element(field).toBeVisible();
      await expect.element(field).toHaveValue(text);
    },
    edit: async (index: number, using: "mouse" | "keyboard" = "mouse") => {
      const control = action(index, n.edit);
      await (using === "keyboard" ? press(control) : click(control));
      await expect
        .element(
          dialog.getByRole("heading", { name: n.editHeading, exact: true }),
        )
        .toBeVisible();
    },
    expectComposerFocused: async () => {
      await expect.element(field).toHaveFocus();
    },
    expectComposerContext: async (texts: readonly string[]) => {
      for (const text of texts)
        await expect.poll(() => inDialog("form")).toContain(text);
    },
    cancel: async () => {
      await click(dialog.getByRole("button", { name: n.cancel, exact: true }));
    },
    delete: async (index: number) => {
      await click(action(index, n.delete));
      await expect.element(question(index)).toBeVisible();
    },
    expectDeleteCancelFocused: async (index: number) => {
      await expect.element(action(index, n.cancel)).toHaveFocus();
    },
    answerDelete: async (index: number, answer: "Delete" | "Cancel") => {
      await click(
        question(index).getByRole("button", { name: answer, exact: true }),
      );
    },
    expectActionFocused: async (
      name: "Edit" | "Delete" | "Add note",
      index = 0,
    ) => {
      const holder = name === "Add note" ? dialog : entries.nth(index);
      await expect
        .element(holder.getByRole("button", { name, exact: true }))
        .toHaveFocus();
    },
    expectAnnouncement: async (message: string) => {
      await expect.poll(() => inDialog(n.announcement)).toBe(message);
      expect(page.getByText(message, { exact: true }).elements()).toHaveLength(
        1,
      );
      await expect.element(field).not.toBeInTheDocument();
    },
    expectNotes: async (texts: readonly string[]) => {
      await expect
        .poll(() => noteTexts().map((note) => note?.textContent))
        .toEqual([...texts]);
    },
    expectNoteContext: async (text: string, context: string) => {
      await expect.poll(() => entryText(text)).toContain(context);
    },
    expectNoteState: async (
      index: number,
      state:
        typeof storyNoteWaitingForFollowUp | typeof storyNoteSentToFollowUp,
    ) => {
      await expect
        .element(entries.nth(index).getByText(state, { exact: true }))
        .toBeVisible();
    },
    expectWaiting: async (card: Locator, waiting: number) => {
      const statuses = card
        .getByRole("status")
        .filter({ hasText: /note(?:s)? waiting/ });
      if (waiting === 0) {
        await expect.poll(() => statuses.elements()).toEqual([]);
        return;
      }
      await expect
        .element(
          statuses.filter({ hasText: storyNotesWaitingDescription(waiting) }),
        )
        .toBeVisible();
    },
    close: async () => {
      await click(dialog.getByRole("button", { name: n.close, exact: true }));
      await expect.element(dialog).not.toBeInTheDocument();
    },
  };
}
