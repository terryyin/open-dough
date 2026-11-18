import { expect, type Locator, type Page } from "@playwright/test";

export function diffNoteActions(page: Page, dialog: Locator) {
  const lineMenu = page.getByRole("menu");
  const lineNumber = (scope: Locator, side: "old" | "new", line: number) =>
    scope.getByRole("button", {
      name: `${side === "old" ? "Old" : "New"} line ${line}`,
      exact: true,
    });
  const chooseAddNote = async () => {
    await lineMenu
      .getByRole("menuitem", { name: "Add note", exact: true })
      .click();
    await expect(dialog).toBeVisible();
  };
  return {
    fromFile: async (scope: Locator) => {
      await scope
        .getByRole("button", { name: "Add note", exact: true })
        .click();
      await expect(dialog).toBeVisible();
    },
    lineActions: async (scope: Locator, side: "old" | "new", line: number) => {
      await lineNumber(scope, side, line).click();
      return lineMenu.getByRole("menuitem");
    },
    chooseAddNote,
    fromLine: async (scope: Locator, side: "old" | "new", line: number) => {
      await lineNumber(scope, side, line).click();
      await chooseAddNote();
    },
  };
}
