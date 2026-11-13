// Resizing the expanded Running Cursor sessions section of the Sessions
// sidebar against the session list above it, with the divider between them:
// dragged with the mouse, or with Up and Down while it holds the keyboard.
// Both lists keep a usable floor and their own scrolling at either bound; a
// drag ends on release, wherever the pointer is, or on cancellation. How the
// chosen split lasts is ./cursor-sessions-sidebar-resize-lasting.spec.ts's. The crowded
// lists' saved sessions and runner answers are preconditions only; the held
// client is real, and resizing asks it nothing.
import type { Locator } from "@playwright/test";
import { expectFocusedAndIndicated } from "../accessibleReading.ts";
import {
  dragDivider,
  expandCrowded,
  expectCursorHeight,
  expectScrollsOnItsOwn,
  expectSplit,
  grab,
  heightOf,
  keyStep,
  press,
  roomOf,
  valueOf,
} from "../cursorSessionsSidebarResizePage.ts";
import { box, expectInside } from "../pageLayout.ts";
import type { RunningCursorParts } from "../runningCursorList.ts";
import {
  listFloor as floor,
  scrollTopOf,
} from "../runningCursorSessionsPage.ts";
import { expect, test } from "../support/cursorStart.ts";

test.use({ cursorScreen: "working" });

// Each list's first and last entries are in reach by its own scrolling,
// leaving the other list where it was, with the runner's status above the
// held rows; the header and the divider stay in view.
async function expectBothInReach(shown: RunningCursorParts, heldRows: Locator) {
  for (const area of [shown.list, shown.body])
    await area.evaluate((element) => {
      element.scrollTo(0, 0);
    });
  await expectInside(shown.entries.first(), shown.list);
  await expectInside(
    shown.body.getByText("The Cursor runner is running."),
    shown.body,
  );
  await expectInside(heldRows.first(), shown.body);
  await expectScrollsOnItsOwn(shown.list, shown.entries.last(), [shown.body]);
  await expectScrollsOnItsOwn(shown.body, heldRows.last(), [shown.list]);
  await expect(shown.header).toBeInViewport({ ratio: 1 });
  await expect(shown.divider).toBeInViewport();
}

test("dragging the divider or pressing Up and Down resizes both lists within their floors, and a released or cancelled drag ends", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  const { shown, heldRows, expectNothingChanged } = await expandCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const { divider, header } = shown;
  const room = await roomOf(shown);
  const start = Math.round(room / 2);
  const maximum = await valueOf(divider, "aria-valuemax");

  await test.step("the divider between the lists is a horizontal separator that says the Cursor list's height and bounds", async () => {
    await expect(divider).toHaveAccessibleName(
      "Running Cursor sessions divider",
    );
    await expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    await expect(divider).toHaveAttribute("aria-valuemin", String(floor));
    expect(maximum).toBe(Math.floor(room - floor));
    await expectCursorHeight(shown, room, start);
    const [list, line, section] = await Promise.all([
      box(shown.list),
      box(divider),
      box(header),
    ]);
    expect(line.y + line.height / 2).toBeGreaterThanOrEqual(
      list.y + list.height,
    );
    expect(line.y + line.height / 2).toBeLessThanOrEqual(section.y);
  });

  await test.step("dragging the divider up grows the Cursor list and shrinks the session list as the mouse moves", async () => {
    const pointer = await grab(page, divider);
    await pointer.moveTo(0, -60);
    // Not yet released.
    await expectSplit(shown, room, start + 60);
    await pointer.moveTo(0, -100);
    await expectCursorHeight(shown, room, start + 100);
    await pointer.moveTo(0, -40);
    await expectSplit(shown, room, start + 40);
    await pointer.release();
  });

  await test.step("released off the divider, the drag has ended: the mouse moves freely", async () => {
    const pointer = await grab(page, divider);
    await pointer.moveTo(200, -80);
    await pointer.release();
    await expectSplit(shown, room, start + 120);
    await pointer.moveTo(200, 150);
    await pointer.moveTo(0, 200);
    await expectCursorHeight(shown, room, start + 120);
  });

  await test.step("a cancelled drag ends", async () => {
    const pointer = await grab(page, divider);
    await pointer.cancel();
    await pointer.moveTo(0, 150);
    await expectSplit(shown, room, start + 120);
    await pointer.release();
    await expectSplit(shown, room, start + 120);
  });

  await test.step("dragged past the top, the session list keeps its floor and both lists stay in reach", async () => {
    await dragDivider(page, divider, -2000);
    await expectCursorHeight(shown, room, maximum);
    expect(await heightOf(shown.list)).toBeGreaterThanOrEqual(floor - 0.5);
    await expectBothInReach(shown, heldRows);
  });

  await test.step("dragged past the bottom, the Cursor list keeps its floor and both lists stay in reach", async () => {
    await dragDivider(page, divider, 2000);
    await expectCursorHeight(shown, room, floor);
    await expectBothInReach(shown, heldRows);
  });

  await test.step("with the keyboard on the divider, Up grows the Cursor list and Down shrinks it, within the same bounds", async () => {
    // The keyboard reaches the divider just before the section's header.
    await header.focus();
    await page.keyboard.press("Shift+Tab");
    await expectFocusedAndIndicated(page, divider);
    const sidebarTop = await scrollTopOf(shown.sidebar);
    await page.keyboard.press("ArrowUp");
    await expectCursorHeight(shown, room, floor + keyStep);
    await press(page, "ArrowDown", 3);
    await expectSplit(shown, room, floor);
    await press(page, "ArrowUp", 40);
    await expectCursorHeight(shown, room, maximum);
    await press(page, "ArrowDown", 4);
    await expectSplit(shown, room, maximum - 4 * keyStep);
    await expect(divider).toBeFocused();
    // The keys resize only: neither the sidebar nor a list scrolls.
    expect(await scrollTopOf(shown.sidebar)).toBe(sidebarTop);
  });

  expectNothingChanged();
});
