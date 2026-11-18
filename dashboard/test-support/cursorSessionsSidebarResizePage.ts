// The divider between the Sessions sidebar's two lists as the resize and
// layout specs meet it: the held session and the crowded lists
// (./runningCursorSessionsPage.ts) shown in the sidebar, the split and what
// the divider says as shown, each list scrolling on its own, the mouse and
// keys that move the divider, and the preferred height this browser keeps.
import type { Locator, Page } from "@playwright/test";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { box, expectInside } from "./pageLayout.ts";
import {
  openRunningList,
  type RunningCursorParts,
  runningCursorParts,
} from "./runningCursorList.ts";
import {
  answerCrowd,
  changesAsked,
  crowd,
  holdSession,
  keepCrowd,
  scrollTopOf,
  showPage,
  wheelToEnd,
} from "./runningCursorSessionsPage.ts";
import { openSessionsSidebar } from "./sessionsSidebarPage.ts";
import { expect, keptRecord } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { FakeCursor } from "./support/fakeCursor.ts";
import { keepMoreLaunchRecords } from "./support/launchStore.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

// One Up or Down key (2rem), in CSS px.
export const keyStep = 2 * 16;
export const wide = { width: 1440, height: 900 };

// Where the browser keeps the preferred height, and what it keeps there.
export const heightKey = "open-dough.sessionsSidebar.runningCursorHeight";

export const keptHeight = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), heightKey);

export const keepInBrowser = (page: Page, key: string, value: string) =>
  page.evaluate(
    ([name, kept]) => {
      window.localStorage.setItem(name, kept);
    },
    [key, value] as const,
  );

// The section is collapsed, showing no content and no divider.
export async function expectCollapsed({
  header,
  body,
  divider,
}: RunningCursorParts) {
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(body).toHaveCount(0);
  await expect(divider).toHaveCount(0);
}

export const heightOf = async (area: Locator) => (await box(area)).height;

// The room the two lists share, as shown.
export const roomOf = async (shown: RunningCursorParts) =>
  (await heightOf(shown.list)) + (await heightOf(shown.body));

// The Cursor content is `height` tall, and the session list takes the rest of
// the room they share.
export async function expectSplit(
  shown: RunningCursorParts,
  room: number,
  height: number,
) {
  await expect.poll(() => heightOf(shown.body)).toBeCloseTo(height, 0);
  expect(await heightOf(shown.list)).toBeCloseTo(room - height, 0);
}

export async function expectDividerSays(divider: Locator, height: number) {
  await expect(divider).toHaveAttribute("aria-valuenow", String(height));
  await expect(divider).toHaveAttribute(
    "aria-valuetext",
    `${height} pixels tall`,
  );
}

// The Cursor content is `height` tall as the divider says and as the split
// shows.
export async function expectCursorHeight(
  shown: RunningCursorParts,
  room: number,
  height: number,
) {
  await expectDividerSays(shown.divider, height);
  await expectSplit(shown, room, height);
}

export const valueOf = async (divider: Locator, name: string) =>
  Number(await divider.getAttribute(name));

// Presses the mouse on the middle of the divider and holds it there. The
// pointer then moves to an offset from that point, held or released, and
// is released or cancelled by the browser.
export async function grab(page: Page, divider: Locator) {
  const { x, y, width, height } = await box(divider);
  const from = { x: x + width / 2, y: y + height / 2 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  return {
    moveTo: (dx: number, dy: number, steps = 4) =>
      page.mouse.move(from.x + dx, from.y + dy, { steps }),
    release: () => page.mouse.up(),
    cancel: () => divider.dispatchEvent("pointercancel", { pointerId: 1 }),
  };
}

// Drags the divider up (negative) or down by `by` and releases it there.
export async function dragDivider(page: Page, divider: Locator, by: number) {
  const pointer = await grab(page, divider);
  await pointer.moveTo(0, by, 8);
  await pointer.release();
}

export async function press(page: Page, key: string, times: number) {
  for (let pressed = 0; pressed < times; pressed += 1)
    await page.keyboard.press(key);
}

// Gives the divider the keyboard and presses `key` there `times` times.
export async function keyDivider(divider: Locator, key: string, times = 1) {
  await divider.focus();
  await press(divider.page(), key, times);
}

// Wheeling `area` to its end brings its `last` entry inside it and leaves
// each of the `others` scrolled where it was.
export async function expectScrollsOnItsOwn(
  area: Locator,
  last: Locator,
  others: readonly Locator[],
) {
  const tops = await Promise.all(others.map(scrollTopOf));
  await wheelToEnd(area.page(), area);
  await expectInside(last, area);
  for (const [index, other] of others.entries())
    expect(await scrollTopOf(other), "another list stayed in place").toBe(
      tops[index],
    );
}

// The held session and the crowded lists, with the sidebar open showing every
// session and Running Cursor sessions still collapsed. A case keeping more
// records beside the crowd, such as done ones, makes them in `alsoKept`.
export async function showCrowded(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  cursor: FakeCursor,
  alsoKept: () => readonly LaunchRecord[] = () => [],
) {
  await page.setViewportSize(wide);
  const pid = await holdSession(dashboard, cursor);
  const held = keptRecord(dashboard.home);
  keepCrowd(dashboard, held);
  const also = alsoKept();
  if (also.length > 0) keepMoreLaunchRecords(dashboard, also);
  const asked = changesAsked(page);
  await showPage(page, origin);
  await answerCrowd(page, held);
  const calls = cursor.calls().length;
  const shown = runningCursorParts(page);
  await openSessionsSidebar(page);
  await expect(shown.entries).toHaveCount(crowd + 1);
  // Only reads: resizing asks for no launch, attach, done mark, delete, or
  // runner control, and the held client is the one launched.
  const expectNothingChanged = () => {
    expect(asked).toEqual([]);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  };
  return {
    shown,
    heldRows: shown.heldRows(/Open Dough/),
    expectNothingChanged,
  };
}

// The crowded lists with Running Cursor sessions expanded, every held row
// shown.
export async function expandCrowded(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  cursor: FakeCursor,
) {
  const crowded = await showCrowded(page, dashboard, origin, cursor);
  await openRunningList(page);
  await expect(crowded.heldRows).toHaveCount(crowd);
  return crowded;
}
