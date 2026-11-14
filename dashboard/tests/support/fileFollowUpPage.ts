// File-header Follow up on a Done story's diff in Review changes or Intent
// Purpose (`../../src/FollowUp.tsx`): the control beside the file path, and
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
    ["Workspace", "Default main"],
    ["After checks", "Wait for review"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeChecked();
}
