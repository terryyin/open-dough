// Resizing the expanded Running Cursor sessions section of the Sessions
// sidebar against the session list above it, with the edge between them:
// dragged with the mouse, or with Up and Down while it holds the keyboard.
// Both lists keep a usable floor and their own scrolling at either bound; a
// drag ends on release, wherever the pointer is, or on cancellation. How the
// chosen split lasts is ./cursor-sidebar-resize-lasting.spec.ts's. The crowded
// lists' saved sessions and runner answers are preconditions only; the held
// client is real, and resizing asks it nothing.
import type { Locator, Page } from "@playwright/test";
import { expectFocusedAndIndicated } from "./accessibleReading.ts";
import {
  dragEdge,
  expandCrowded,
  expectEdgeSays,
  expectSplit,
  grab,
  heightOf,
  keyStep,
  press,
  roomOf,
  type Shown,
  valueOf,
} from "./cursorSidebarResizePage.ts";
import { box, expectInside } from "./pageLayout.ts";
import {
  listFloor as floor,
  scrollTopOf,
  wheelToEnd,
} from "./runningCursorSessionsPage.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({ cursorScreen: "working" });

// Each list's first and last entries are in reach by its own scrolling,
// leaving the other list where it was, with the runner's status above the
// held rows; the header and the edge stay in view.
async function expectBothInReach(page: Page, shown: Shown, heldRows: Locator) {
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
  const bodyTop = await scrollTopOf(shown.body);
  await wheelToEnd(page, shown.list);
  await expectInside(shown.entries.last(), shown.list);
  expect(await scrollTopOf(shown.body)).toBe(bodyTop);
  const listTop = await scrollTopOf(shown.list);
  await wheelToEnd(page, shown.body);
  await expectInside(heldRows.last(), shown.body);
  expect(await scrollTopOf(shown.list)).toBe(listTop);
  await expect(shown.header).toBeInViewport({ ratio: 1 });
  await expect(shown.edge).toBeInViewport();
}

test("dragging the edge or pressing Up and Down resizes both lists within their floors, and a released or cancelled drag ends", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const { shown, heldRows, expectNothingChanged } = await expandCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const { edge, header } = shown;
  const room = await roomOf(shown);
  const start = Math.round(room / 2);
  const maximum = await valueOf(edge, "aria-valuemax");

  await test.step("the edge between the lists is a horizontal separator that says the Cursor list's height and bounds", async () => {
    await expect(edge).toHaveAttribute("aria-orientation", "horizontal");
    await expect(edge).toHaveAttribute("aria-valuemin", String(floor));
    expect(maximum).toBe(Math.floor(room - floor));
    await expectEdgeSays(edge, start);
    await expectSplit(shown, room, start);
    const [list, line, section] = await Promise.all([
      box(shown.list),
      box(edge),
      box(header),
    ]);
    expect(line.y + line.height / 2).toBeGreaterThanOrEqual(
      list.y + list.height,
    );
    expect(line.y + line.height / 2).toBeLessThanOrEqual(section.y);
  });

  await test.step("dragging the edge up grows the Cursor list and shrinks the session list as the mouse moves", async () => {
    const from = await grab(page, edge);
    await page.mouse.move(from.x, from.y - 60, { steps: 4 });
    // Not yet released.
    await expectSplit(shown, room, start + 60);
    await page.mouse.move(from.x, from.y - 100, { steps: 4 });
    await expectSplit(shown, room, start + 100);
    await expectEdgeSays(edge, start + 100);
    await page.mouse.move(from.x, from.y - 40, { steps: 4 });
    await expectSplit(shown, room, start + 40);
    await page.mouse.up();
  });

  await test.step("released off the edge, the drag has ended: the mouse moves freely", async () => {
    const from = await grab(page, edge);
    await page.mouse.move(from.x + 200, from.y - 80, { steps: 4 });
    await page.mouse.up();
    await expectSplit(shown, room, start + 120);
    await page.mouse.move(from.x + 200, from.y + 150, { steps: 4 });
    await page.mouse.move(from.x, from.y + 200, { steps: 4 });
    await expectSplit(shown, room, start + 120);
    await expectEdgeSays(edge, start + 120);
  });

  await test.step("a cancelled drag ends", async () => {
    await grab(page, edge);
    await edge.dispatchEvent("pointercancel", { pointerId: 1 });
    const { x, y } = await box(edge);
    await page.mouse.move(x, y + 150, { steps: 4 });
    await expectSplit(shown, room, start + 120);
    await page.mouse.up();
    await expectSplit(shown, room, start + 120);
  });

  await test.step("dragged past the top, the session list keeps its floor and both lists stay in reach", async () => {
    await dragEdge(page, edge, -2000);
    await expectSplit(shown, room, maximum);
    await expectEdgeSays(edge, maximum);
    expect(await heightOf(shown.list)).toBeGreaterThanOrEqual(floor - 0.5);
    await expectBothInReach(page, shown, heldRows);
  });

  await test.step("dragged past the bottom, the Cursor list keeps its floor and both lists stay in reach", async () => {
    await dragEdge(page, edge, 2000);
    await expectSplit(shown, room, floor);
    await expectEdgeSays(edge, floor);
    await expectBothInReach(page, shown, heldRows);
  });

  await test.step("with the keyboard on the edge, Up grows the Cursor list and Down shrinks it, within the same bounds", async () => {
    // The keyboard reaches the edge just before the section's header.
    await header.focus();
    await page.keyboard.press("Shift+Tab");
    await expectFocusedAndIndicated(page, edge);
    const sidebarTop = await scrollTopOf(shown.sidebar);
    await page.keyboard.press("ArrowUp");
    await expectSplit(shown, room, floor + keyStep);
    await expectEdgeSays(edge, floor + keyStep);
    await press(page, "ArrowDown", 3);
    await expectSplit(shown, room, floor);
    await press(page, "ArrowUp", 40);
    await expectSplit(shown, room, maximum);
    await expectEdgeSays(edge, maximum);
    await press(page, "ArrowDown", 4);
    await expectSplit(shown, room, maximum - 4 * keyStep);
    await expect(edge).toBeFocused();
    // The keys resize only: neither the sidebar nor a list scrolls.
    expect(await scrollTopOf(shown.sidebar)).toBe(sidebarTop);
  });

  expectNothingChanged();
});
