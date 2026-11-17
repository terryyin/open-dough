// The pinned banner in each of its page-column layouts (../../src/banner.css,
// ../../src/project-select.css): always one row, Sessions (Open Dough mark as
// its visual), icon-only perspective, project choices, and System settings.
// The project tabs show while they fit on that row; otherwise the compact
// title select takes their place, even well above phone width. One journey
// per layout walks the keyboard back up a long page: the banner stays pinned
// and short, the mark-as-Sessions toggle leads it, nothing is cut short, and
// no focused control is hidden under it. Wider layouts also check each choice
// reads on one line. Phone-width compact journeys are
// ./dashboard-header-compact.spec.ts's.

import type { Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { countAuthenticatedReads } from "../../tests/support/frontendAuthenticatedReadControl.ts";
import { untilPageReadsAnswered } from "../../tests/pageRequestNotes.ts";
import {
  answerCatalogProjects,
  answerOwnPublications,
} from "../../tests/support/frontendCatalogProjects.ts";
import { catalogPublications } from "../../tests/catalogProjectRecords.ts";
import {
  publishLargeBacklog,
  queuedCount,
  queuedTitle,
} from "../../tests/accessibleBoard.ts";
import { zoomedWindow } from "../../tests/accessibleReading.ts";
import {
  bannerStops,
  expectBannerRow,
  expectBelowBanner,
  expectPinnedShortBanner,
} from "../../tests/bannerReading.ts";
import {
  parts,
  expectCompactProjectSelect,
  expectProjectChoice,
  expectSettledPage,
  projectTab,
} from "../../tests/dashboardPage.ts";
import { expectFrameIconControl } from "../../tests/frameIconControl.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "../../tests/pageLayout.ts";
import { sessionsSidebarParts } from "../../tests/sessionsSidebarPage.ts";
import { settings } from "../../tests/support/systemSettingsPage.ts";
import {
  doughnutProject,
  expectCatalogStories,
  openDoughProject,
} from "../../tests/projectKeyboardNavigationJourney.ts";

// The page's published reads of one project: none is read again unasked.
const projectReads = (page: Page, source: string) =>
  countAuthenticatedReads(page, (params) => params.get("source") === source);

const layouts = [
  { width: 1280, height: 800, compact: false },
  { width: 700, height: 720, compact: false },
  { width: 520, height: 720, compact: true },
  { ...zoomedWindow, fontFamily: "Verdana", compact: true },
] as const;

for (const viewport of layouts) {
  const fontFamily = "fontFamily" in viewport ? viewport.fontFamily : undefined;
  test(`selected project banner remains reachable at ${viewport.width} CSS pixels${fontFamily ? ` in ${fontFamily}` : ""}`, async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    // Open Dough's long Board, and three more projects choosable beside it.
    publishLargeBacklog(frontendServices);
    const { doughnut, pygardon, terryTalks } = catalogPublications;
    await answerOwnPublications(page, frontendServices, [
      doughnut,
      pygardon,
      terryTalks,
    ]);
    const openDoughReads = projectReads(page, "open-dough");
    await page.goto("/");
    // A wider installed font reproduces the Linux first-row wrapping; the
    // same geometry, text and keyboard promises must still hold.
    if (fontFamily) {
      await page.addStyleTag({
        content: `.banner { font-family: ${fontFamily}, sans-serif; }`,
      });
    }
    const { banner, project, projectCompact, backlog, perspective } =
      parts(page);
    const sessions = sessionsSidebarParts(page).button;
    // The last card's last control.
    const last = backlog
      .getByRole("article", { name: queuedTitle(queuedCount) })
      .getByRole("button", { name: "Inspect story" });
    await expect(last).toBeVisible();
    // Preparation facts reflow the cards; measure a settled page.
    await expectSettledPage(page);
    await untilPageReadsAnswered(page);
    // The settled opening reads of Open Dough.
    expect(openDoughReads()).toBe(20);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    const titleControl = viewport.compact ? projectCompact : project;
    for (const control of [titleControl, perspective, settings(page)]) {
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    // Mark is Sessions, not a passive product image; no separate panel icon,
    // no level-1 project title, no Refresh or Retry.
    await expect(
      banner.getByRole("img", { name: "Open Dough", exact: true }),
    ).toHaveCount(0);
    await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
    await expect(banner.locator("svg.lucide-panel-left")).toHaveCount(0);
    await expect(
      banner.getByRole("button", { name: /^(Refresh|Retry)$/ }),
    ).toHaveCount(0);
    await expectPinnedShortBanner(page, viewport.height);
    if (viewport.compact) {
      await expectCompactProjectSelect(page, "Open Dough");
    } else {
      expect(
        await project.locator(".project-choice span").evaluateAll((choices) =>
          choices.map((choice) => {
            const text = document.createRange();
            text.selectNodeContents(choice);
            return text.getClientRects().length;
          }),
        ),
      ).toEqual([1, 1, 1, 1]);
      await expectProjectChoice(page, "Open Dough");
    }
    await expectFrameIconControl(sessions, "Sessions", "Sessions (⌘B)");
    await expectFrameIconControl(settings(page), "System settings");
    await expectNoSidewaysScrollAndWholeText(
      page,
      viewport.compact ? [...compactProjectSelectCut] : [],
    );

    await test.step("the column lays the banner in one row, from Sessions to System settings", async () => {
      const gear = settings(page);
      await expectBannerRow([sessions, perspective, titleControl, gear]);
      const stops = bannerStops(page);
      await expect(stops.last()).toHaveAccessibleName("System settings");
      // Sessions (mark) leads the banner as the first keyboard stop.
      await expect(stops.first()).toHaveAccessibleName("Sessions");
      await stops.first().focus();
      await page.keyboard.press("Shift+Tab");
      await expect(banner.locator(":focus")).toHaveCount(0);
      const gearBox = await box(gear);
      for (const right of await stops.evaluateAll((all) =>
        all.map((element) => element.getBoundingClientRect().right),
      )) {
        expect(right).toBeLessThanOrEqual(gearBox.x + gearBox.width + 0.5);
      }
    });

    await last.focus();
    for (let index = 0; index < 10; index += 1) {
      await page.keyboard.press("Shift+Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeInViewport({ ratio: 1 });
      await expectBelowBanner(focused);
    }
    await untilPageReadsAnswered(page);
    // Walking the page reads nothing again.
    expect(openDoughReads()).toBe(20);
  });
}

test("banner project selection reads the selected project's actual published work", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await answerCatalogProjects(page, frontendServices);
  const openDoughReads = projectReads(page, "open-dough");
  const doughnutReads = projectReads(page, "doughnut");
  await page.goto("/");
  const { banner, project } = parts(page);
  const sessions = sessionsSidebarParts(page).button;
  await expectProjectChoice(page, "Open Dough");
  await expectCatalogStories(page, openDoughProject);
  await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expectFrameIconControl(sessions, "Sessions", "Sessions (⌘B)");
  await expect(project.getByRole("radio")).toHaveCount(4);
  await expect(projectTab(page, "Open Dough")).toBeChecked();
  await projectTab(page, "Doughnut").click();
  await expect(projectTab(page, "Doughnut")).toBeChecked();
  await expect(projectTab(page, "Open Dough")).not.toBeChecked();
  await expectCatalogStories(page, doughnutProject);
  // Open Dough stays the product mark on Sessions; the selector names the project.
  await expectFrameIconControl(sessions, "Sessions", "Sessions (⌘B)");
  await expectProjectChoice(page, "Doughnut");
  await untilPageReadsAnswered(page);
  // Each project was read once, settled: switching re-reads neither.
  expect(openDoughReads()).toBe(6);
  expect(doughnutReads()).toBe(6);
});
