// The perspective choices by keyboard (../src/PerspectiveSelect.tsx): their
// arrows choose a perspective and never another project, the page-wide project
// arrows still choose projects from Intent's content, and the keyboard never
// stays in content a perspective change hid.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  expectAddress,
  expectForthcomingIntent,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  openDoughProject,
  publishCatalogProjects,
} from "./projectKeyboardNavigationJourney.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";

test("perspective keys choose a perspective without choosing another project, and the keyboard never stays in content the change hid", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await publishCatalogProjects(page);
  await openUntilRead(page);
  const { backlog, development, intent, intentChoice, project } = parts(page);
  const radio = (label: string) =>
    project.getByRole("radio", { name: label, exact: true });
  await expectMembership(page, {
    taken: [openDoughProject.taken],
    backlog: [openDoughProject.queued],
  });

  await test.step("Tab reaches Development after Sessions, and its arrows move between perspectives only", async () => {
    await sessionsSidebarParts(page).button.focus();
    await page.keyboard.press("Tab");
    await expect(development).toBeFocused();
    await expect(development).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("ArrowRight");
    await expect(intentChoice).toBeFocused();
    await expectForthcomingIntent(page, "Open Dough");
    await expect(intentChoice).toHaveCSS("outline-style", "solid");
    await expect(radio("Open Dough")).toBeChecked();
    expectAddress(page, { project: null, perspective: "intent" });
    await page.keyboard.press("ArrowLeft");
    await expect(development).toBeFocused();
    await expect(development).toBeChecked();
    await expect(radio("Open Dough")).toBeChecked();
    await expectMembership(page, {
      taken: [openDoughProject.taken],
      backlog: [openDoughProject.queued],
    });
  });

  await test.step("Back to Intent takes the keyboard from the hidden Board to Intent's choice", async () => {
    const inspect = backlog
      .getByRole("article", { name: openDoughProject.queued })
      .getByRole("button", { name: "Inspect story" });
    await inspect.focus();
    await page.goBack();
    await expectForthcomingIntent(page, "Open Dough");
    await expect(intentChoice).toBeFocused();
  });

  await test.step("a page-wide arrow from Intent's content chooses Doughnut and keeps Intent", async () => {
    await intent.getByText("is forthcoming").click();
    await page.keyboard.press("ArrowRight");
    await expect(radio("Doughnut")).toBeChecked();
    await expect(radio("Doughnut")).toBeFocused();
    await expectForthcomingIntent(page, "Doughnut");
  });
});
