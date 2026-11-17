import path from "node:path";
import { expect, type Page } from "@playwright/test";

export const syntaxStylingFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/syntax-styling.json");
export const syntaxStylingChoice = (page: Page) =>
  page.getByRole("combobox", { name: "Syntax styling", exact: true });
export const syntaxStylingSection = (page: Page) =>
  page.getByRole("region", { name: "Syntax styling", exact: true });

export async function expectSyntaxStylingShown(
  page: Page,
  label: "Off" | "Default",
) {
  await expect(syntaxStylingChoice(page).locator("option:checked")).toHaveText(
    label,
  );
}
