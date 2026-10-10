import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { addedRepository, addedLocalPath } from "./projectAddMachine.ts";

// Adds the sample project through the dialog, which selects it, and waits
// until the sessions read asked after the addition answered with it.
export async function addProjectOnPage(page: Page) {
  const offered = page.waitForResponse(
    async (response) => {
      if (
        !response.url().endsWith("/__agent-launch") ||
        response.status() !== 200
      )
        return false;
      const answer = (await response.json()) as MachineAnswer;
      return answer.definitions.some(
        (definition) => definition.source === "sample-app",
      );
    },
    { timeout: 5_000 },
  );
  await addProjectThroughDialog(page);
  const snapshot = (await (await offered).json()) as MachineAnswer;
  expect(
    snapshot.definitions.some(
      (definition) => definition.source === "sample-app",
    ),
  ).toBe(true);
}

// The dialog's steps alone: the sample project is added and selected, whatever
// the page's reads of the machine's sessions then do.
export async function addProjectThroughDialog(page: Page) {
  if (
    !(await page
      .getByRole("heading", { name: "System settings", exact: true })
      .isVisible())
  )
    await page
      .getByRole("button", { name: "System settings", exact: true })
      .click();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add project", exact: true });
  const url = dialog.getByRole("textbox", { name: "GitHub URL" });
  const local = dialog.getByRole("textbox", { name: "Local path" });
  await expect(url).toBeFocused();
  await url.fill(`https://github.com/${addedRepository}.git`);
  await expect(local).toHaveValue("~/git/sample-app");
  await local.fill(addedLocalPath);
  await url.fill("https://github.com/Example/Sample-App");
  await expect(local).toHaveValue(addedLocalPath);
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page
    .getByRole("button", { name: "Back to dashboard", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "Sample App", exact: true }),
  ).toBeChecked();
}
