// Story notes as a reader meets them from the Review changes panel
// (./story-review-panel-page.ts): the Notes icon beside Refresh, a file's
// Add note and a diff line's menu, the composer with the context it records,
// and the Story notes dialog the icon opens.
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { lineNumberLabel, type DiffLineSide } from "../../src/diffLineSide.ts";
import { storyNotesNames as n } from "../../test-support/storyNotesNames.ts";
import { box } from "./story-review-details-view.ts";

export function reviewNotes(region: Locator, refresh: Locator) {
  const control = region.getByRole("button", { name: n.control });
  const dialog = page.getByRole("dialog", { name: n.dialog, exact: true });
  const field = dialog.getByRole("textbox", { name: n.field, exact: true });
  const composer = () => dialog.element().querySelector("form")?.textContent;
  const diff = (file: string) =>
    region.getByRole("region", { name: file, exact: true });
  const listed = () =>
    [...dialog.element().querySelectorAll(n.noteText)].map(
      (found) => found.textContent,
    );

  const notes = {
    // The Notes icon, with no words, on Refresh's line at Refresh's size.
    async expectNotesIconBesideRefresh() {
      await expect.element(control).toHaveTextContent("");
      const notesAt = box(control.element());
      const refreshAt = box(refresh.element());
      const middle = (at: DOMRect) => at.y + at.height / 2;
      expect(Math.abs(middle(notesAt) - middle(refreshAt))).toBeLessThan(2);
      const icon = box(control.element().querySelector("svg"));
      const refreshIcon = box(refresh.element().querySelector("svg"));
      expect(icon.width).toBe(refreshIcon.width);
      expect(icon.height).toBe(refreshIcon.height);
      return notes;
    },

    async addNoteFromFile(file: string) {
      await diff(file)
        .getByRole("button", { name: n.add, exact: true })
        .click();
      await expect.element(dialog).toBeVisible();
      return notes;
    },

    // The words of the menu a diff line's number opens.
    async lineActions(file: string, side: DiffLineSide, line: number) {
      await diff(file)
        .getByRole("button", { name: lineNumberLabel(side, line), exact: true })
        .click();
      const menu = page.getByRole("menu");
      await expect.element(menu).toBeVisible();
      return [...menu.element().querySelectorAll("[role=menuitem]")].map(
        (item) => item.textContent,
      );
    },

    // The composer opens alone, with no saved notes listed.
    async expectComposerAlone() {
      await expect.element(field).toBeVisible();
      expect(
        dialog.getByRole("list", { name: n.savedNotes }).query(),
      ).toBeNull();
      return notes;
    },

    // The composer shows each of `texts`, and no line.
    async expectComposerSaysWithoutLine(texts: readonly string[]) {
      await expect.element(field).toBeVisible();
      for (const text of texts) expect(composer()).toContain(text);
      expect(composer()).not.toMatch(/Line [0-9]+/);
      return notes;
    },

    // Saving closes the composer and announces the save once.
    async saveNote(text: string) {
      await userEvent.fill(field, text);
      await dialog.getByRole("button", { name: n.save, exact: true }).click();
      await expect.element(dialog).not.toBeInTheDocument();
      await expect
        .element(page.getByText(n.saved, { exact: true }))
        .toBeInTheDocument();
      expect(page.getByText(n.saved, { exact: true }).all()).toHaveLength(1);
      expect(
        [...document.querySelectorAll('[aria-live="polite"]')].filter((live) =>
          live.textContent.includes(n.saved),
        ),
      ).toHaveLength(1);
      return notes;
    },

    async expectNotesCounted(count: number) {
      await expect
        .element(
          region.getByRole("button", { name: n.count(count), exact: true }),
        )
        .toBeVisible();
      return notes;
    },

    async openNotesByKeyboard() {
      (control.element() as HTMLElement).focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(dialog).toBeVisible();
      return notes;
    },

    // Story notes names the story and lists `texts`.
    async expectStoryNotes(title: string, identity: string, texts: string[]) {
      await expect
        .element(dialog.getByText(title, { exact: true }))
        .toBeVisible();
      await expect
        .element(dialog.getByText(identity, { exact: true }))
        .toBeVisible();
      await expect.poll(listed).toEqual(texts);
      return notes;
    },

    // The saved note `text` lists `context` beside it.
    async expectNoteSays(text: string, context: string) {
      const entry = dialog
        .getByRole("list", { name: n.savedNotes })
        .getByRole("listitem")
        .filter({ hasText: text });
      await expect.element(entry).toBeVisible();
      expect(entry.element().textContent).toContain(context);
      return notes;
    },

    async closeNotes() {
      await dialog.getByRole("button", { name: n.close, exact: true }).click();
      await expect.element(dialog).not.toBeInTheDocument();
      return notes;
    },

    async expectNotesOpenerFocused() {
      await expect.element(control).toHaveFocus();
      return notes;
    },
  };
  return notes;
}
