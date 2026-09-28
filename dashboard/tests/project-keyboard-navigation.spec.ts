// Page-wide Left/Right cycles the three catalog projects through the same
// selection journey as a pointer choice. The fake GitHub supplies published
// facts only; key handling, routing, and UI updates stay production.

import { expect, test } from "./dashboardTest.ts";
import {
  doughnutStory,
  expectRoute,
  publishRosterOrigins,
  queuedStory,
  takenStory,
} from "./agentRosterRecords.ts";
import {
  expectMembership,
  openDirection,
  parts,
  rosterParts,
} from "./dashboardPage.ts";
import {
  doughnutProject,
  expectFocusedRadio,
  expectSelectedProject,
  openDoughProject,
  publishCatalogProjects,
  pygardonProject,
} from "./projectKeyboardNavigationJourney.ts";

test("unmodified Left and Right cycle catalog projects with wrap without selector focus", async ({
  page,
}) => {
  await publishCatalogProjects(page);
  await page.goto("/");
  await expectSelectedProject(page, openDoughProject, {
    checkDirection: false,
  });

  const { refresh } = parts(page);
  await refresh.focus();
  await expect(refresh).toBeFocused();

  await test.step("Right advances Open Dough → Doughnut → Pygardon → Open Dough", async () => {
    for (const published of [
      doughnutProject,
      pygardonProject,
      openDoughProject,
    ]) {
      await page.keyboard.press("ArrowRight");
      await expect(refresh).toBeFocused();
      await expectSelectedProject(page, published, { checkDirection: false });
      await expect(refresh).toBeFocused();
    }
  });

  await test.step("Left reverses Open Dough → Pygardon → Doughnut → Open Dough", async () => {
    for (const published of [
      pygardonProject,
      doughnutProject,
      openDoughProject,
    ]) {
      await page.keyboard.press("ArrowLeft");
      await expect(refresh).toBeFocused();
      await expectSelectedProject(page, published, { checkDirection: false });
      await expect(refresh).toBeFocused();
    }
  });

  await test.step("direction text follows the keyboard-selected project", async () => {
    await openDirection(page);
    await expect(parts(page).direction).toContainText(
      openDoughProject.direction,
    );
  });
});

test("focused project radio advances exactly once with wrap and keeps focus", async ({
  page,
}) => {
  await publishCatalogProjects(page);
  await page.goto("/");
  const { project } = parts(page);

  await test.step("Right from Open Dough selects Doughnut once and focuses it", async () => {
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .focus();
    await page.keyboard.press("ArrowRight");
    await expectFocusedRadio(page, "Doughnut");
    await expectSelectedProject(page, doughnutProject);
  });

  await test.step("Right from Pygardon wraps once to Open Dough", async () => {
    await project.getByRole("radio", { name: "Pygardon", exact: true }).check();
    await expectSelectedProject(page, pygardonProject);
    await project.getByRole("radio", { name: "Pygardon", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expectFocusedRadio(page, "Open Dough");
    await expectSelectedProject(page, openDoughProject);
  });

  await test.step("Left from Open Dough wraps once to Pygardon", async () => {
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .focus();
    await page.keyboard.press("ArrowLeft");
    await expectFocusedRadio(page, "Pygardon");
    await expectSelectedProject(page, pygardonProject);
  });
});

test("keyboard project selection reuses history and roster view retention", async ({
  page,
}) => {
  await publishRosterOrigins(page);
  await page.goto("/");
  await expectMembership(page, {
    taken: [takenStory],
    backlog: [queuedStory],
  });

  const { refresh, project } = parts(page);
  await refresh.focus();
  await page.keyboard.press("ArrowRight");
  expectRoute(page, { project: "doughnut", view: null });
  await expectMembership(page, { taken: [doughnutStory], backlog: [] });

  await page.keyboard.press("ArrowRight");
  expectRoute(page, { project: "pygardon", view: null });

  await test.step("browser Back and Forward restore keyboard selections", async () => {
    await page.goBack();
    expectRoute(page, { project: "doughnut", view: null });
    await expectMembership(page, { taken: [doughnutStory], backlog: [] });
    await page.goForward();
    expectRoute(page, { project: "pygardon", view: null });
  });

  await test.step("keyboard switch keeps roster view aligned with the selected project", async () => {
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectMembership(page, {
      taken: [takenStory],
      backlog: [queuedStory],
    });
    const { opener, roster, member } = rosterParts(page);
    await opener("Akiho-chan").click();
    expectRoute(page, { project: "open-dough", view: "roster" });
    await expect(member("Akiho-chan")).toHaveAttribute("aria-current", "true");

    await page.keyboard.press("ArrowRight");
    expectRoute(page, { project: "doughnut", view: "roster" });
    await expect(roster).toBeVisible();
    await expect(roster).toContainText(
      "Doughnut: agent profiles published at revision",
    );
    await expect(
      rosterParts(page).members.filter({
        hasText: "Assignment unknown. Agent profiles could not be read.",
      }),
    ).toHaveCount(29);
    await expect(
      project.getByRole("radio", { name: "Doughnut", exact: true }),
    ).toBeChecked();
    await expect(page.locator("body")).not.toContainText(takenStory);
  });
});
