// The Side panel keeps one preferred width chosen through its Panel divider.
// Both sides retain usable minima. The terminal stays attached and fits; a story
// review keeps its snapshot/file. Content changes, close/reopen, Sessions sidebar
// and Maximize/Restore reuse that width. Insufficient room covers the page.
// Geometry observes the rendered page; only the synthetic Claude is reached.

import { fileDiff, listedFile } from "../support/reviewTreeRows.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { expectFocusedAndIndicated } from "../accessibleReading.ts";
import { storyCardSessions } from "../dashboardPage.ts";
import {
  openTerminalControl,
  pressTerminalKey,
  terminalScreenParts,
  typeLine,
} from "../terminalScreenPage.ts";
import { box, expectSideBySideInOrder } from "../pageLayout.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import {
  control,
  focusDivider,
  pressDividerKey,
  dragDivider,
  cancelDividerDrag,
  expectCovering,
  expectDividerSays,
  expectStillHolds,
  expectWidth,
  keyStep,
  printedSize,
  recordReviewReads,
  split,
  storyAWithSession,
  usableMinimum,
  wideWindow,
  resizeUntilArranged,
} from "../sidePanelWidthPage.ts";
import {
  closeSidePanel,
  maximizeSidePanel,
  restoreSidePanel,
} from "../sidePanelFrame.ts";
import { expect, test } from "../support/preparationPage.ts";

