// Where no usable split fits (../../src/sidePanelWidth.ts,
// ../../src/side-panel.css) the side panel covers the page column with no
// resize divider or Maximize/Restore; a wide window recovers the chosen width
// and Maximize choice. A narrow desktop window is that side of the query with
// the least room. The split beside the page, on the wide side, is
// ./side-panel-width.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  narrowWindow,
  expectFocusedAndIndicated,
} from "../../tests/accessibleReading.ts";
import { parts } from "../../tests/dashboardPage.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
} from "../../tests/pageLayout.ts";
import {
  expectSessionsSidebar,
  sessionsSidebarParts,
  sessionsSidebarTitleCut,
} from "../../tests/sessionsSidebarPage.ts";
import {
  scrollsOnItsOwn,
  sidePanelWidthPage,
} from "../../tests/sidePanelWidthPage.ts";
import {
  closeSidePanel,
  maximizeSidePanel,
  restoreSidePanel,
} from "../../tests/sidePanelFrame.ts";
import {
  openReview,
  takenStoryWithReview,
} from "../../tests/support/frontendSidePanelWidth.ts";
import { takenStoryWorkingSession } from "../../tests/support/frontendCardSessions.ts";
import { terminalScreenParts } from "../../tests/terminalScreenPage.ts";

test("at a narrow window the panel covers the page with no Maximize, and a wide window recovers the chosen width and Maximize choice", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  await takenStoryWithReview(page, frontendServices);
  const { banner, board } = parts(page);
  const sidebar = sessionsSidebarParts(page);
  const review = await openReview(page);
  const room = await width.split(review);
  const chosen = Math.floor(
    room.pageColumn + room.sidePanel - width.usableMinimum,
  );
  await width.dragDivider(-2000);
  await width.expectWidth(review, chosen);
  await expect(width.control(review, "Maximize")).toBeVisible();

  await test.step("a narrow window covers the page, every control reachable", async () => {
    await width.resizeUntilArranged(review, narrowWindow);
    await width.expectCoveringFillsWindow(review, { banner, board });
    await sidebar.button.click();
    await expectSessionsSidebar(page, "open");
    await sidebar.button.click();
    await expectSessionsSidebar(page, "closed");
    await expectNoSidewaysScrollAndWholeText(page, [
      ...scrollsOnItsOwn,
      // The sidebar's entries are cut by design, read whole by their tooltip.
      sessionsSidebarTitleCut,
      // The panel header title truncates by design with disclosure.
      ".side-panel-title-toggle",
      // The review's context line is shortened by design.
      ".story-review-context-values",
      // Board behind the covering panel is not the reading surface.
      ".page-column",
    ]);
    await expectEveryControlReachable(review);
    await expect(review.getByRole("heading", { level: 2 })).toBeInViewport();
    const close = width.control(review, "Close");
    await close.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expectFocusedAndIndicated(page, close);
  });

  await test.step("a wide window recovers the chosen width, divider and Maximize", async () => {
    await width.resizeUntilArranged(review, width.wideWindow);
    await width.expectWidth(review, chosen);
    await expect(width.divider).toBeVisible();
    await expect(width.control(review, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
  });

  await test.step("Maximize before narrowing stays maximized with Restore after widening", async () => {
    await closeSidePanel(review, { using: "pointer" });
    await expect(review).toHaveCount(0);
    const reopened = await openReview(page);
    await width.expectWidth(reopened, chosen);
    await maximizeSidePanel(reopened);
    await expect(width.control(reopened, "Restore")).toBeVisible();
    await page.setViewportSize(narrowWindow);
    await width.expectCovering(reopened);
    await page.setViewportSize(width.wideWindow);
    await expect(width.control(reopened, "Restore")).toBeVisible();
    await expect(width.control(reopened, "Maximize")).toHaveCount(0);
    await expect(banner).toBeHidden();
    await restoreSidePanel(reopened);
    await width.expectWidth(reopened, chosen);
    await expect(width.control(reopened, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
  });
});

test("beside the open sidebar with too little room, the panel covers the page column without Maximize", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  await takenStoryWithReview(page, frontendServices);
  const sidebar = sessionsSidebarParts(page);
  const { banner } = parts(page);
  const review = await openReview(page);
  await sidebar.button.click();
  await expect(sidebar.sidebar).toBeVisible();
  // 880 − 288px sidebar = 592px < two 320px minimums.
  await page.setViewportSize({ width: 880, height: 900 });
  await width.expectCovering(review);
  const side = await box(sidebar.sidebar);
  const room = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));
  const panelBox = await box(review);
  expect(panelBox.x).toBeCloseTo(side.x + side.width, 0);
  expect(panelBox.width).toBeCloseTo(room.width - side.x - side.width, 0);
  expect(panelBox.height).toBeCloseTo(room.height, 0);
  await expect(banner).toBeHidden();
  await closeSidePanel(review, { using: "pointer" });
  await expect(banner).toBeVisible();
});

test("at a narrow window the terminal covers the page with no Maximize, still attached, and a wide window recovers the chosen width", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  const { openTerminal } = await takenStoryWorkingSession(
    page,
    frontendServices,
  );
  await page.setViewportSize(width.wideWindow);
  await page.goto("/");
  const { banner, board } = parts(page);
  const terminal = await openTerminal();
  const rows = terminalScreenParts(terminal).rows;
  const room = await width.split(terminal);
  const chosen = Math.floor(
    room.pageColumn + room.sidePanel - width.usableMinimum,
  );
  await width.dragDivider(-2000);
  await width.expectWidth(terminal, chosen);

  await width.resizeUntilArranged(terminal, narrowWindow);
  await width.expectCoveringFillsWindow(terminal, { banner, board });
  await expect(rows).toContainText("attached");
  await expectEveryControlReachable(terminal);
  await expect(terminal.getByRole("heading", { level: 2 })).toBeInViewport();

  await width.resizeUntilArranged(terminal, width.wideWindow);
  await width.expectWidth(terminal, chosen);
  await expect(width.divider).toBeVisible();
  await expect(width.control(terminal, "Maximize")).toBeVisible();
  await expect(banner).toBeVisible();
});
