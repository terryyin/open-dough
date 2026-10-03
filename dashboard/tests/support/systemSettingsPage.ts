import type { Page } from "@playwright/test";

export const settings = (page: Page) =>
  page.getByRole("button", { name: "System settings", exact: true });
export const back = (page: Page) =>
  page.getByRole("button", { name: "Back to dashboard", exact: true });
