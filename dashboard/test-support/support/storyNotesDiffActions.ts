import { expect, type Locator, type Page } from "@playwright/test";
import { lineNumberLabel, type DiffLineSide } from "../../src/diffLineSide.ts";
import { storyNotesNames as n } from "../storyNotesNames.ts";

export function diffNoteActions(page: Page, dialog: Locator) {
  const lineMenu = page.getByRole("menu");
  const lineNumber = (scope: Locator, side: DiffLineSide, line: number) =>
    scope.getByRole("button", {
      name: lineNumberLabel(side, line),
      exact: true,
    });
  const chooseAddNote = async () => {
    await lineMenu.getByRole("menuitem", { name: n.add, exact: true }).click();
    await expect(dialog).toBeVisible();
  };
  return {
    fromFile: async (scope: Locator) => {
      await scope.getByRole("button", { name: n.add, exact: true }).click();
      await expect(dialog).toBeVisible();
    },
    lineActions: async (scope: Locator, side: DiffLineSide, line: number) => {
      await lineNumber(scope, side, line).click();
      return lineMenu.getByRole("menuitem");
    },
    chooseAddNote,
    fromLine: async (scope: Locator, side: DiffLineSide, line: number) => {
      await lineNumber(scope, side, line).click();
      await chooseAddNote();
    },
  };
}
