import type { Page } from "@playwright/test";

export const settings = (page: Page) =>
  page.getByRole("button", { name: "System settings", exact: true });
export const back = (page: Page) =>
  page.getByRole("button", { name: "Back to dashboard", exact: true });
export const hideButton = (page: Page, label: string) =>
  page.getByRole("button", { name: `Hide project ${label}`, exact: true });
export const showButton = (page: Page, label: string) =>
  page.getByRole("button", { name: `Show project ${label}`, exact: true });
export const removeButton = (page: Page, label: string) =>
  page.getByRole("button", { name: `Remove project ${label}`, exact: true });
export const projectRow = (page: Page, label: string) =>
  page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: label, exact: true }),
  });
// The confirmation a project's Remove opens, naming that project.
export const removeDialog = (page: Page, label: string) =>
  page.getByRole("dialog", { name: `Remove ${label}?`, exact: true });
// Confirms that project's removal in its open confirmation.
export const confirmRemoval = (page: Page, label: string) =>
  removeDialog(page, label)
    .getByRole("button", { name: "Remove", exact: true })
    .click();
