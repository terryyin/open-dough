// Project selection around hidden projects, against controlled settings
// answers: hiding the selected project moves selection, hiding every project
// leaves settings usable without a Board or Intent, and links or history to a
// hidden project do not present it. Saving the hidden flag per mode is
// ../../../e2e/configuration/project-hide.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../tests/support/frontendSettingsSubstitutes.ts";
import {
  chooseProject,
  expectProjectChoice,
} from "../../tests/dashboardPage.ts";
import {
  openUntilRead,
  untilPublishedWorkRead,
} from "../../tests/pageRequestNotes.ts";
import {
  back,
  hideButton,
  settings,
  showButton,
} from "../../tests/support/systemSettingsPage.ts";

const visibleWithoutDoughnut = ["Open Dough", "Pygardon", "Terry Talks"];

test("hiding the selected project selects another visible project, hiding all projects shows no Board or Intent while keeping settings usable, and deep links or prior history to a hidden project do not present it", async ({
  page,
  frontendServices,
  baseURL,
}) => {
  await installFrontendSettingsSubstitutes(page, frontendServices, {
    projects: productionSeedProjects,
  });
  const allHidden = page.getByRole("heading", {
    name: "All projects are hidden",
    exact: true,
  });
  const taken = page.getByRole("region", { name: "Taken", exact: true });
  await openUntilRead(page, baseURL);
  await chooseProject(page, "Open Dough");
  await chooseProject(page, "Doughnut");

  await settings(page).click();
  await hideButton(page, "Doughnut").click();
  await back(page).click();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Pygardon");
  await expect(page).toHaveURL(`${baseURL}/?project=pygardon`);

  await page.goBack();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Open Dough");
  await expect(page.getByRole("radio", { name: "Doughnut" })).toHaveCount(0);

  await openUntilRead(page, `${baseURL}/?project=doughnut`);
  await expectProjectChoice(page, "Open Dough");
  await expect(page).toHaveURL(`${baseURL}/`);

  await openUntilRead(page, `${baseURL}/?project=doughnut&perspective=intent`);
  await expectProjectChoice(page, "Open Dough");
  await expect(page).toHaveURL(`${baseURL}/?perspective=intent`);

  await settings(page).click();
  for (const label of visibleWithoutDoughnut) {
    await hideButton(page, label).click();
    await expect(showButton(page, label)).toBeVisible();
  }
  await expect(
    page.getByText("No projects configured. Add a project to get started."),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Projects", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(4);

  await back(page).click();
  await expect(allHidden).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(taken).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Backlog list", exact: true }),
  ).toHaveCount(0);
  await expect(settings(page)).toBeFocused();

  await page.goto(`${baseURL}/?project=open-dough&perspective=intent`);
  await expect(allHidden).toBeVisible();
  await expect(page).toHaveURL(`${baseURL}/`);
  await expect(taken).toHaveCount(0);

  await settings(page).click();
  await showButton(page, "Pygardon").click();
  await back(page).click();
  await untilPublishedWorkRead(page);
  await expectProjectChoice(page, "Pygardon");
  await expect(taken).toBeVisible();
});
