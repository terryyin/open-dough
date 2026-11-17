// The standing authorization's controls and saved-choice status in System settings.
import type { Page } from "@playwright/test";

export const section = (page: Page) =>
  page.getByRole("region", { name: "Feedback maintenance", exact: true });
export const status = (page: Page) =>
  section(page)
    .getByRole("status")
    .filter({ hasText: "Feedback maintenance:" });
const host = (page: Page) => section(page).getByLabel("Host", { exact: true });
const model = (page: Page) =>
  section(page).getByLabel("Model", { exact: true });
const button = (page: Page, name: string) =>
  section(page).getByRole("button", { name, exact: true });
export const selectedHost = (page: Page) =>
  host(page).locator("option:checked");
export const selectedModel = (page: Page) =>
  model(page).locator("option:checked");
export const problem = (page: Page) => section(page).getByRole("alert");
export const turnOffButton = (page: Page) => button(page, "Turn off");
export const chooseModel = (page: Page, label: string) =>
  model(page).selectOption({ label });
export const turnOn = (page: Page) => button(page, "Turn on").click();
export const saveChoice = (page: Page) =>
  button(page, "Save feedback maintenance").click();
export const turnOff = (page: Page) => turnOffButton(page).click();
export const retryStatus = (page: Page) => button(page, "Retry status").click();
