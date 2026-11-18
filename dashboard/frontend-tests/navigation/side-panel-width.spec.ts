// The Side panel keeps one preferred width chosen through its Panel divider.
// Both sides retain usable minima. The terminal stays attached and fits; a
// story review keeps its reads. Close/reopen, the Sessions sidebar and
// Maximize/Restore reuse that width; insufficient room covers the page. A
// reload's recovery is ./side-panel-width-kept.spec.ts; the narrow window's
// covering is ./side-panel-width-covering.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { takenStoryWorkingSession } from "../../test-support/support/frontendCardSessions.ts";
import { expectFocusedAndIndicated } from "../../test-support/accessibleReading.ts";
import {
  pressTerminalKey,
  terminalScreenParts,
  typeLine,
} from "../../test-support/terminalScreenPage.ts";
import { box, expectSideBySideInOrder } from "../../test-support/pageLayout.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import {
  expectStillHolds,
  sidePanelWidthPage,
} from "../../test-support/sidePanelWidthPage.ts";
import {
  closeSidePanel,
  maximizeSidePanel,
  restoreSidePanel,
} from "../../test-support/sidePanelFrame.ts";

test("mouse and keyboard choose one bounded width for an attached terminal that fits it", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  // The page's terminal connections: resizing never reconnects.
  const { sizes, attaches, openTerminal } = await takenStoryWorkingSession(
    page,
    frontendServices,
  );
  await page.setViewportSize(width.wideWindow);
  await page.goto("/");
  const divider = width.divider;
  const sidebar = sessionsSidebarParts(page);
  const terminal = await openTerminal();
  const rows = terminalScreenParts(terminal).rows;
  await typeLine(page, "keep this line");
  await expect(rows).toContainText("keep this line");
  expect(attaches()).toBe(1);

  const start = await width.split(terminal);
  const room = start.pageColumn + start.sidePanel;
  const maximum = Math.floor(room - width.usableMinimum);
  await test.step("the panel begins at half the room, with a Panel divider that says its width and bounds", async () => {
    expect(start.sidePanel).toBeCloseTo(room / 2, 0);
    await expect(divider).toHaveAccessibleName("Panel divider");
    await expect(divider).toHaveAttribute("aria-orientation", "vertical");
    await expect(divider).toHaveAttribute(
      "aria-valuemin",
      String(width.usableMinimum),
    );
    await expect(divider).toHaveAttribute("aria-valuemax", String(maximum));
    await width.expectDividerSays(Math.round(room / 2));
    await expectSideBySideInOrder([page.locator(".page-column"), terminal]);
  });

  await test.step("dragging the divider widens the terminal, which stays attached and fits the new width", async () => {
    const colsBefore = sizes.at(-1)?.cols ?? 0;
    const released = await width.dragDivider(-200);
    const widened = Math.round(room / 2) + 200;
    await width.expectWidth(terminal, widened);
    await width.expectDividerSays(widened);
    expect((await width.split(terminal)).pageColumn).toBeCloseTo(
      room - widened,
      0,
    );
    await expect
      .poll(() => sizes.at(-1)?.cols ?? 0)
      .toBeGreaterThan(colsBefore);
    await expectStillHolds(terminal, "keep this line");
    // Released off the divider, the drag has ended: the pointer moves freely.
    await page.mouse.move(released.x - 150, released.y);
    await width.expectWidth(terminal, widened);
    expect(attaches()).toBe(1);
  });

  await test.step("dragging past either bound stops there, and a cancelled drag ends", async () => {
    await width.dragDivider(-2000);
    await width.expectWidth(terminal, maximum);
    await width.expectDividerSays(maximum);
    expect((await width.split(terminal)).pageColumn).toBeGreaterThanOrEqual(
      width.usableMinimum - 0.5,
    );
    await width.dragDivider(2000);
    await width.expectWidth(terminal, width.usableMinimum);
    await width.expectDividerSays(width.usableMinimum);
    await expect(width.control(terminal, "Close")).toBeInViewport({ ratio: 1 });
    await expect(terminal.getByRole("heading", { level: 2 })).toBeInViewport();
    await width.cancelDividerDrag({ pointerId: 1, by: -300, steps: 4 });
    await width.expectWidth(terminal, width.usableMinimum);
    await page.mouse.up();
    expect(attaches()).toBe(1);
  });

  await test.step("Left and Right on the focused divider change the same width within the same bounds", async () => {
    await terminal.getByRole("button").first().focus();
    await page.keyboard.press("Shift+Tab");
    await expectFocusedAndIndicated(page, divider);
    const before = page.url();
    await width.pressDividerKey("ArrowLeft");
    await width.expectWidth(terminal, width.usableMinimum + width.keyStep);
    await width.expectDividerSays(width.usableMinimum + width.keyStep);
    await width.pressDividerKey("ArrowRight", 2);
    await width.expectWidth(terminal, width.usableMinimum);
    await width.pressDividerKey("ArrowLeft", 40);
    await width.expectWidth(terminal, maximum);
    await width.pressDividerKey("ArrowRight", 8);
    await width.expectWidth(terminal, maximum - 8 * width.keyStep);
    expect(page.url()).toBe(before);
    await expect(divider).toBeFocused();
    expect(attaches()).toBe(1);
  });
  const chosen = maximum - 8 * width.keyStep;

  await test.step("resizing keys do nothing while the terminal holds the keyboard", async () => {
    await terminalScreenParts(terminal).screen.click();
    await pressTerminalKey(page, "ArrowLeft");
    await pressTerminalKey(page, "ArrowLeft");
    await width.expectWidth(terminal, chosen);
  });

  await test.step("Maximize offers no divider, and Restore recovers the chosen width", async () => {
    await maximizeSidePanel(terminal);
    await expect(width.control(terminal, "Restore")).toBeVisible();
    await expect(divider).toHaveCount(0);
    expect((await box(terminal)).width).toBeCloseTo(room, 0);
    await restoreSidePanel(terminal);
    await width.expectWidth(terminal, chosen);
    await expectStillHolds(terminal, "keep this line");
    expect(attaches()).toBe(1);
  });

  await test.step("closing and reopening the terminal uses the chosen width, attached anew", async () => {
    await closeSidePanel(terminal, { using: "pointer" });
    await expect(terminal).toHaveCount(0);
    await openTerminal();
    await width.expectWidth(terminal, chosen);
    await width.expectDividerSays(chosen);
    expect(attaches()).toBe(2);
  });

  await test.step("beside the open sidebar, a window too narrow for a usable split covers the page column with no divider, and more room recovers the width", async () => {
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeVisible();
    await page.setViewportSize({ width: 900, height: 900 });
    await width.expectCovering(terminal);
    await expectSideBySideInOrder([sidebar.sidebar, terminal]);
    await width.resizeUntilArranged(terminal, width.wideWindow);
    await expect(divider).toBeVisible();
    await sidebar.button.click();
    await expect(sidebar.sidebar).toBeHidden();
    await width.expectWidth(terminal, chosen);
    expect(attaches()).toBe(2);
  });
});
