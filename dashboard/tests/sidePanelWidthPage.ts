// The side panel's resize edge and widths as shown, for Story A's real
// worktree (./support/storyReviewWorktree.ts) and its session, listed by the
// synthetic `claude` (./fixtures/fake-claude), which prints its terminal size
// whenever that changes.

import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../src/storyReview.ts";
import { box } from "./pageLayout.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { listed } from "./support/storyPanels.ts";
import {
  keepLaunchRecords,
  storyALaunchRecord,
  storyWorktree,
} from "./support/storyReviewWorktree.ts";

export const wideWindow = { width: 1440, height: 900 };
// Neither side is narrower than this, in CSS px (20rem).
export const usableMinimum = 320;
// One Left or Right key (2rem).
export const keyStep = 32;

// Parts cut by design and read whole by scrolling them: the terminal's own
// screen, and a review's paths and code lines.
export const scrollsOnItsOwn = [
  ".terminal-screen",
  ".story-review-files",
  ".story-review-code",
];

export const resizeEdge = (page: Page) =>
  page.getByRole("separator", { name: "Resize panel" });

// The page column and the panel, side by side, as shown.
export async function split(page: Page, panel: Locator) {
  const [dashboard, shown] = await Promise.all([
    box(page.locator(".page-column")),
    box(panel),
  ]);
  return { dashboard: dashboard.width, panel: shown.width };
}

// Drags the edge sideways by `by` px with the mouse and releases it there,
// off the edge.
export async function dragEdge(page: Page, by: number) {
  const { x, y, width, height } = await box(resizeEdge(page));
  const from = { x: x + width / 2, y: y + height / 2 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + by, from.y, { steps: 8 });
  await page.mouse.up();
  return { x: from.x + by, y: from.y };
}

// The terminal's latest size as the session printed it.
export async function printedSize(rows: Locator) {
  const sizes = [
    ...((await rows.textContent()) ?? "").matchAll(
      /(?:attached \S+|resized) (\d+)x(\d+)/g,
    ),
  ];
  const last = sizes.at(-1);
  return last === undefined ? undefined : Number(last[1]);
}

// Earlier output the terminal still holds, however many size lines the session
// printed after it: read by scrolling up over the terminal's history, which
// leaves the keyboard where it is. One wheel step scrolls only about five
// lines, and CI's session prints a size line for each resize, so each try
// scrolls many steps at a fixed short interval rather than backing off.
export async function expectStillHolds(terminal: Locator, text: string) {
  const rows = terminal.locator(".xterm-rows");
  await terminal.locator(".xterm-screen").hover();
  await expect(async () => {
    for (let step = 0; step < 10; step += 1)
      await terminal.page().mouse.wheel(0, -1000);
    await expect(rows).toContainText(text, { timeout: 100 });
  }).toPass({ intervals: [100] });
}

export async function expectWidth(panel: Locator, width: number) {
  await expect
    .poll(async () => Math.round((await box(panel)).width))
    .toBe(width);
}

export async function expectEdgeSays(page: Page, width: number) {
  const edge = resizeEdge(page);
  await expect(edge).toHaveAttribute("aria-valuenow", String(width));
  await expect(edge).toHaveAttribute("aria-valuetext", `${width} pixels wide`);
}

// Story A's card, its session listed and its review available, and the
// panel's parts.
export async function storyAWithSession(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const { workspace } = storyWorktree(origin);
  const session = dashboard.claudeListsSession({
    name: "Story A",
    cwd: workspace,
    startedAt: Date.now(),
  });
  await keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspace, listed(session)),
  ]);
  await page.setViewportSize(wideWindow);
  const card = await openBacklog(page, origin);
  return {
    card,
    session,
    terminal: page.getByRole("region", { name: "Terminal" }),
    review: page.getByRole("region", { name: "Review changes" }),
    edge: resizeEdge(page),
    // The session's attachments so far.
    attaches: () => {
      const all = dashboard.claudeAttaches();
      expect(all.length).toBeGreaterThan(0);
      return all.filter((attached) => attached.id === session.slice(0, 8));
    },
  };
}

// A panel's own header control.
export const control = (panel: Locator, name: string) =>
  panel.getByRole("button", { name, exact: true });

// Every review read the page asks from now on: its snapshots and its files'
// diffs.
export function recordReviewReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (
      pathname === storyReviewEndpoint ||
      pathname === storyReviewFileEndpoint
    )
      reads.push(pathname);
  });
  return reads;
}
