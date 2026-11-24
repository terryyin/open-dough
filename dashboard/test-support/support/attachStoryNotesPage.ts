// Attach story notes in a Done story's Follow up Start session dialog
// (`../../src/AttachStoryNotes.tsx`).
import { expect, type Locator } from "@playwright/test";
import {
  attachStoryNotesDetail,
  attachStoryNotesLabel,
  attachStoryNotesNone,
} from "../../src/attachStoryNotesWords.ts";
import { storyNotesUnreadable } from "../../src/storyNotesReadSource.ts";

export function attachStoryNotes(dialog: Locator) {
  const control = dialog.getByRole("checkbox", {
    name: attachStoryNotesLabel,
    exact: true,
  });
  const summary = dialog.getByText("Waiting note details", { exact: true });
  return {
    expectChoice: async (checked: boolean, waiting: number, total: number) => {
      await expect(control).toBeEnabled();
      await expect(control).toBeChecked({ checked });
      await expect(control).toHaveAccessibleDescription(
        attachStoryNotesDetail(waiting, total),
      );
    },
    expectUnavailableNone: async () => {
      await expect(control).toBeDisabled();
      await expect(control).not.toBeChecked();
      await expect(control).toHaveAccessibleDescription(attachStoryNotesNone);
    },
    expectUnavailableUnreadable: async () => {
      await expect(control).toBeDisabled();
      await expect(control).not.toBeChecked();
      await expect(control).toHaveAccessibleDescription(storyNotesUnreadable);
    },
    async select() {
      await control.check();
    },
    async toggleDetailsByKeyboard() {
      await summary.press("Enter");
    },
    async expectDetails(text: string, visible: boolean) {
      const note = dialog.getByText(text, { exact: true });
      if (visible) await expect(note).toBeVisible();
      else await expect(note).toBeHidden();
    },
  };
}
