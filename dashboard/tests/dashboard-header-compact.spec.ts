// Compact title select on a phone-width column (../src/banner.css ≤400px):
// touch and keyboard choose a project, Escape leaves the selection, resize
// keeps it across plain title and compact control, and page-wide arrow
// cycling focuses the shown compact title control.

import { expect, test } from "./dashboardTest.ts";
import {
  chooseProject,
  expectCompactProjectSelect,
  expectMembership,
  parts,
} from "./dashboardPage.ts";
import { expectProductMark } from "./productMark.ts";
import { box } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import {
  doughnutProject,
  openDoughProject,
  publishCatalogProjects,
  pygardonProject,
} from "./projectKeyboardNavigationJourney.ts";

test.describe("compact project title select on a phone-width column", () => {
  const { portrait } = phoneLaunchTouchViewport;

  test.describe("touch", () => {
    test.use({ viewport: portrait, hasTouch: true });

    test("title is the dropdown selector; choosing Doughnut updates title and Board", async ({
      page,
    }) => {
      await publishCatalogProjects(page);
      await page.goto("/");
      const { banner, projectCompact } = parts(page);
      await expectCompactProjectSelect(page, "Open Dough");
      await expectMembership(page, {
        taken: [openDoughProject.taken],
        backlog: [openDoughProject.queued],
      });
      await expectProductMark(banner);
      expect(await box(banner).then((pinned) => pinned.height)).toBeLessThan(
        portrait.height / 2,
      );

      await chooseProject(page, "Doughnut");
      await expect(projectCompact).toHaveText("Doughnut");
      await expectMembership(page, {
        taken: [doughnutProject.taken],
        backlog: [doughnutProject.queued],
      });
      await expect(parts(page).project).toHaveCount(0);
    });
  });

  test.describe("keyboard and resize", () => {
    test.use({ viewport: portrait });

    test("keyboard reaches Pygardon or Escape leaves Open Dough on the title control", async ({
      page,
    }) => {
      await publishCatalogProjects(page);
      await page.goto("/");
      const { projectCompact, projectCompactList } = parts(page);
      await expect(projectCompact).toHaveText("Open Dough");
      await projectCompact.focus();
      await expect(projectCompact).toBeFocused();

      await test.step("Escape leaves the project and focus on the title control", async () => {
        await page.keyboard.press("ArrowDown");
        await expect(projectCompactList).toBeVisible();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Escape");
        await expect(projectCompactList).toHaveCount(0);
        await expect(projectCompact).toBeFocused();
        await expect(projectCompact).toHaveText("Open Dough");
        await expectMembership(page, {
          taken: [openDoughProject.taken],
          backlog: [openDoughProject.queued],
        });
      });

      await test.step("keyboard selection chooses Pygardon", async () => {
        await projectCompact.focus();
        await page.keyboard.press("ArrowDown");
        await expect(projectCompactList).toBeVisible();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await expect(projectCompactList).toHaveCount(0);
        await expect(projectCompact).toHaveText("Pygardon");
        await expect(projectCompact).toBeFocused();
        await expectMembership(page, {
          taken: [pygardonProject.taken],
          backlog: [pygardonProject.queued],
        });
      });
    });

    test("resizing keeps Doughnut across plain title and compact select", async ({
      page,
    }) => {
      await publishCatalogProjects(page);
      await page.goto("/");
      const { projectCompact, project, projectTitle } = parts(page);
      await expect(projectCompact).toHaveText("Open Dough");
      await chooseProject(page, "Doughnut");
      await expect(projectCompact).toHaveText("Doughnut");
      await expectMembership(page, {
        taken: [doughnutProject.taken],
        backlog: [doughnutProject.queued],
      });

      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(projectCompact).toHaveCount(0);
      await expect(projectTitle).toHaveText("Doughnut");
      await expect(
        project.getByRole("radio", { name: "Doughnut", exact: true }),
      ).toBeChecked();
      await expect(projectTitle).toBeVisible();

      await page.setViewportSize(portrait);
      await expectCompactProjectSelect(page, "Doughnut");
      await expect(projectCompact).toBeVisible();
    });

    test("page-wide Right Arrow selects Doughnut and focuses the compact title control", async ({
      page,
    }) => {
      await publishCatalogProjects(page);
      await page.goto("/");
      await expect(parts(page).projectCompact).toHaveText("Open Dough");
      const { backlog, projectCompact } = parts(page);
      const card = backlog.getByRole("article", {
        name: openDoughProject.queued,
      });
      await card.getByRole("button", { name: "Inspect story" }).click();
      await card.getByRole("link", { name: /^Canonical record/ }).focus();
      await page.keyboard.press("ArrowRight");
      await expect(projectCompact).toBeFocused();
      await expect(projectCompact).toHaveText("Doughnut");
      await expectMembership(page, {
        taken: [doughnutProject.taken],
        backlog: [doughnutProject.queued],
      });
    });
  });
});
