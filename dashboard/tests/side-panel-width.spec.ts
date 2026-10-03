// The page's one side panel keeps one preferred width, chosen by dragging its
// edge or with Left and Right while the edge holds the keyboard
// (./sidePanelWidthPage.ts). Neither the panel nor the dashboard becomes
// narrower than its usable minimum; the terminal stays attached and fits each
// width, and a review keeps its snapshot and selected file. Content changes,
// closing and reopening, the Sessions sidebar, and Maximize/Restore all reuse
// the width; beside the sidebar, a window too narrow for a usable split stacks
// the panel with no edge. Geometry is measured from the page as shown; the
// real `claude` is never reached.

import { expectFocusedAndIndicated } from "./accessibleReading.ts";
import { cardSessions } from "./dashboardPage.ts";
import {
  box,
  expectSideBySideInOrder,
  expectStackedInOrder,
  pressWhereShown,
} from "./pageLayout.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  control,
  dragEdge,
  expectEdgeSays,
  expectStillHolds,
  expectWidth,
  keyStep,
  printedSize,
  recordReviewReads,
  split,
  storyAWithSession,
  usableMinimum,
  wideWindow,
} from "./sidePanelWidthPage.ts";
import { expect, test } from "./support/preparationPage.ts";

test("mouse and keyboard choose one bounded width that the terminal and a review share", async ({
  page,
  dashboard,
  origin,
}) => {
  const { card, session, terminal, review, edge, attaches } =
    await storyAWithSession(page, dashboard, origin);
  const reviewReads = recordReviewReads(page);
  const rows = terminal.locator(".xterm-rows");
  const sidebar = sidebarParts(page);
  const projectUrl = () => page.url();

  await cardSessions(card)
    .getByRole("button", { name: "Open terminal" })
    .click();
  await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
  await page.keyboard.type("keep this line");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo keep this line");
  expect(attaches()).toHaveLength(1);

  const start = await split(page, terminal);
  const room = start.dashboard + start.panel;
  const maximum = Math.floor(room - usableMinimum);
  await test.step("the panel begins at half the room, with an edge that says its width and bounds", async () => {
    expect(start.panel).toBeCloseTo(room / 2, 0);
    await expect(edge).toHaveAttribute("aria-orientation", "vertical");
    await expect(edge).toHaveAttribute("aria-valuemin", String(usableMinimum));
    await expect(edge).toHaveAttribute("aria-valuemax", String(maximum));
    await expectEdgeSays(page, Math.round(room / 2));
    await expectSideBySideInOrder([page.locator(".page-column"), terminal]);
  });

  await test.step("dragging the edge widens the terminal, which stays attached and fits the new width", async () => {
    const columnsBefore = await printedSize(rows);
    const released = await dragEdge(page, -200);
    const widened = Math.round(room / 2) + 200;
    await expectWidth(terminal, widened);
    await expectEdgeSays(page, widened);
    expect((await split(page, terminal)).dashboard).toBeCloseTo(
      room - widened,
      0,
    );
    await expect
      .poll(() => printedSize(rows))
      .toBeGreaterThan(columnsBefore ?? 0);
    await expectStillHolds(terminal, "echo keep this line");
    expect(attaches()).toHaveLength(1);
    // Released off the edge, the drag has ended: the pointer moves freely.
    await page.mouse.move(released.x - 150, released.y);
    await expectWidth(terminal, widened);
  });

  await test.step("dragging past either bound stops there, and a cancelled drag ends", async () => {
    await dragEdge(page, -2000);
    await expectWidth(terminal, maximum);
    await expectEdgeSays(page, maximum);
    expect((await split(page, terminal)).dashboard).toBeGreaterThanOrEqual(
      usableMinimum - 0.5,
    );
    await dragEdge(page, 2000);
    await expectWidth(terminal, usableMinimum);
    await expectEdgeSays(page, usableMinimum);
    await expect(control(terminal, "Close")).toBeInViewport({ ratio: 1 });
    await expect(terminal.getByRole("heading", { level: 2 })).toBeInViewport();

    const { x, y, width, height } = await box(edge);
    await page.mouse.move(x + width / 2, y + height / 2);
    await page.mouse.down();
    await edge.dispatchEvent("pointercancel", { pointerId: 1 });
    await page.mouse.move(x - 300, y + height / 2, { steps: 4 });
    await expectWidth(terminal, usableMinimum);
    await page.mouse.up();
    expect(attaches()).toHaveLength(1);
  });

  await test.step("Left and Right on the focused edge change the same width within the same bounds", async () => {
    // The keyboard reaches the edge just before the panel's header controls.
    await terminal.getByRole("button").first().focus();
    await page.keyboard.press("Shift+Tab");
    await expectFocusedAndIndicated(page, edge);
    const before = projectUrl();
    await page.keyboard.press("ArrowLeft");
    await expectWidth(terminal, usableMinimum + keyStep);
    await expectEdgeSays(page, usableMinimum + keyStep);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expectWidth(terminal, usableMinimum);
    for (let press = 0; press < 40; press += 1)
      await page.keyboard.press("ArrowLeft");
    await expectWidth(terminal, maximum);
    await expectEdgeSays(page, maximum);
    for (let press = 0; press < 8; press += 1)
      await page.keyboard.press("ArrowRight");
    await expectWidth(terminal, maximum - 8 * keyStep);
    // The page's own Left/Right project navigation is not reached.
    expect(projectUrl()).toBe(before);
    await expect(edge).toBeFocused();
    await expectStillHolds(terminal, "echo keep this line");
    expect(attaches()).toHaveLength(1);
  });
  const chosen = maximum - 8 * keyStep;

  await test.step("resizing keys do nothing while the terminal holds the keyboard", async () => {
    await terminal.locator(".xterm-screen").click();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expectWidth(terminal, chosen);
  });

  await test.step("Maximize offers no edge, and Restore recovers the chosen width", async () => {
    await pressWhereShown(control(terminal, "Maximize"));
    await expect(control(terminal, "Restore")).toBeVisible();
    await expect(edge).toHaveCount(0);
    expect((await box(terminal)).width).toBeCloseTo(room, 0);
    await pressWhereShown(control(terminal, "Restore"));
    await expectWidth(terminal, chosen);
    await expect(edge).toBeVisible();
    expect(attaches()).toHaveLength(1);
  });

  await test.step("a review takes the same width, and resizing keeps its snapshot and selected file without another read", async () => {
    await card.getByRole("button", { name: "Review changes" }).click();
    await expect(terminal).toHaveCount(0);
    await expectWidth(review, chosen);
    await review.getByRole("button", { name: "Modified unstaged.txt" }).click();
    const diff = review.getByRole("region", { name: "Modified unstaged.txt" });
    await expect(diff).toContainText("+more wide");
    const readsBefore = reviewReads.length;
    expect(readsBefore).toBeGreaterThan(0);
    await dragEdge(page, 160);
    await expectWidth(review, chosen - 160);
    await edge.focus();
    await page.keyboard.press("ArrowLeft");
    await expectWidth(review, chosen - 160 + keyStep);
    await expect(
      review.getByRole("button", { name: "Modified unstaged.txt" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(diff).toContainText("+more wide");
    await pressWhereShown(control(review, "Maximize"));
    await expect(edge).toHaveCount(0);
    await pressWhereShown(control(review, "Restore"));
    await expectWidth(review, chosen - 160 + keyStep);
    expect(reviewReads.length).toBe(readsBefore);
  });

  await test.step("the open sidebar narrows the room without losing the chosen width, which is used again when it closes", async () => {
    // Wider than the room beside the sidebar leaves for the page.
    await edge.focus();
    for (let press = 0; press < 40; press += 1)
      await page.keyboard.press("ArrowLeft");
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
    expect(beside.dashboard + beside.panel).toBeCloseTo(roomBeside, 0);
    expect(beside.dashboard).toBeGreaterThanOrEqual(usableMinimum - 0.5);
    await expect(edge).toHaveAttribute(
      "aria-valuemax",
      String(Math.floor(roomBeside - usableMinimum)),
    );
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expectWidth(review, maximum);

    // A width chosen beside the sidebar stays when it closes.
    await sidebar.button.click();
    await expectWidth(review, Math.floor(roomBeside - usableMinimum));
    await dragEdge(page, 2000);
    await expectWidth(review, usableMinimum);
    await edge.focus();
    for (let press = 0; press < 3; press += 1)
      await page.keyboard.press("ArrowLeft");
    await expectWidth(review, usableMinimum + 3 * keyStep);
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await expectWidth(review, usableMinimum + 3 * keyStep);
  });
  const kept = usableMinimum + 3 * keyStep;

  await test.step("closing and reopening the terminal uses the chosen width, attached anew", async () => {
    await pressWhereShown(control(review, "Close"));
    await expect(review).toHaveCount(0);
    await cardSessions(card)
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
    await expectWidth(terminal, kept);
    await expectEdgeSays(page, kept);
    expect(attaches()).toHaveLength(2);
  });

  await test.step("beside the open sidebar, a window too narrow for a usable split stacks the panel with no edge, and more room recovers the width", async () => {
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await page.setViewportSize({ width: 900, height: 900 });
    await expect(edge).toHaveCount(0);
    await expectSideBySideInOrder([sidebar.sidebar, terminal]);
    await expectStackedInOrder([terminal, page.locator(".page-column")]);
    await expect(rows).toContainText(`attached ${session.slice(0, 8)}`);
    await page.setViewportSize(wideWindow);
    await expectWidth(terminal, kept);
    await expect(edge).toBeVisible();
    expect(attaches()).toHaveLength(2);
  });
});
