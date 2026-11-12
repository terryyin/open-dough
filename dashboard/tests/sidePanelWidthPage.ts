// The side panel's resize divider and widths as shown, for Story A's real
// worktree (./support/storyReviewWorktree.ts) and its session, listed by the
// synthetic `claude` (./fixtures/fake-claude), which prints its terminal size
// whenever that changes.

import { reviewRegion } from "./support/storyReviewMark.ts";
import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../src/storyReviewContract.ts";
import { box } from "./pageLayout.ts";
import { terminalPanel, terminalScreenParts } from "./terminalScreenPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { listed } from "./support/sidePanelContents.ts";
import { storyWorktree } from "./support/storyReviewWorktree.ts";
import { keepLaunchRecords } from "./support/launchStore.ts";
import { storyALaunchRecord } from "./support/storyLaunchRecord.ts";

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

export { panelDivider } from "./sidePanelFrame.ts";
import { panelDivider } from "./sidePanelFrame.ts";
export {
  control,
  expectBoardUnreachableBehindCovering,
  expectCovering,
  expectCoveringFillsWindow,
  resizeUntilArranged,
} from "./sidePanelFrame.ts";

// The page column and the panel, side by side, as shown.
export async function split(page: Page, panel: Locator) {
  const [pageColumn, shown] = await Promise.all([
    box(page.locator(".page-column")),
    box(panel),
  ]);
  return { pageColumn: pageColumn.width, sidePanel: shown.width };
}

// Drags the divider sideways by `by` px with the mouse and releases it there,
// off the divider.
export async function dragDivider(page: Page, by: number) {
  const { x, y, width, height } = await box(panelDivider(page));
  const from = { x: x + width / 2, y: y + height / 2 };
  await page.mouse.move(from.x, from.y);
  expect(
    await panelDivider(page).evaluate((element) => {
      const at = element.getBoundingClientRect();
      const target = document.elementFromPoint(
        at.x + at.width / 2,
        at.y + at.height / 2,
      );
      return { reached: target === element, target: target?.className };
    }),
    "the pointer reaches the Panel divider",
  ).toEqual({ reached: true, target: "resize-divider panel-divider" });
  await page.mouse.down();
  await page.mouse.move(from.x + by, from.y, { steps: 8 });
  await page.mouse.up();
  return { x: from.x + by, y: from.y };
}

// Cancels a held mouse drag, then moves by the caller's distance. The caller
// observes the cancelled width before releasing the mouse button.
export async function cancelDividerDrag(
  page: Page,
  { pointerId, by, steps }: { pointerId: number; by: number; steps: number },
) {
  const divider = panelDivider(page);
  const { x, y, width, height } = await box(divider);
  await page.mouse.move(x + width / 2, y + height / 2);
  await page.mouse.down();
  await divider.dispatchEvent("pointercancel", { pointerId });
  await page.mouse.move(x + by, y + height / 2, { steps });
}

export async function focusDivider(
  within: Page | Locator,
  options: { exact?: boolean } = {},
) {
  await panelDivider(within, options).focus();
}

// Uses the keyboard where the scenario left it. No implicit focus transfer:
// the caller can prove Tab reached the divider before resizing it.
export async function pressDividerKey(page: Page, key: string, count = 1) {
  for (let press = 0; press < count; press += 1) await page.keyboard.press(key);
}

// Whether a caller-chosen fraction of the divider's width is reachable.
export function dividerHitTarget(divider: Locator, fraction: number) {
  return divider.evaluate((element, fraction) => {
    const rect = element.getBoundingClientRect();
    return element.contains(
      document.elementFromPoint(
        rect.x + rect.width * fraction,
        rect.y + rect.height / 2,
      ),
    );
  }, fraction);
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
  const { rows, screen } = terminalScreenParts(terminal);
  await screen.hover();
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

export async function expectDividerSays(page: Page, width: number) {
  const divider = panelDivider(page);
  await expect(divider).toHaveAttribute("aria-valuenow", String(width));
  await expect(divider).toHaveAttribute(
    "aria-valuetext",
    `${width} pixels wide`,
  );
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
  keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspace, listed(session)),
  ]);
  await page.setViewportSize(wideWindow);
  const card = await openBacklog(page, origin);
  return {
    card,
    session,
    terminal: terminalPanel(page),
    review: reviewRegion(page),
    divider: panelDivider(page),
    // The session's attachments so far.
    attaches: () => {
      const all = dashboard.claudeAttaches();
      expect(all.length).toBeGreaterThan(0);
      return all.filter((attached) => attached.id === session.slice(0, 8));
    },
  };
}

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
