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
  return {
    control,
    expectChecked: async (waiting: number, total: number) => {
      await expect(control).toBeEnabled();
      await expect(control).toBeChecked();
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
    uncheck: async () => {
      await control.uncheck();
      await expect(control).not.toBeChecked();
    },
  };
}
