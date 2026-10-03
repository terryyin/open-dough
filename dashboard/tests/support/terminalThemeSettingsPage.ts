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

// Each palette's background, text and red, as the browser computes them.
export const computedPalettes = {
  Default: {
    background: "rgb(0, 0, 0)",
    foreground: "rgb(255, 255, 255)",
    red: "rgb(204, 0, 0)",
  },
  Light: {
    background: "rgb(255, 255, 255)",
    foreground: "rgb(31, 35, 40)",
    red: "rgb(207, 34, 46)",
  },
  "Solarized Dark": {
    background: "rgb(0, 43, 54)",
    foreground: "rgb(131, 148, 150)",
    red: "rgb(220, 50, 47)",
  },
} as const;
export type ComputedPalette = keyof typeof computedPalettes;
