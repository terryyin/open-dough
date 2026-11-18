// Where no usable split fits (../../src/sidePanelWidth.ts,
// ../../src/side-panel.css) the side panel covers the page column with no
// resize divider or Maximize/Restore; a wide window recovers the chosen width
// and Maximize choice. A narrow desktop window is that side of the query with
// the least room. The split beside the page, on the wide side, is
// ./side-panel-width.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  narrowWindow,
  expectFocusedAndIndicated,
} from "../../test-support/accessibleReading.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
} from "../../test-support/pageLayout.ts";
import {
  expectSessionsSidebar,
  sessionsSidebarParts,
  sessionsSidebarTitleCut,
} from "../../test-support/sessionsSidebarPage.ts";
import {
  control,
  dragDivider,
  expectCovering,
  expectCoveringFillsWindow,
  expectWidth,
  panelDivider,
  resizeUntilArranged,
  scrollsOnItsOwn,
  split,
  usableMinimum,
  wideWindow,
} from "../../test-support/sidePanelWidthPage.ts";
import {
  closeSidePanel,
  maximizeSidePanel,
  restoreSidePanel,
} from "../../test-support/sidePanelFrame.ts";
import {
  openReview,
  takenStoryWithReview,
} from "../../test-support/support/frontendSidePanelWidth.ts";
import { takenStoryWorkingSession } from "../../test-support/support/frontendCardSessions.ts";
import { terminalScreenParts } from "../../test-support/terminalScreenPage.ts";

test("at a narrow window the panel covers the page with no Maximize, and a wide window recovers the chosen width and Maximize choice", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWithReview(page, frontendServices);
  const { banner, board } = parts(page);
  const sidebar = sessionsSidebarParts(page);
  const review = await openReview(page);
  const room = await split(page, review);
  const chosen = Math.floor(room.pageColumn + room.sidePanel - usableMinimum);
  await dragDivider(page, -2000);
  await expectWidth(review, chosen);
  await expect(control(review, "Maximize")).toBeVisible();

  await test.step("a narrow window covers the page, every control reachable", async () => {
    await resizeUntilArranged(review, narrowWindow);
    await expectCoveringFillsWindow(review, { banner, board });
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
    const close = control(review, "Close");
    await close.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expectFocusedAndIndicated(page, close);
  });

  await test.step("a wide window recovers the chosen width, divider and Maximize", async () => {
    await resizeUntilArranged(review, wideWindow);
    await expectWidth(review, chosen);
    await expect(panelDivider(page)).toBeVisible();
    await expect(control(review, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
  });

  await test.step("Maximize before narrowing stays maximized with Restore after widening", async () => {
    await closeSidePanel(review, { using: "pointer" });
    await expect(review).toHaveCount(0);
    const reopened = await openReview(page);
    await expectWidth(reopened, chosen);
    await maximizeSidePanel(reopened);
    await expect(control(reopened, "Restore")).toBeVisible();
    await page.setViewportSize(narrowWindow);
    await expectCovering(reopened);
    await page.setViewportSize(wideWindow);
    await expect(control(reopened, "Restore")).toBeVisible();
    await expect(control(reopened, "Maximize")).toHaveCount(0);
    await expect(banner).toBeHidden();
    await restoreSidePanel(reopened);
    await expectWidth(reopened, chosen);
    await expect(control(reopened, "Maximize")).toBeVisible();
    await expect(banner).toBeVisible();
  });
});

test("beside the open sidebar with too little room, the panel covers the page column without Maximize", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWithReview(page, frontendServices);
  const sidebar = sessionsSidebarParts(page);
  const { banner } = parts(page);
  const review = await openReview(page);
  await sidebar.button.click();
  await expect(sidebar.sidebar).toBeVisible();
  // 880 − 288px sidebar = 592px < two 320px minimums.
  await page.setViewportSize({ width: 880, height: 900 });
  await expectCovering(review);
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
  const { openTerminal } = await takenStoryWorkingSession(
    page,
    frontendServices,
  );
  await page.setViewportSize(wideWindow);
  await page.goto("/");
  const { banner, board } = parts(page);
  const terminal = await openTerminal();
  const rows = terminalScreenParts(terminal).rows;
  const room = await split(page, terminal);
  const chosen = Math.floor(room.pageColumn + room.sidePanel - usableMinimum);
  await dragDivider(page, -2000);
  await expectWidth(terminal, chosen);

  await resizeUntilArranged(terminal, narrowWindow);
  await expectCoveringFillsWindow(terminal, { banner, board });
  await expect(rows).toContainText("attached");
  await expectEveryControlReachable(terminal);
  await expect(terminal.getByRole("heading", { level: 2 })).toBeInViewport();

  await resizeUntilArranged(terminal, wideWindow);
  await expectWidth(terminal, chosen);
  await expect(panelDivider(page)).toBeVisible();
  await expect(control(terminal, "Maximize")).toBeVisible();
  await expect(banner).toBeVisible();
});
