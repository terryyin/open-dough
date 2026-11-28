// The browser's Back, Forward and reload follow the developer's project and
// perspective choices, and System settings returns to the page it was opened
// from, even after a reload. Open Dough and Doughnut publish catalog stories
// that neither configures Intent locations for. The mounted
// development-intent-frame specs cover each perspective's content.

import { catalogPublications } from "../../dashboard/test-support/catalogProjectRecords.ts";
import {
  chooseProject,
  expectProjectChoice,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectAddress,
  expectNotConfiguredIntent,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  doughnutProject,
  expectCatalogStories,
  openDoughProject,
} from "../../dashboard/test-support/projectCatalogJourney.ts";
import { publishCommittedFiles } from "../../dashboard/test-support/committedFiles.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import {
  back,
  settings,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";

test.use({
  projectFolders: ["open-dough", "doughnut"],
  viewport: { width: 1440, height: 900 },
});

test("Back, Forward, reload and System settings return to the chosen project and perspective", async ({
  page,
}) => {
  const view =
    await test.step("Given Open Dough's published Development stories", async () => {
      for (const publication of [
        catalogPublications.openDough,
        catalogPublications.doughnut,
      ])
        publishCommittedFiles(page, publication);
      await page.goto("/");
      await expectCatalogStories(page, openDoughProject);
      return sidePanelPages(page);
    });
  await test.step("When I read Open Dough's Intent and then choose Doughnut", async () => {
    await view.phase("Choose Intent", ({ perspective }) =>
      perspective.choose("Intent"),
    );
    await expectNotConfiguredIntent(page, "Open Dough");
    await chooseProject(page, "Doughnut");
    await expectNotConfiguredIntent(page, "Doughnut");
  });

  await test.step("When I go Back twice", async () => {
    await page.goBack();
    await expectNotConfiguredIntent(page, "Open Dough");
    await page.goBack();
  });
  await test.step("Then I see Open Dough's Board at the default address", async () => {
    await expectCatalogStories(page, openDoughProject);
    await expect(parts(page).development).toBeChecked();
    expectAddress(page, { project: null, perspective: null });
  });
  await test.step("When I go Forward twice and reload", async () => {
    await page.goForward();
    await expectNotConfiguredIntent(page, "Open Dough");
    await page.goForward();
    await page.reload();
  });
  await test.step("Then Doughnut's Intent still matches the address", async () => {
    await expectProjectChoice(page, "Doughnut");
    await expectNotConfiguredIntent(page, "Doughnut");
    expectAddress(page, { project: "doughnut", perspective: "intent" });
  });

  const heading = page.getByRole("heading", {
    name: "System settings",
    exact: true,
  });
  await test.step("When I open System settings, reload, and go Back", async () => {
    await settings(page).click();
    await expect(heading).toBeFocused();
    await page.reload();
    await expect(heading).toBeVisible();
    await back(page).click();
  });
  await test.step("Then Doughnut's Intent returns with focus on System settings", async () => {
    await expectNotConfiguredIntent(page, "Doughnut");
    await expect(settings(page)).toBeFocused();
    expectAddress(page, { project: "doughnut", perspective: "intent" });
  });
  await test.step("When I return to Development and reload", async () => {
    await view.phase("Choose Development", ({ perspective }) =>
      perspective.choose("Development"),
    );
    await page.reload();
  });
  await test.step("Then Development shows Doughnut's own Board", async () => {
    await expectProjectChoice(page, "Doughnut");
    await expect(parts(page).development).toBeChecked();
    await expectCatalogStories(page, doughnutProject);
    await expect(parts(page).board).not.toContainText(openDoughProject.taken);
  });
});
