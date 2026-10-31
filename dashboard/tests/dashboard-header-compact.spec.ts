// Compact title select on a phone-width column (../src/banner.css ≤400px):
// one-line banner with mark-as-Sessions toggle, labelled perspective, compact
// project select (may truncate), and settings; touch and keyboard choose a
// project, Escape leaves the selection, resize keeps it across tab radios and
// compact control, and page-wide arrow cycling focuses the shown compact title
// control. No separate panel icon or level-1 project title.

import { expect, test } from "./dashboardTest.ts";
import {
  chooseProject,
  expectCompactProjectSelect,
  expectMembership,
  expectProjectChoice,
  parts,
} from "./dashboardPage.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
} from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { settings } from "./support/systemSettingsPage.ts";
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

    test("one-line banner: mark-as-Sessions, perspective, project select, settings", async ({
      page,
    }) => {
      await publishCatalogProjects(page);
      await page.goto("/");
      const { banner, projectCompact, perspective } = parts(page);
      const sessions = sessionsSidebarParts(page).button;
      await expectCompactProjectSelect(page, "Open Dough");
      await expectMembership(page, {
        taken: [openDoughProject.taken],
        backlog: [openDoughProject.queued],
      });
      await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
      await expect(banner.locator("svg.lucide-panel-left")).toHaveCount(0);
      await expect(
        banner.getByRole("img", { name: "Open Dough", exact: true }),
      ).toHaveCount(0);
      await expectFrameIconControl(sessions, "Sessions", "Sessions (⌘B)");
      const gear = settings(page);
      const inOrder = [sessions, perspective, projectCompact, gear];
      await expectSideBySideInOrder(inOrder);
      const middles = (await Promise.all(inOrder.map(box))).map(
        ({ y, height }) => y + height / 2,
      );
      for (const middle of middles)
        expect(middle).toBeCloseTo(middles[0] ?? 0, 0);
      expect(await box(banner).then((pinned) => pinned.height)).toBeLessThan(
        portrait.height / 2,
      );
      await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);

      await chooseProject(page, "Doughnut");
      await expect(projectCompact).toHaveText("Doughnut");
      await expectMembership(page, {
        taken: [doughnutProject.taken],
        backlog: [doughnutProject.queued],
      });
      await expect(parts(page).project).toHaveCount(0);
      await expectSideBySideInOrder(inOrder);
      await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
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

    test("resizing keeps Doughnut across tab radios and compact select", async ({
      page,
    }) => {
      await publishCatalogProjects(page);
      await page.goto("/");
      const { projectCompact, project, banner } = parts(page);
      await expect(projectCompact).toHaveText("Open Dough");
      await chooseProject(page, "Doughnut");
      await expect(projectCompact).toHaveText("Doughnut");
      await expectMembership(page, {
        taken: [doughnutProject.taken],
        backlog: [doughnutProject.queued],
      });

      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(projectCompact).toHaveCount(0);
      await expectProjectChoice(page, "Doughnut");
      await expect(
        project.getByRole("radio", { name: "Doughnut", exact: true }),
      ).toBeChecked();
      await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);

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
