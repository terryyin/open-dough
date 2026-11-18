// The perspective choices by keyboard (../../src/PerspectiveSelect.tsx): their
// arrows choose a perspective and never another project, the page-wide project
// arrows still choose projects from Intent's content, and the keyboard never
// stays in content a perspective change hid.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { answerCatalogProjects } from "../../test-support/support/frontendCatalogProjects.ts";
import { parts, projectTab } from "../../test-support/dashboardPage.ts";
import {
  expectAddress,
  expectNotConfiguredIntent,
} from "../../test-support/intentPerspectivePage.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import {
  expectCatalogStories,
  openDoughProject,
} from "../../test-support/projectKeyboardNavigationJourney.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";

test("perspective keys choose a perspective without choosing another project, and the keyboard never stays in content the change hid", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await answerCatalogProjects(page, frontendServices);
  await openUntilRead(page);
  const { backlog, development, intent, intentChoice } = parts(page);
  await expectCatalogStories(page, openDoughProject);

  await test.step("Tab reaches Development after Sessions, and its arrows move between perspectives only", async () => {
    await sessionsSidebarParts(page).button.focus();
    await page.keyboard.press("Tab");
    await expect(development).toBeFocused();
    await expect(development).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("ArrowRight");
    await expect(intentChoice).toBeFocused();
    await expectNotConfiguredIntent(page, "Open Dough");
    await expect(intentChoice).toHaveCSS("outline-style", "solid");
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    expectAddress(page, { project: null, perspective: "intent" });
    await page.keyboard.press("ArrowLeft");
    await expect(development).toBeFocused();
    await expect(development).toBeChecked();
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await expectCatalogStories(page, openDoughProject);
  });

  await test.step("Back to Intent takes the keyboard from the hidden Board to Intent's choice", async () => {
    const inspect = backlog
      .getByRole("article", { name: openDoughProject.queued })
      .getByRole("button", { name: "Inspect story" });
    await inspect.focus();
    await page.goBack();
    await expectNotConfiguredIntent(page, "Open Dough");
    await expect(intentChoice).toBeFocused();
  });

  await test.step("a page-wide arrow from Intent's content chooses Doughnut and keeps Intent", async () => {
    await intent.getByText("No intent locations are configured").click();
    await page.keyboard.press("ArrowRight");
    await expect(projectTab(page, "Doughnut")).toBeChecked();
    await expect(projectTab(page, "Doughnut")).toBeFocused();
    await expectNotConfiguredIntent(page, "Doughnut");
  });
});
