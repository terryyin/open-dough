// Where no usable split fits (../src/sidePanelWidth.ts, ../src/side-panel.css)
// the side panel covers the page column with no resize divider or
// Maximize/Restore, whether it shows the terminal or a review; a wide window
// recovers the chosen width and Maximize choice. A narrow desktop window is
// that side of the query with the least room; a 200% zoomed window lies on
// the same side. The split beside the page, on the wide side, is
// ./side-panel-width.spec.ts.

import {
  narrowWindow,
  expectFocusedAndIndicated,
} from "./accessibleReading.ts";
import { parts, storyCardSessions } from "./dashboardPage.ts";
import {
  box,
  closeSidePanel,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
  pressWhereShown,
} from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import {
  control,
  dragDivider,
  expectCovering,
  expectCoveringFillsWindow,
  expectWidth,
  scrollsOnItsOwn,
  split,
  storyAWithSession,
  usableMinimum,
  wideWindow,
} from "./sidePanelWidthPage.ts";
import { expect, test } from "./support/preparationPage.ts";

test("at a narrow window the panel covers the page with no Maximize, and a wide window recovers the chosen width and Maximize choice", async ({
  page,
  dashboard,
  origin,
}) => {
  const { card, terminal, review, divider } = await storyAWithSession(
    page,
    dashboard,
    origin,
  );
  const { banner, board } = parts(page);

  await storyCardSessions(card)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  const room = await split(page, terminal);
  const chosen = Math.floor(room.pageColumn + room.sidePanel - usableMinimum);
  await dragDivider(page, -2000);
  await expectWidth(terminal, chosen);

  for (const [panel, open] of [
    [terminal, async () => {}],
    [
      review,
      async () => {
        await card.getByRole("button", { name: "Review changes" }).click();
        await review
          .getByRole("button", { name: "Modified unstaged.txt" })
          .click();
        await expect(
          review.getByRole("region", { name: "Modified unstaged.txt" }),
        ).toContainText("+more wide");
      },
    ],
  ] as const) {
    await page.setViewportSize(wideWindow);
    await open();
    await expectWidth(panel, chosen);
    await expect(control(panel, "Maximize")).toBeVisible();

    await page.setViewportSize(narrowWindow);
    await expectCoveringFillsWindow(panel, { banner, board });
    await expectNoSidewaysScrollAndWholeText(page, [
      ...scrollsOnItsOwn,
      // The sidebar's entries are cut by design, read whole by their tooltip.
      ".sessions-sidebar-session-entry-title",
      // The panel header title truncates by design with disclosure
      // (./SidePanelTitle.tsx), read whole once activated.
      ".side-panel-title-toggle",
      // The review's context line is shortened by design, read whole by
      // its name and once activated.
      ".story-review-context-values",
      // Board behind the covering panel is not the reading surface.
      ".page-column",
    ]);
    await expectEveryControlReachable(panel);
    await expect(panel.getByRole("heading", { level: 2 })).toBeInViewport();
    const close = control(panel, "Close");
    await close.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expectFocusedAndIndicated(page, close);

    await page.setViewportSize(wideWindow);
    await expectWidth(panel, chosen);
    await expect(divider).toBeVisible();
    await expect(control(panel, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
  }

  await test.step("Maximize before narrowing stays maximized with Restore after widening", async () => {
    await page.setViewportSize(wideWindow);
    await pressWhereShown(control(review, "Close"));
    await expect(review).toHaveCount(0);
    await storyCardSessions(card)
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
    await expectWidth(terminal, chosen);
    await pressWhereShown(control(terminal, "Maximize"));
    await expect(control(terminal, "Restore")).toBeVisible();
    await page.setViewportSize(narrowWindow);
    await expectCovering(terminal);
    await page.setViewportSize(wideWindow);
    await expect(control(terminal, "Restore")).toBeVisible();
    await expect(control(terminal, "Maximize")).toHaveCount(0);
    await expect(banner).toBeHidden();
    await pressWhereShown(control(terminal, "Restore"));
    await expectWidth(terminal, chosen);
    await expect(control(terminal, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
  });
});

test("beside the open sidebar with too little room, the panel covers the page column without Maximize", async ({
  page,
  dashboard,
  origin,
}) => {
  const { card, terminal } = await storyAWithSession(page, dashboard, origin);
  const sidebar = sessionsSidebarParts(page);
  const { banner } = parts(page);

  await storyCardSessions(card)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  await sidebar.button.click();
  await expect(sidebar.sidebar).toBeVisible();
  // 880 − 288px sidebar = 592px < two 320px minimums.
  await page.setViewportSize({ width: 880, height: 900 });
  await expectCovering(terminal);
  const side = await box(sidebar.sidebar);
  const room = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));
  const panelBox = await box(terminal);
  expect(panelBox.x).toBeCloseTo(side.x + side.width, 0);
  expect(panelBox.width).toBeCloseTo(room.width - side.x - side.width, 0);
  expect(panelBox.height).toBeCloseTo(room.height, 0);
  await expect(banner).toBeHidden();
  await closeSidePanel(terminal);
  await expect(banner).toBeVisible();
});
