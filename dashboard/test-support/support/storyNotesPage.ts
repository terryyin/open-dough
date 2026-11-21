// Focused Story notes dialog mechanics, shared by frontend and real journeys.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
  storyNotesWaitingDescription,
} from "../../src/storyNote.ts";
import { box, expectOnOneLine } from "../partArrangement.ts";
import { diffNoteActions } from "./storyNotesDiffActions.ts";
import { storyNotesControl } from "../storyCardControls.ts";
import { storyNotesNames as n } from "../storyNotesNames.ts";
export function storyNotesPage(page: Page) {
  const dialog = page.getByRole("dialog", { name: n.dialog, exact: true });
  const field = dialog.getByRole("textbox", { name: n.field, exact: true });
  const announcement = dialog.locator(n.announcement);
  const entries = dialog
    .getByRole("list", { name: n.savedNotes })
    .getByRole("listitem");
  // A saved entry by its note text, wherever the list places it.
  const entry = (text: string) =>
    entries.filter({
      has: page.locator(n.noteText, { hasText: n.exactly(text) }),
    });
  const saveButton = dialog.getByRole("button", {
    name: n.save,
    exact: true,
  });
  const add = async () => {
    await dialog.getByRole("button", { name: n.add, exact: true }).click();
    await expect(
      dialog.getByRole("heading", { name: n.add, exact: true }),
    ).toBeVisible();
  };
  return {
    ...diffNoteActions(page, dialog),
    expectDiffSaved: async () => {
      await expect(dialog).toHaveCount(0);
      await expect(
        page.locator('[aria-live="polite"]').filter({ hasText: n.saved }),
      ).toHaveCount(1);
      await expect(page.getByText(n.saved, { exact: true })).toHaveCount(1);
    },
    expectNoteWithoutLine: async (text: string) => {
      await expect(entry(text)).not.toContainText(/Line [0-9]+/);
    },
    expectNoComposerLine: async () => {
      await expect(dialog.locator("form")).not.toContainText(/Line [0-9]+/);
    },
    open: async (card: Locator, using: "mouse" | "keyboard" = "mouse") => {
      const control = storyNotesControl(card);
      if (using === "keyboard") {
        await control.focus();
        await control.press("Enter");
      } else await control.click();
      await expect(dialog).toBeVisible();
    },
    expectOpenerFocused: async (scope: Locator) => {
      await expect(storyNotesControl(scope)).toBeFocused();
    },
    expectIconBeside: async (scope: Locator, next: Locator) => {
      const control = storyNotesControl(scope);
      await expect(control).toHaveText("");
      await expectOnOneLine([control, next]);
      const icon = await box(control.locator("svg"));
      const nextIcon = await box(next.locator("svg"));
      expect(icon.width).toBe(nextIcon.width);
      expect(icon.height).toBe(nextIcon.height);
    },
    expectComposerContext: async (texts: readonly (string | RegExp)[]) => {
      for (const text of texts)
        await expect(dialog.locator("form")).toContainText(text);
    },
    add,
    // Writes and saves the composer a diff opened; it closes on saving.
    saveDiffNote: async (text: string) => {
      await field.fill(text);
      await saveButton.click();
      await expect(dialog).toHaveCount(0);
    },
    type: async (text: string) => {
      await field.fill(text);
    },
    save: async () => {
      await saveButton.click();
    },
    cancel: async () => {
      await dialog.getByRole("button", { name: n.cancel, exact: true }).click();
    },
    close: async () => {
      await dialog.getByRole("button", { name: n.close, exact: true }).click();
      await expect(dialog).toHaveCount(0);
    },
    expectNotes: async (texts: readonly string[]) => {
      await expect(entries.locator(n.noteText)).toHaveText([...texts]);
    },
    expectNoteState: async (
      index: number,
      state:
        typeof storyNoteWaitingForFollowUp | typeof storyNoteSentToFollowUp,
    ) => {
      await expect(
        entries.nth(index).getByText(state, { exact: true }),
      ).toBeVisible();
    },
    expectEntryActions: async (index: number) => {
      await expect(
        entries.nth(index).getByRole("button", { name: n.edit, exact: true }),
      ).toBeVisible();
      await expect(
        entries.nth(index).getByRole("button", { name: n.delete, exact: true }),
      ).toBeVisible();
    },
    expectWaiting: async (card: Locator, waiting: number) => {
      if (waiting === 0) {
        await expect(
          card.getByRole("status").filter({ hasText: /note(?:s)? waiting/ }),
        ).toHaveCount(0);
        return;
      }
      await expect(
        card
          .getByRole("status")
          .filter({ hasText: storyNotesWaitingDescription(waiting) }),
      ).toBeVisible();
    },
    expectContext: async (title: string, identity: string) => {
      await expect(dialog.getByText(title, { exact: true })).toBeVisible();
      await expect(dialog.getByText(identity, { exact: true })).toBeVisible();
    },
    expectSaved: async () => {
      await expect(announcement).toHaveText(n.saved);
      await expect(page.getByText(n.saved, { exact: true })).toHaveCount(1);
      await expect(field).toHaveCount(0);
      await expect(dialog.getByRole("alert")).toHaveCount(0);
    },
    expectProblem: async (message: string) => {
      await expect(
        dialog.getByRole("alert").filter({ hasText: message }),
      ).toBeVisible();
    },
    expectUnreadable: async (card: Locator, message: string) => {
      await expect(
        card.getByRole("status").filter({ hasText: message }),
      ).toBeVisible();
      await expect(card.getByRole("button", { name: n.counted })).toHaveCount(
        0,
      );
    },
    expectComposing: async (text: string) => {
      await expect(field).toBeVisible();
      await expect(field).toHaveValue(text);
    },
    expectNoteContext: async (text: string, context: string | RegExp) => {
      await expect(entry(text)).toContainText(context);
    },
    expectCount: async (card: Locator, count: number) => {
      await expect(
        card.getByRole("button", {
          name: n.count(count),
          exact: true,
        }),
      ).toBeVisible();
    },
  };
}
