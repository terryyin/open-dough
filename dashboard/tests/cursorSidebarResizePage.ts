// The edge between the Sessions sidebar's two lists as the resize specs meet
// it: the held session and the crowded lists (./runningCursorSessionsPage.ts)
// with the section expanded, the split and what the edge says as shown, and
// the mouse and keys that move it, and the preferred height this browser
// keeps.
import type { Locator, Page } from "@playwright/test";
import { box } from "./pageLayout.ts";
import {
  answerCrowd,
  changesAsked,
  crowd,
  holdSession,
  keepCrowd,
  runningCursorParts,
  showPage,
} from "./runningCursorSessionsPage.ts";
import { expect, keptRecord } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { FakeCursor } from "./support/fakeCursor.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

// One Up or Down key (2rem), in CSS px.
export const keyStep = 2 * 16;
export const wide = { width: 1440, height: 900 };

export type Shown = ReturnType<typeof runningCursorParts>;

// Where the browser keeps the preferred height, and what it keeps there.
export const heightKey = "open-dough.sessionSidebar.runningCursorHeight";

export const keptHeight = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), heightKey);

export const keepInBrowser = (page: Page, key: string, value: string) =>
  page.evaluate(
    ([name, kept]) => {
      window.localStorage.setItem(name, kept);
    },
    [key, value] as const,
  );

// The section is collapsed, showing no content and no edge.
export async function expectCollapsed({ header, body, edge }: Shown) {
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(body).toHaveCount(0);
  await expect(edge).toHaveCount(0);
}

export const heightOf = async (area: Locator) => (await box(area)).height;

// The room the two lists share, as shown.
export const roomOf = async (shown: Shown) =>
  (await heightOf(shown.list)) + (await heightOf(shown.body));

// The Cursor content is `height` tall, and the session list takes the rest of
// the room they share.
export async function expectSplit(shown: Shown, room: number, height: number) {
  await expect.poll(() => heightOf(shown.body)).toBeCloseTo(height, 0);
  expect(await heightOf(shown.list)).toBeCloseTo(room - height, 0);
}

export async function expectEdgeSays(edge: Locator, height: number) {
  await expect(edge).toHaveAttribute("aria-valuenow", String(height));
  await expect(edge).toHaveAttribute("aria-valuetext", `${height} pixels tall`);
}

export const valueOf = async (edge: Locator, name: string) =>
  Number(await edge.getAttribute(name));

// Presses the mouse on the middle of the edge and holds it there.
export async function grab(page: Page, edge: Locator) {
  const { x, y, width, height } = await box(edge);
  const from = { x: x + width / 2, y: y + height / 2 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  return from;
}

// Drags the edge up (negative) or down by `by` and releases it there.
export async function dragEdge(page: Page, edge: Locator, by: number) {
  const from = await grab(page, edge);
  await page.mouse.move(from.x, from.y + by, { steps: 8 });
  await page.mouse.up();
}

export async function press(page: Page, key: string, times: number) {
  for (let pressed = 0; pressed < times; pressed += 1)
    await page.keyboard.press(key);
}

// The held session and the crowded lists, with the sidebar open and the
// section expanded.
export async function expandCrowded(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  cursor: FakeCursor,
) {
  await page.setViewportSize(wide);
  const pid = await holdSession(dashboard, cursor);
  const held = keptRecord(dashboard.home);
  await keepCrowd(dashboard, held);
  const asked = changesAsked(page);
  await showPage(page, origin);
  await answerCrowd(page, held);
  const calls = cursor.calls().length;
  const shown = runningCursorParts(page);
  const heldRows = shown.region.getByRole("button", { name: /Open Dough/ });
  await shown.button.click();
  await expect(shown.entries).toHaveCount(crowd + 1);
  await shown.header.click();
  await expect(heldRows).toHaveCount(crowd);
  // Only reads: resizing asks for no launch, attach, done mark, delete, or
  // runner control, and the held client is the one launched.
  const expectNothingChanged = () => {
    expect(asked).toEqual([]);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  };
  return { shown, heldRows, expectNothingChanged };
}
