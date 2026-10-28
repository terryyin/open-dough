// Running Cursor sessions demand stays sequential: slow answers still publish
// under at most one owned read; collapse and a hidden page end or pause that
// demand. Listing and follow journeys stay in ./cursor-runner-sessions.spec.ts.
import type { Page, Request } from "@playwright/test";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import {
  heldSessionsAnswer,
  holdSession,
  instruction,
  openRunningList,
  showPageWithTaken,
  withRunningCursor,
} from "./runningCursorSessionsPage.ts";
import { expect } from "./support/cursorStart.ts";

// Longer than the section's minimum ask gap so a success that used to lose
// the overlapping-poll race still has to publish under bounded demand.
const slowerThanAskGapMs = 80;

function isCursorSessionsRead(request: Request): boolean {
  return (
    request.method() === "GET" &&
    new URL(request.url()).pathname === cursorRunnerSessionsEndpoint
  );
}

function trackCursorSessionsDemand(page: Page) {
  let outstanding = 0;
  let peak = 0;
  let started = 0;
  const noteStart = (request: Request) => {
    if (!isCursorSessionsRead(request)) return;
    started += 1;
    outstanding += 1;
    if (outstanding > peak) peak = outstanding;
  };
  const noteEnd = (request: Request) => {
    if (!isCursorSessionsRead(request)) return;
    outstanding = Math.max(0, outstanding - 1);
  };
  page.on("request", noteStart);
  page.on("requestfinished", noteEnd);
  page.on("requestfailed", noteEnd);
  return {
    peak: () => peak,
    started: () => started,
    outstanding: () => outstanding,
  };
}

const bounded = withRunningCursor({ screen: "working" });
bounded(
  "slow Cursor sessions answers still publish under at most one owned read, and collapse or a hidden page ends or pauses that demand",
  async ({ page, dashboard, origin, cursor }) => {
    bounded.setTimeout(120_000);
    const pid = await holdSession(dashboard, cursor);
    const held = await heldSessionsAnswer(page, dashboard);
    await showPageWithTaken(page, origin);
    const demand = trackCursorSessionsDemand(page);
    await page.route(
      (url) => url.pathname === cursorRunnerSessionsEndpoint,
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, slowerThanAskGapMs));
        await route.fulfill({ json: held });
      },
    );
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    const { sidebar, region, header } = await openRunningList(page);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("working");
    expect(demand.peak()).toBe(1);
    expect(demand.started()).toBeGreaterThanOrEqual(1);

    const afterPublish = demand.started();
    await expect.poll(() => demand.started()).toBeGreaterThan(afterPublish);
    expect(demand.peak()).toBe(1);

    await setPageVisibility(page, "hidden");
    const whileHidden = demand.started();
    await page.waitForTimeout(slowerThanAskGapMs * 3);
    expect(demand.started()).toBe(whileHidden);
    await setPageVisibility(page, "visible");
    await expect.poll(() => demand.started()).toBeGreaterThan(whileHidden);
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(row).toContainText("working");
    expect(demand.peak()).toBe(1);

    await header.click();
    await expect(region.locator(".running-cursor-body")).toHaveCount(0);
    await expect.poll(() => demand.outstanding()).toBe(0);
    const afterCollapse = demand.started();
    await page.waitForTimeout(slowerThanAskGapMs * 3);
    expect(demand.started()).toBe(afterCollapse);

    await expect(shownTerminal).toHaveCount(0);
    await expect(
      sidebar.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  },
);
