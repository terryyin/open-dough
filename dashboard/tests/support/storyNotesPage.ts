// Focused Story notes dialog mechanics, shared by frontend and real journeys.
import { expect, type Locator, type Page } from "@playwright/test";
import { storyNotesControl } from "../storyCardControls.ts";
export function storyNotesPage(page: Page) {
  const dialog = page.getByRole("dialog", { name: "Story notes", exact: true });
  const field = dialog.getByRole("textbox", { name: "Note text", exact: true });
  const entries = dialog
    .getByRole("list", { name: "Saved notes" })
    .getByRole("listitem");
  return {
    open: async (card: Locator, using: "mouse" | "keyboard" = "mouse") => {
      const control = storyNotesControl(card);
      if (using === "keyboard") {
        await control.focus();
        await control.press("Enter");
      } else await control.click();
      await expect(dialog).toBeVisible();
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
    expectContext: async (title: string, identity: string) => {
      await expect(dialog.getByText(title, { exact: true })).toBeVisible();
      await expect(dialog.getByText(identity, { exact: true })).toBeVisible();
    },
    expectSaved: async () => {
      await expect(dialog.getByRole("status")).toHaveText(
        "Note saved to this story.",
      );
      await expect(
        page.getByText("Note saved to this story.", { exact: true }),
      ).toHaveCount(1);
    },
    expectComposing: async (text: string) => {
      await expect(field).toBeVisible();
      await expect(field).toHaveValue(text);
    },
    expectEntryContext: async (index: number, text: string) => {
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
