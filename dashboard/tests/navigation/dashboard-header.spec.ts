// The pinned banner in each of its page-column layouts (../src/banner.css,
// ../src/project-select.css): always one row, Sessions (Open Dough mark as its
// visual), icon-only perspective, project choices, and System settings. The
// project tabs show while they fit on that row; otherwise the compact title
// select takes their place, even well above phone width. One journey per
// layout walks the keyboard back up a long page: the banner stays pinned and
// short, the mark-as-Sessions toggle leads it, nothing is cut short, and no
// focused control is hidden under it. Wider layouts also check each choice
// reads on one line. A project switch in the banner is a later test: the mark
// stays Open Dough's while the project selector and Board become the newly
// selected project's. Phone-width compact journeys live in
// dashboard-header-compact.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision,
} from "../accessibleBoard.ts";
import { zoomedWindow } from "../accessibleReading.ts";
import {
  bannerStops,
  expectBannerRow,
  expectBelowBanner,
  expectPinnedShortBanner,
} from "../bannerReading.ts";
import {
  parts,
  expectCompactProjectSelect,
  expectMembership,
  expectProjectChoice,
  expectSettledPage,
  projectTab,
} from "../dashboardPage.ts";
import { expectFrameIconControl } from "../frameIconControl.ts";
import { publishMovingOrigin } from "../publishedOrigin.ts";
import {
  box,
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "../pageLayout.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { settings } from "../support/systemSettingsPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

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
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    const origin = await publishMovingOrigin(page);
    origin.push(revision, largeBacklog);
    await openUntilRead(page);
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
    // Preparation facts arrive after membership and reflow the cards, which
    // can carry a focused control past the window's edge; measure a settled
    // page. Its 41 reads took about 3.5 seconds on CI.
    await expectSettledPage(page, undefined, { timeout: 15_000 });
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    const titleControl = viewport.compact ? projectCompact : project;
    for (const control of [titleControl, perspective, settings(page)]) {
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    // Configured banner: mark is Sessions, not a passive product image; no
    // separate panel icon and no level-1 project title.
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

    expect(origin.requests).toHaveLength(2);

    await last.focus();
    for (let index = 0; index < 10; index += 1) {
      await page.keyboard.press("Shift+Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeInViewport({ ratio: 1 });
      await expectBelowBanner(focused);
    }
  });
}

test("banner project selection reads the selected project's actual published work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const openDough = await publishMovingOrigin(page);
  openDough.push(revision, largeBacklog);
  const doughnut = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  const doughnutRevision = "d".repeat(40);
  doughnut.push(
    doughnutRevision,
    describedBacklog(
      makeMe.aRepository
        .withRevision("published", {
          backlog: {
            queued: [
              makeMe.aBacklogEntry
                .with({
                  identity: "SEED-001#story",
                  title: "Doughnut's next story",
                  href: "seeds/SEED-001.md#story",
                })
                .please(),
            ],
          },
        })
        .please(),
    ),
  );
  await openUntilRead(page);
  const { banner, project } = parts(page);
  await expectProjectChoice(page, "Open Dough");
  await expect(banner.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expectFrameIconControl(
    sessionsSidebarParts(page).button,
    "Sessions",
    "Sessions (⌘B)",
  );
  await expect(project.getByRole("radio")).toHaveCount(4);
  await expect(projectTab(page, "Open Dough")).toBeChecked();
  await projectTab(page, "Doughnut").click();
  await expect(projectTab(page, "Doughnut")).toBeChecked();
  await expect(projectTab(page, "Open Dough")).not.toBeChecked();
  await expectMembership(page, {
    taken: [],
    backlog: ["Doughnut's next story"],
  });
  // Open Dough stays the product mark on Sessions; the selector names the project.
  await expectFrameIconControl(
    sessionsSidebarParts(page).button,
    "Sessions",
    "Sessions (⌘B)",
  );
  await expectProjectChoice(page, "Doughnut");
  expect(openDough.requests).toHaveLength(2);
  expect(doughnut.requests).toHaveLength(2);
});
