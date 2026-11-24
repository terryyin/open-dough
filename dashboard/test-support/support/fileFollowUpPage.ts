// File-header Follow up on a Done story's diff in Review changes or Intent
// Purpose (`../../src/StoryAnchoredFollowUp.tsx`): the control beside the file path, and
// the Start session dialog's follow-up context list.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { radio } from "./sessionDialog.ts";

export const fileFollowUp = (scope: Locator, storyName: string) =>
  scope.getByRole("button", { name: `Follow up ${storyName}`, exact: true });

export const followUpContextList = (dialog: Locator) =>
  dialog.getByRole("list", { name: "Follow-up context" }).getByRole("listitem");

export const fileFollowUpDialog = (page: Page, project = "Open Dough") =>
  startSessionDialog(page, project);

export { startSessionField };

export async function openFileFollowUp(
  page: Page,
  scope: Locator,
  storyName: string,
) {
  await fileFollowUp(scope, storyName).click();
  const dialog = fileFollowUpDialog(page);
  await expect(dialog).toBeVisible();
  return followUpComposer(dialog);
}

export function followUpComposer(dialog: Locator) {
  const sessions = dialog.getByRole("group", { name: "Attach sessions" });
  return {
    async start(instruction?: string) {
      if (instruction !== undefined)
        await startSessionField(dialog).fill(instruction);
      await dialog.getByRole("button", { name: "Start", exact: true }).click();
    },
    async cancel() {
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    },
    async expectSessionChoices(count: number) {
      await expect(sessions.getByRole("checkbox")).toHaveCount(count);
    },
    session(name: string | RegExp) {
      const row = sessions.locator(".follow-up-session").filter({
        has: dialog.page().getByRole("checkbox", { name, exact: true }),
      });
      const choice = row.getByRole("checkbox");
      const disclosure = row.locator("details");
      return {
        async toggleSelectionByKeyboard() {
          await choice.press("Space");
        },
        async toggleDetailsByKeyboard() {
          await disclosure.locator("summary").press("Enter");
        },
        async expectSelection(checked: boolean) {
          await expect(choice).toBeChecked({ checked });
        },
        async expectChoiceState({
          checked,
          detailsOpen,
        }: {
          checked: boolean;
          detailsOpen: boolean;
        }) {
          await expect(choice).toBeChecked({ checked });
          await expect(disclosure).toHaveJSProperty("open", detailsOpen);
        },
        async expectDetails(...items: string[]) {
          for (const text of items)
            await expect(
              disclosure.getByText(text, { exact: true }),
            ).toBeVisible();
        },
      };
    },
  };
}

// The existing Start session dialog after file Follow up: subject, file
// context lines, blank instruction, and the same Workspace / After checks
// defaults.
export async function expectFileFollowUpDialog(
  dialog: Locator,
  storyName: string,
  context: readonly (string | RegExp)[],
) {
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`Follows up ${storyName}`);
  await expect(followUpContextList(dialog)).toContainText([...context]);
  await expect(startSessionField(dialog)).toHaveValue("");
  for (const [group, name] of [
    ["Workspace", "Execution checkout"],
    ["After checks", "Wait for review"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeChecked();
}
