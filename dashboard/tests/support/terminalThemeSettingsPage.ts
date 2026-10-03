import path from "node:path";
import type { Page } from "@playwright/test";

export const terminalThemeFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/terminal-theme.json");
export const themeChoice = (page: Page) =>
  page.getByRole("combobox", { name: "Terminal theme", exact: true });
export const sample = (page: Page) =>
  page.getByRole("figure", { name: /^Sample: / });
export const sampleScreen = (page: Page) => sample(page).locator("pre");
export const sampleColor = (page: Page, name: string) =>
  sampleScreen(page).getByText(name, { exact: true });