test("mouse and keyboard choose one bounded width that the terminal and a review share", async ({
  page,
  dashboard,
  origin,
}) => {
  const { card, session, terminal, review, divider, attaches } =
    await storyAWithSession(page, dashboard, origin);
  const reviewReads = recordReviewReads(page);
  const rows = terminalScreenParts(terminal).rows;
  const sidebar = sessionsSidebarParts(page);
  const projectUrl = () => page.url();

  await openTerminalControl(storyCardSessions(card)).click();
  await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
  await typeLine(page, "keep this line");
  await expect(rows).toContainText("echo keep this line");
  expect(attaches()).toHaveLength(1);

  const start = await split(page, terminal);
  const room = start.pageColumn + start.sidePanel;
  const maximum = Math.floor(room - usableMinimum);
  await test.step("the panel begins at half the room, with a Panel divider that says its width and bounds", async () => {
    expect(start.sidePanel).toBeCloseTo(room / 2, 0);
    await expect(divider).toHaveAccessibleName("Panel divider");
    await expect(divider).toHaveAttribute("aria-orientation", "vertical");
    await expect(divider).toHaveAttribute(
      "aria-valuemin",
      String(usableMinimum),
    );
    await expect(divider).toHaveAttribute("aria-valuemax", String(maximum));
    await expectDividerSays(page, Math.round(room / 2));
    await expectSideBySideInOrder([page.locator(".page-column"), terminal]);
  });

  await test.step("dragging the divider widens the terminal, which stays attached and fits the new width", async () => {
    const columnsBefore = await printedSize(rows);
    const released = await dragDivider(page, -200);
    const widened = Math.round(room / 2) + 200;
    await expectWidth(terminal, widened);
    await expectDividerSays(page, widened);
    expect((await split(page, terminal)).pageColumn).toBeCloseTo(
      room - widened,
      0,
    );
    await expect
      .poll(() => printedSize(rows))
      .toBeGreaterThan(columnsBefore ?? 0);
    await expectStillHolds(terminal, "echo keep this line");
    expect(attaches()).toHaveLength(1);
    // Released off the divider, the drag has ended: the pointer moves freely.
    await page.mouse.move(released.x - 150, released.y);
    await expectWidth(terminal, widened);
  });

  await test.step("dragging past either bound stops there, and a cancelled drag ends", async () => {
    await dragDivider(page, -2000);
    await expectWidth(terminal, maximum);
    await expectDividerSays(page, maximum);
    expect((await split(page, terminal)).pageColumn).toBeGreaterThanOrEqual(
      usableMinimum - 0.5,
    );
    await dragDivider(page, 2000);
    await expectWidth(terminal, usableMinimum);
    await expectDividerSays(page, usableMinimum);
    await expect(control(terminal, "Close")).toBeInViewport({ ratio: 1 });
    await expect(terminal.getByRole("heading", { level: 2 })).toBeInViewport();

    await cancelDividerDrag(page, { pointerId: 1, by: -300, steps: 4 });
    await expectWidth(terminal, usableMinimum);
    await page.mouse.up();
    expect(attaches()).toHaveLength(1);
  });

  await test.step("Left and Right on the focused divider change the same width within the same bounds", async () => {
    await terminal.getByRole("button").first().focus();
    await page.keyboard.press("Shift+Tab");
    await expectFocusedAndIndicated(page, divider);
    const before = projectUrl();
    await pressDividerKey(page, "ArrowLeft");
    await expectWidth(terminal, usableMinimum + keyStep);
    await expectDividerSays(page, usableMinimum + keyStep);
    await pressDividerKey(page, "ArrowRight");
    await pressDividerKey(page, "ArrowRight");
    await expectWidth(terminal, usableMinimum);
    await pressDividerKey(page, "ArrowLeft", 40);
    await expectWidth(terminal, maximum);
    await expectDividerSays(page, maximum);
    await pressDividerKey(page, "ArrowRight", 8);
    await expectWidth(terminal, maximum - 8 * keyStep);
    expect(projectUrl()).toBe(before);
    await expect(divider).toBeFocused();
    await expectStillHolds(terminal, "echo keep this line");
    expect(attaches()).toHaveLength(1);
  });
  const chosen = maximum - 8 * keyStep;

  await test.step("resizing keys do nothing while the terminal holds the keyboard", async () => {
    await terminalScreenParts(terminal).screen.click();
    await pressTerminalKey(page, "ArrowLeft");
    await pressTerminalKey(page, "ArrowLeft");
    await expectWidth(terminal, chosen);
  });

  await test.step("Maximize offers no divider, and Restore recovers the chosen width", async () => {
    await maximizeSidePanel(terminal);
    await expect(control(terminal, "Restore")).toBeVisible();
    await expect(divider).toHaveCount(0);
    expect((await box(terminal)).width).toBeCloseTo(room, 0);
    await restoreSidePanel(terminal);
    await expectWidth(terminal, chosen);
    await expect(divider).toBeVisible();
    expect(attaches()).toHaveLength(1);
  });

  await test.step("a review takes the same width, and resizing keeps its snapshot and selected file without another read", async () => {
    await reviewChanges(card).click();
    await expect(terminal).toHaveCount(0);
    await expectWidth(review, chosen);
    await listedFile(review, "Modified unstaged.txt").click();
    const diff = fileDiff(review, "Modified unstaged.txt");
    await expect(diff).toContainText("+more wide");
    const readsBefore = reviewReads.length;
    expect(readsBefore).toBeGreaterThan(0);
    await dragDivider(page, 160);
    await expectWidth(review, chosen - 160);
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft");
    await expectWidth(review, chosen - 160 + keyStep);
    await expect(listedFile(review, "Modified unstaged.txt")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(diff).toContainText("+more wide");
    await maximizeSidePanel(review);
    await expect(divider).toHaveCount(0);
    await restoreSidePanel(review);
    await expectWidth(review, chosen - 160 + keyStep);
    expect(reviewReads.length).toBe(readsBefore);
  });

  await test.step("the open sidebar narrows the room without losing the chosen width, which is used again when it closes", async () => {
    // Wider than the room beside the sidebar leaves for the page.
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft", 40);
    await expectWidth(review, maximum);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await expectSideBySideInOrder([
      sidebar.sidebar,
      page.locator(".page-column"),
      review,
    ]);
    const roomBeside = room - (await box(sidebar.sidebar)).width;
    await expectWidth(review, Math.floor(roomBeside - usableMinimum));
    const beside = await split(page, review);
    expect(beside.pageColumn + beside.sidePanel).toBeCloseTo(roomBeside, 0);
    expect(beside.pageColumn).toBeGreaterThanOrEqual(usableMinimum - 0.5);
    await expect(divider).toHaveAttribute(
      "aria-valuemax",
      String(Math.floor(roomBeside - usableMinimum)),
    );
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expectWidth(review, maximum);

    await sidebar.button.click();
    await expectWidth(review, Math.floor(roomBeside - usableMinimum));
    await dragDivider(page, 2000);
    await expectWidth(review, usableMinimum);
    await focusDivider(page);
    await pressDividerKey(page, "ArrowLeft", 3);
    await expectWidth(review, usableMinimum + 3 * keyStep);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expectWidth(review, usableMinimum + 3 * keyStep);
  });
  const kept = usableMinimum + 3 * keyStep;

  await test.step("closing and reopening the terminal uses the chosen width, attached anew", async () => {
    await closeSidePanel(review, { using: "pointer" });
    await expect(review).toHaveCount(0);
    await openTerminalControl(storyCardSessions(card)).click();
    await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
    await expectWidth(terminal, kept);
    await expectDividerSays(page, kept);
    expect(attaches()).toHaveLength(2);
  });

  await test.step("beside the open sidebar, a window too narrow for a usable split covers the page column with no divider, and more room recovers the width", async () => {
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await page.setViewportSize({ width: 900, height: 900 });
    await expectCovering(terminal);
    await expectSideBySideInOrder([sidebar.sidebar, terminal]);
    await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
    await resizeUntilArranged(terminal, wideWindow);
    await expectWidth(terminal, kept);
    await expect(divider).toBeVisible();
    expect(attaches()).toHaveLength(2);
  });
});
