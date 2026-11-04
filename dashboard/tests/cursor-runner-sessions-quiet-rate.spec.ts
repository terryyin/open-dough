// Quiet expanded Running Cursor sessions asks about once per second, shows a
// label or membership change within about one second, and ends that demand on
// collapse. Listing, unreachable, and feedback journeys stay in
// ./cursor-runner-sessions.spec.ts; bounded slow-answer demand stays in
// ./cursor-runner-sessions-demand.spec.ts.
import { hangupCursorClient } from "../server/hosts/cursor/runnerClient.ts";
import { askGapMs } from "../src/cursorRunnerSessions.ts";
import {
  holdSession,
  instruction,
  openRunningList,
  showPageWithTaken,
  withRunningCursor,
} from "./runningCursorSessionsPage.ts";
import { trackCursorSessionsDemand } from "./support/cursorSessionsDemand.ts";
import { holdRunnerSessionsReads } from "./support/cursorRunnerHeldReads.ts";
import { expect, keptRecord } from "./support/cursorStart.ts";

const quietWatchMs = 10_000;
// Ten-second proxy for about one ask per second (plan-acceptable for E1).
const quietAskFloor = 8;
const quietAskCeil = 12;
const changeWithinBoundMs = askGapMs + 500;

const quiet = withRunningCursor({ screen: "working", becomeReady: true });
quiet(
  "an expanded quiet section asks about once per second, shows a follow-up label within about one second, and collapse ends further asks",
  async ({ page, dashboard, origin, cursor }) => {
    quiet.setTimeout(120_000);
    const gate = await holdRunnerSessionsReads(dashboard.home);
    try {
      const pid = await holdSession(dashboard, cursor);
      await showPageWithTaken(page, origin);
      const demand = trackCursorSessionsDemand(page);
      const shownTerminal = page.getByRole("region", { name: "Terminal" });
      const { sidebar, region, header } = await openRunningList(page);
      const row = region.getByRole("button", { name: /Open Dough/ });
      await expect(region).toContainText("The Cursor runner is running.");
      await expect(row).toContainText("working");
      await expect.poll(() => demand.started()).toBeGreaterThanOrEqual(1);
      await expect.poll(() => gate.sessionsReads()).toBeGreaterThanOrEqual(1);

      const browserAtQuiet = demand.started();
      const runnerAtQuiet = gate.sessionsReads();
      await page.waitForTimeout(quietWatchMs);
      const browserAsks = demand.started() - browserAtQuiet;
      const runnerReads = gate.sessionsReads() - runnerAtQuiet;
      expect(browserAsks).toBeGreaterThanOrEqual(quietAskFloor);
      expect(browserAsks).toBeLessThanOrEqual(quietAskCeil);
      expect(runnerReads).toBeGreaterThanOrEqual(quietAskFloor);
      expect(runnerReads).toBeLessThanOrEqual(quietAskCeil);

      cursor.showReady();
      await expect(row).toContainText("at the follow-up prompt", {
        timeout: changeWithinBoundMs,
      });
      await expect(shownTerminal).toHaveCount(0);

      await header.click();
      await expect(region.locator(".running-cursor-body")).toHaveCount(0);
      const afterCollapse = demand.started();
      await page.waitForTimeout(askGapMs * 3);
      expect(demand.started()).toBe(afterCollapse);

      await expect(
        sidebar.getByRole("button", { name: instruction, exact: true }),
      ).toBeVisible();
      expect(cursor.attaches()).toHaveLength(1);
      expect(cursor.attaches()[0]?.pid).toBe(pid);
    } finally {
      await gate.close();
    }
  },
);

const membership = withRunningCursor({ screen: "working" });
membership(
  "a held session leaving drops its row in the expanded section within about one second",
  async ({ page, dashboard, origin, cursor }) => {
    membership.setTimeout(120_000);
    await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const { region } = await openRunningList(page);
    const rows = region.getByRole("button", { name: /Open Dough/ });
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("working");

    const record = keptRecord(dashboard.home);
    if (record.session.host !== "cursor") {
      throw new Error("Expected a Cursor session.");
    }
    await hangupCursorClient(record.session, dashboard.home);
    await expect(rows).toHaveCount(0, { timeout: changeWithinBoundMs });
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(region.getByRole("listitem")).toHaveCount(0);
  },
);
