// Page-wide Left/Right cycles the four catalog projects through the same
// selection journey as a pointer choice. The substitute answers each catalog
// project's own publication; key handling, routing and UI updates stay
// production.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { answerCatalogProjects } from "../../tests/support/frontendCatalogProjects.ts";
import { expectRoute } from "../../tests/agentRosterRecords.ts";
import {
  openDirection,
  parts,
  projectTab,
  rosterParts,
} from "../../tests/dashboardPage.ts";
import {
  doughnutProject,
  expectCatalogStories,
  expectFocusedRadio,
  expectSelectedProject,
  openDoughProject,
  pygardonProject,
  terryTalksProject,
} from "../../tests/projectKeyboardNavigationJourney.ts";
import { settings as systemSettings } from "../../tests/support/systemSettingsPage.ts";

test("unmodified Left and Right cycle catalog projects with wrap without selector focus", async ({
  page,
  frontendServices,
}) => {
  await answerCatalogProjects(page, frontendServices);
  await page.goto("/");
  await expectSelectedProject(page, openDoughProject, {
    checkDirection: false,
  });

  // A banner control keeps focus across the switch.
  const settings = systemSettings(page);
  await settings.focus();
  await expect(settings).toBeFocused();

  for (const [key, order] of [
    [
      "ArrowRight",
      [doughnutProject, pygardonProject, terryTalksProject, openDoughProject],
    ],
    [
      "ArrowLeft",
      [terryTalksProject, pygardonProject, doughnutProject, openDoughProject],
    ],
  ] as const) {
    await test.step(`${key} cycles every catalog project and wraps`, async () => {
      for (const published of order) {
        await page.keyboard.press(key);
        await expect(settings).toBeFocused();
        await expectSelectedProject(page, published, {
          checkDirection: false,
        });
        await expect(settings).toBeFocused();
      }
    });
  }

  await test.step("direction text follows the keyboard-selected project", async () => {
    await openDirection(page);
    await expect(parts(page).direction).toContainText(
      openDoughProject.direction,
    );
  });
});

test("focused project radio advances exactly once with wrap and keeps focus", async ({
  page,
  frontendServices,
}) => {
  await answerCatalogProjects(page, frontendServices);
  await page.goto("/");

  await test.step("Right from Open Dough selects Doughnut once and focuses it", async () => {
    await projectTab(page, "Open Dough").focus();
    await page.keyboard.press("ArrowRight");
    await expectFocusedRadio(page, "Doughnut");
    await expectSelectedProject(page, doughnutProject);
  });

  await test.step("Right from Terry Talks wraps once to Open Dough", async () => {
    await projectTab(page, "Terry Talks").check();
    await expectSelectedProject(page, terryTalksProject);
    await projectTab(page, "Terry Talks").focus();
    await page.keyboard.press("ArrowRight");
    await expectFocusedRadio(page, "Open Dough");
    await expectSelectedProject(page, openDoughProject);
  });

  await test.step("Left from Open Dough wraps once to Terry Talks", async () => {
    await projectTab(page, "Open Dough").focus();
    await page.keyboard.press("ArrowLeft");
    await expectFocusedRadio(page, "Terry Talks");
    await expectSelectedProject(page, terryTalksProject);
  });
});

test("keyboard project selection reuses history and roster view retention", async ({
  page,
  frontendServices,
}) => {
  await answerCatalogProjects(page, frontendServices);
  await page.goto("/");
  await expectCatalogStories(page, openDoughProject);

  await systemSettings(page).focus();
  await page.keyboard.press("ArrowRight");
  expectRoute(page, { project: "doughnut", view: null });
  await expectCatalogStories(page, doughnutProject);

  await page.keyboard.press("ArrowRight");
  expectRoute(page, { project: "pygardon", view: null });
  await expectCatalogStories(page, pygardonProject);

  await test.step("browser Back and Forward restore keyboard selections", async () => {
    await page.goBack();
    expectRoute(page, { project: "doughnut", view: null });
    await expectCatalogStories(page, doughnutProject);
    await page.goForward();
    expectRoute(page, { project: "pygardon", view: null });
    await expectCatalogStories(page, pygardonProject);
  });

  await test.step("keyboard switch keeps roster view aligned with the selected project", async () => {
    await page.goto("/?view=roster");
    const { roster } = rosterParts(page);
    await expect(roster).toContainText(
      "Open Dough: agent profiles published at revision",
    );
    await systemSettings(page).focus();
    await page.keyboard.press("ArrowRight");
    expectRoute(page, { project: "doughnut", view: "roster" });
    await expect(roster).toContainText(
      "Doughnut: agent profiles published at revision",
    );
    await expect(projectTab(page, "Doughnut")).toBeChecked();
    await expect(page.locator("body")).not.toContainText(
      openDoughProject.taken,
    );
  });
});
