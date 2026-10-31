// The side panel's resize divider and widths as shown, for Story A's real
// worktree (./support/storyReviewWorktree.ts) and its session, listed by the
// synthetic `claude` (./fixtures/fake-claude), which prints its terminal size
// whenever that changes.

import type { Locator, Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../src/storyReviewContract.ts";
import { box } from "./pageLayout.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { listed } from "./support/sidePanelContents.ts";
import { storyWorktree } from "./support/storyReviewWorktree.ts";
import {
  keepLaunchRecords,
  storyALaunchRecord,
} from "./support/storyLaunchRecord.ts";

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

export const panelDivider = (within: Page | Locator) =>
  within.getByRole("separator", { name: "Panel divider", exact: true });

// Resizes the window and waits for the page to arrange the panel for it:
// covering the page column in a window up to 800px wide (side-panel.css),
// beside the page with its resize divider otherwise. The page arranges on the
// frame after the resize, so a measurement taken, or a finger placed, before
// that frame would take the previous arrangement's places in the new window.
export async function resizeUntilArranged(
  panel: Locator,
  view: { readonly width: number; readonly height: number },
) {
  await panel.page().setViewportSize(view);
  const divider = panelDivider(panel);
  if (view.width > 800) await expect(divider).toBeVisible();
  else await expect(divider).toHaveCount(0);
}

// Whether the open panel covers the page column (no usable split).
export async function expectCovering(panel: Locator) {
  await expect
    .poll(() =>
      panel.evaluate(
        (element) =>
          element.parentElement?.classList.contains("page-covering") === true &&
          element.parentElement.classList.contains("page-maximized"),
      ),
    )
    .toBe(true);
  await expect(control(panel, "Maximize")).toHaveCount(0);
  await expect(control(panel, "Restore")).toHaveCount(0);
  await expect(panelDivider(panel)).toHaveCount(0);
}

// Narrow-window covering: the panel fills the viewport and hides banner/Board.
export async function expectCoveringFillsWindow(
  panel: Locator,
  pageParts: { readonly banner: Locator; readonly board: Locator },
) {
  await expectCovering(panel);
  const viewport = await panel.page().evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));
  const shown = await box(panel);
  expect(shown.width).toBeCloseTo(viewport.width, 0);
  expect(shown.height).toBeCloseTo(viewport.height, 0);
  await expect(pageParts.banner).toBeHidden();
  await expect(pageParts.board).toBeHidden();
}

// Tab and tap stay on the covering panel; the Board is not reachable behind it.
export async function expectBoardUnreachableBehindCovering(
  panel: Locator,
  board: Locator,
) {
  await control(panel, "Close").focus();
  await panel.page().keyboard.press("Tab");
  await expect(board).toBeHidden();
  expect(
    await panel.page().evaluate(() => {
      const active = document.activeElement;
      return active !== null && active.closest(".side-panel") !== null;
    }),
  ).toBe(true);
  expect(
    await panel.page().evaluate(() => {
      const target = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight * 0.75,
      );
      return target?.closest(".side-panel") !== null;
    }),
  ).toBe(true);
}

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
  await keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspace, listed(session)),
  ]);
  await page.setViewportSize(wideWindow);
  const card = await openBacklog(page, origin);
  return {
    card,
    session,
    terminal: page.getByRole("region", { name: "Terminal" }),
    review: page.getByRole("region", { name: "Story review" }),
    divider: panelDivider(page),
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
