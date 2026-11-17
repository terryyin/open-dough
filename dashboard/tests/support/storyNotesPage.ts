// Focused Story notes dialog mechanics, shared by frontend and real journeys.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
  storyNotesWaitingDescription,
} from "../../src/storyNote.ts";
import { storyNotesControl } from "../storyCardControls.ts";
export function storyNotesPage(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Story notes", exact: true });
  const field = dialog.getByRole("textbox", { name: "Note text", exact: true });
  const announcement = dialog.locator(".launch-dialog-body > [role='status']");
  const entries = dialog
    .getByRole("list", { name: "Saved notes" })
    .getByRole("listitem");
  return {
    fromFile: async (scope: Locator) => {
      await scope
        .getByRole("button", { name: "Add note", exact: true })
        .click();
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole("list", { name: "Saved notes" }),
      ).toHaveCount(0);
    },
    fromLine: async (
      scope: Locator,
      side: "old" | "new",
      line: number,
      actions = ["Follow up", "Add note"],
    ) => {
      await scope
        .getByRole("button", {
          name: `${side === "old" ? "Old" : "New"} line ${line}`,
          exact: true,
        })
        .click();
      const menu = page.getByRole("menu");
      await expect(menu.getByRole("menuitem")).toHaveText(actions);
      await menu
        .getByRole("menuitem", { name: "Add note", exact: true })
        .click();
      await expect(dialog).toBeVisible();
    },
    expectDiffSaved: async () => {
      await expect(dialog).toHaveCount(0);
      await expect(
        page
          .locator('[aria-live="polite"]')
          .filter({ hasText: "Note saved to this story." }),
      ).toHaveCount(1);
      await expect(
        page.getByText("Note saved to this story.", { exact: true }),
      ).toHaveCount(1);
    },
    expectEntryNoLine: async (index: number) => {
      await expect(entries.nth(index)).not.toContainText(/Line [0-9]+/);
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
    edit: async (index: number, using: "mouse" | "keyboard" = "mouse") => {
      const control = entries
        .nth(index)
        .getByRole("button", { name: "Edit", exact: true });
      if (using === "keyboard") {
        await control.focus();
        await control.press("Enter");
      } else await control.click();
      await expect(
        dialog.getByRole("heading", { name: "Edit note", exact: true }),
      ).toBeVisible();
      await expect(field).toBeFocused();
    },
    delete: async (index: number) => {
      await entries
        .nth(index)
        .getByRole("button", { name: "Delete", exact: true })
        .click();
      await expect(
        entries.nth(index).getByRole("group", { name: "Delete this note?" }),
      ).toBeVisible();
      await expect(
        entries.nth(index).getByRole("button", { name: "Cancel", exact: true }),
      ).toBeFocused();
    },
    answerDelete: async (index: number, answer: "Delete" | "Cancel") => {
      await entries
        .nth(index)
        .getByRole("group", { name: "Delete this note?" })
        .getByRole("button", { name: answer, exact: true })
        .click();
    },
    expectActionFocused: async (
      action: "Edit" | "Delete" | "Add note",
      index = 0,
    ) => {
      const holder = action === "Add note" ? dialog : entries.nth(index);
      await expect(
        holder.getByRole("button", { name: action, exact: true }),
      ).toBeFocused();
    },
    expectAnnouncement: async (message: string) => {
      await expect(announcement).toHaveText(message);
      await expect(page.getByText(message, { exact: true })).toHaveCount(1);
      await expect(field).toHaveCount(0);
    },
    expectComposerContext: async (texts: readonly (string | RegExp)[]) => {
      for (const text of texts)
        await expect(dialog.locator("form")).toContainText(text);
    },
    add: async () => {
      await dialog
        .getByRole("button", { name: "Add note", exact: true })
        .click();
      await expect(
        dialog.getByRole("heading", { name: "Add note", exact: true }),
      ).toBeVisible();
    },
    type: async (text: string) => {
      await field.fill(text);
    },
    save: async () => {
      await dialog
        .getByRole("button", { name: "Save note", exact: true })
        .click();
    },
    cancel: async () => {
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    },
    close: async () => {
      await dialog.getByRole("button", { name: "Close", exact: true }).click();
      await expect(dialog).toHaveCount(0);
    },
    expectNotes: async (texts: readonly string[]) => {
      await expect(entries.locator(".story-note-text")).toHaveText([...texts]);
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
        entries.nth(index).getByRole("button", { name: "Edit", exact: true }),
      ).toBeVisible();
      await expect(
        entries.nth(index).getByRole("button", { name: "Delete", exact: true }),
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
      await expect(announcement).toHaveText("Note saved to this story.");
      await expect(
        page.getByText("Note saved to this story.", { exact: true }),
      ).toHaveCount(1);
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
      await expect(card.getByRole("button", { name: /^Notes \(/ })).toHaveCount(
        0,
      );
    },
    expectComposing: async (text: string) => {
      await expect(field).toBeVisible();
      await expect(field).toHaveValue(text);
    },
    expectEntryContext: async (index: number, text: string | RegExp) => {
      await expect(entries.nth(index)).toContainText(text);
    },
    expectCount: async (card: Locator, count: number) => {
      await expect(
        card.getByRole("button", {
          name: count ? `Notes (${count})` : "Notes",
          exact: true,
        }),
      ).toBeVisible();
    },
  };
}
