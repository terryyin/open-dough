import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";

export const settingsButton = page.getByRole("button", {
  name: "System settings",
  exact: true,
});
export const settingsHeading = page.getByRole("heading", {
  name: "System settings",
  exact: true,
});
export const backToDashboard = page.getByRole("button", {
  name: "Back to dashboard",
  exact: true,
});
export const settingsRegion = (name: string) =>
  page.getByRole("region", { name, exact: true });

export async function openSystemSettings() {
  await userEvent.click(settingsButton);
  await expect.element(settingsHeading).toHaveFocus();
}
