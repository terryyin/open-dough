// System settings as a view of the dashboard frame, against controlled
// settings answers: it shows each configured project's local facts, returns
// to the view it was opened from with focus, and browser history keeps the
// selected project. The settings facts endpoint's own answer and refusals are
// ../../../e2e/configuration/system-settings-client-configuration.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../tests/support/frontendSettingsSubstitutes.ts";
import {
  back,
  projectRow,
  settings,
} from "../../tests/support/systemSettingsPage.ts";
import { expectFrameIconControl } from "../../tests/frameIconControl.ts";

test("global settings has narrow local facts, returns to roster with focus, and browser back/forward keeps project selection", async ({
  page,
  frontendServices,
}) => {
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: productionSeedProjects,
  });
  await page.goto("/?project=doughnut&view=roster");
  await expect(
    page.getByRole("heading", { name: "Agent roster", exact: true }),
  ).toBeVisible();
  await expectFrameIconControl(settings(page), "System settings");
  await settings(page).click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeFocused();
  for (const project of productionSeedProjects) {
    const row = projectRow(page, project.label);
    await expect(row).toContainText(project.repository);
    await expect(row).toContainText(project.localPath);
  }
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("heading", { name: "Agent roster", exact: true }),
  ).toBeVisible();
  await expect(settings(page)).toBeFocused();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(settings(page)).toBeFocused();
  await expect(
    page.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
});
