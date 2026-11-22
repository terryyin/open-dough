import { catalogPublications } from "../../dashboard/test-support/catalogProjectRecords.ts";
import {
  chooseProject,
  expectProjectChoice,
  parts,
  rosterParts,
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
} from "../../dashboard/test-support/projectKeyboardNavigationJourney.ts";
import { publishFiles } from "../../dashboard/test-support/publishedFiles.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import {
  back,
  settings,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";

test.use({
  projectFolders: ["open-dough", "doughnut"],
  viewport: { width: 1440, height: 900 },
});

test.beforeEach(async ({ page }) => {
  for (const publication of [
    catalogPublications.openDough,
    catalogPublications.doughnut,
  ])
    await publishFiles(page, publication);
});

test("browser history and reload keep the selected project's perspective and Board", async ({
  page,
}) => {
  const view =
    await test.step("Given Open Dough's published Development stories", async () => {
      await page.goto("/");
      await expectCatalogStories(page, openDoughProject);
      return sidePanelPages(page);
    });
  await test.step("When I read Open Dough's Intent", async () => {
    await view.phase("Choose Intent", ({ perspective }) =>
      perspective.choose("Intent"),
    );
    await expectNotConfiguredIntent(page, "Open Dough");
  });
  await test.step("And I choose Doughnut", async () => {
    await chooseProject(page, "Doughnut");
    await expectNotConfiguredIntent(page, "Doughnut");
  });

  await test.step("When I go Back, I reach Open Dough's Intent", async () => {
    await page.goBack();
    await expectProjectChoice(page, "Open Dough");
    await expectNotConfiguredIntent(page, "Open Dough");
  });
  await test.step("And I go Back to Development", () => page.goBack());
  await test.step("Then I see Open Dough's published Board", async () => {
    await expectCatalogStories(page, openDoughProject);
    await expect(parts(page).development).toBeChecked();
  });
  await test.step("And the address names the default Development view", async () => {
    await expect(parts(page).intent).toHaveCount(0);
    expectAddress(page, { project: null, perspective: null });
  });
  await test.step("When I go Forward, I reach Open Dough's Intent", async () => {
    await page.goForward();
    await expectNotConfiguredIntent(page, "Open Dough");
  });
  await test.step("And I go Forward to Doughnut's Intent and reload", async () => {
    await page.goForward();
    await expectNotConfiguredIntent(page, "Doughnut");
    await page.reload();
  });
  await test.step("Then Doughnut's Intent still matches the address", async () => {
    await expectProjectChoice(page, "Doughnut");
    await expectNotConfiguredIntent(page, "Doughnut");
    expectAddress(page, { project: "doughnut", perspective: "intent" });
  });
  await test.step("When I return to Development and reload", async () => {
    await view.phase("Choose Development", ({ perspective }) =>
      perspective.choose("Development"),
    );
    await expectCatalogStories(page, doughnutProject);
    await page.reload();
  });
  await test.step("Then Development still shows Doughnut and its own Board", async () => {
    await expectProjectChoice(page, "Doughnut");
    await expect(parts(page).development).toBeChecked();
    await expectCatalogStories(page, doughnutProject);
  });
  await test.step("And Open Dough's story is absent", () =>
    expect(parts(page).board).not.toContainText(openDoughProject.taken));
});

const rosterIntent = {
  project: "doughnut",
  view: "roster",
  perspective: "intent",
};

test("Settings and its reload return to Intent and leave Development's roster available", async ({
  page,
}) => {
  const { view, roster, heading } =
    await test.step("Given Doughnut's agent roster", async () => {
      const { roster } = rosterParts(page);
      await page.goto("/?project=doughnut&view=roster");
      return {
        view: sidePanelPages(page),
        roster,
        heading: page.getByRole("heading", {
          name: "System settings",
          exact: true,
        }),
      };
    });
  await test.step("When I read Intent instead", async () => {
    await expect(roster).toBeVisible();
    await view.phase("Choose Intent", ({ perspective }) =>
      perspective.choose("Intent"),
    );
  });
  await test.step("Then Doughnut's Intent keeps the roster in its address", async () => {
    await expectNotConfiguredIntent(page, "Doughnut");
    await expect(roster).toBeHidden();
    expectAddress(page, rosterIntent);
  });

  await test.step("When I open Settings and go Back", async () => {
    await settings(page).click();
    await expect(heading).toBeFocused();
    await back(page).click();
  });
  await test.step("Then I return to Doughnut's Intent with focus on System settings", async () => {
    await expectNotConfiguredIntent(page, "Doughnut");
    await expect(settings(page)).toBeFocused();
    expectAddress(page, rosterIntent);
  });
  await test.step("When I reopen Settings and reload", async () => {
    await settings(page).click();
    await expect(heading).toBeVisible();
    await page.reload();
  });
  await test.step("And I go Back from the reloaded Settings", async () => {
    await expect(heading).toBeVisible();
    await back(page).click();
  });
  await test.step("Then Intent and focus return after reload", async () => {
    await expectNotConfiguredIntent(page, "Doughnut");
    await expect(settings(page)).toBeFocused();
    expectAddress(page, rosterIntent);
  });
  await test.step("When I switch to Development", () =>
    view.phase("Choose Development", ({ perspective, intent }) => {
      perspective.choose("Development");
      intent.expectNotShown();
    }));
  await test.step("Then Doughnut's roster is visible at its Development address", async () => {
    await expect(roster).toBeVisible();
    expectAddress(page, { ...rosterIntent, perspective: null });
  });
});
