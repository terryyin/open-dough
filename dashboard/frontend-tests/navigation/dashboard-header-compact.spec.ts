// Compact title select on a phone-width column (../../src/banner.css):
// one-line banner with mark-as-Sessions toggle, labelled perspective, compact
// project select (may truncate), and settings; touch and keyboard choose a
// project, Escape leaves the selection, resize keeps it across tab radios and
// compact control, and page-wide arrow cycling focuses the shown compact title
// control. No separate panel icon or level-1 project title.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { answerCatalogProjects } from "../../test-support/support/frontendCatalogProjects.ts";
import {
  expectBannerRow,
  expectPinnedShortBanner,
} from "../../test-support/bannerReading.ts";
import {
  chooseProject,
  expectCompactProjectSelect,
  expectProjectChoice,
  parts,
  pressProjectListKeys,
  projectTab,
} from "../../test-support/dashboardPage.ts";
import { expectFrameIconControl } from "../../test-support/frameIconControl.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
} from "../../test-support/pageLayout.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import { settings } from "../../test-support/support/systemSettingsPage.ts";
import { focusCanonicalRecord } from "../../test-support/storyCardControls.ts";
import { phoneLaunchTouchViewport } from "../../test-support/touchLaunchPage.ts";
import {
  doughnutProject,
  expectCatalogStories,
  openDoughProject,
  pygardonProject,
} from "../../test-support/projectKeyboardNavigationJourney.ts";

test.describe("compact project title select on a phone-width column", () => {
  const { portrait } = phoneLaunchTouchViewport;

  test.describe("touch", () => {
    test.use({ viewport: portrait, hasTouch: true });

    test("one-line banner: mark-as-Sessions, perspective, project select, settings", async ({
      page,
      frontendServices,
    }) => {
      await answerCatalogProjects(page, frontendServices);
      await page.goto("/");
      const { banner, projectCompact, perspective } = parts(page);
      const sessions = sessionsSidebarParts(page).button;
      await expectCompactProjectSelect(page, "Open Dough");
      await expectCatalogStories(page, openDoughProject);
      await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
      await expect(banner.locator("svg.lucide-panel-left")).toHaveCount(0);
      await expect(
        banner.getByRole("img", { name: "Open Dough", exact: true }),
      ).toHaveCount(0);
      await expectFrameIconControl(sessions, "Sessions", "Sessions (⌘B)");
      const gear = settings(page);
      const inOrder = [sessions, perspective, projectCompact, gear];
      await expectBannerRow(inOrder);
      await expectPinnedShortBanner(page, portrait.height);
      await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);

      await chooseProject(page, "Doughnut");
      await expect(projectCompact).toHaveText("Doughnut");
      await expectCatalogStories(page, doughnutProject);
      await expect(parts(page).project).toHaveCount(0);
      await expectSideBySideInOrder(inOrder);
      await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
    });
  });

  test.describe("keyboard and resize", () => {
    test.use({ viewport: portrait });

    test("keyboard reaches Pygardon or Escape leaves Open Dough on the title control", async ({
      page,
      frontendServices,
    }) => {
      await answerCatalogProjects(page, frontendServices);
      await page.goto("/");
      const { projectCompact } = parts(page);
      await expect(projectCompact).toHaveText("Open Dough");

      await test.step("Escape leaves the project and focus on the title control", async () => {
        await pressProjectListKeys(page, ["ArrowDown", "ArrowDown", "Escape"]);
        await expect(projectCompact).toHaveText("Open Dough");
        await expectCatalogStories(page, openDoughProject);
      });

      await test.step("keyboard selection chooses Pygardon", async () => {
        await pressProjectListKeys(page, [
          "ArrowDown",
          "ArrowDown",
          "ArrowDown",
          "Enter",
        ]);
        await expect(projectCompact).toHaveText("Pygardon");
        await expectCatalogStories(page, pygardonProject);
      });
    });

    test("resizing keeps Doughnut across tab radios and compact select", async ({
      page,
      frontendServices,
    }) => {
      await answerCatalogProjects(page, frontendServices);
      await page.goto("/");
      const { projectCompact, banner } = parts(page);
      await expect(projectCompact).toHaveText("Open Dough");
      await chooseProject(page, "Doughnut");
      await expect(projectCompact).toHaveText("Doughnut");
      await expectCatalogStories(page, doughnutProject);

      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(projectCompact).toHaveCount(0);
      await expectProjectChoice(page, "Doughnut");
      await expect(projectTab(page, "Doughnut")).toBeChecked();
      await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);

      await page.setViewportSize(portrait);
      await expectCompactProjectSelect(page, "Doughnut");
      await expect(projectCompact).toBeVisible();
    });

    test("page-wide Right Arrow selects Doughnut and focuses the compact title control", async ({
      page,
      frontendServices,
    }) => {
      await answerCatalogProjects(page, frontendServices);
      await page.goto("/");
      await expect(parts(page).projectCompact).toHaveText("Open Dough");
      const { backlog, projectCompact } = parts(page);
      const card = backlog.getByRole("article", {
        name: openDoughProject.queued,
      });
      await focusCanonicalRecord(card);
      await page.keyboard.press("ArrowRight");
      await expect(projectCompact).toBeFocused();
      await expect(projectCompact).toHaveText("Doughnut");
      await expectCatalogStories(page, doughnutProject);
    });
  });
});
