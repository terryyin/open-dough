// Quiet expanded Running Cursor sessions asks about once per second, shows a
// label or membership change within about one second, and ends that demand on
// collapse. Listing, unreachable, and feedback journeys stay in
// ./cursor-runner-sessions.spec.ts; bounded slow-answer demand stays in
// ./cursor-runner-sessions-demand.spec.ts.
import { hangupCursorClient } from "../../dashboard/server/hosts/cursor/runnerClient.ts";
import { cursorHeldLabel } from "../../dashboard/src/cursorHeldLabel.ts";
import { askGapMs } from "../../dashboard/src/cursorRunnerSessions.ts";
import {
  passPageMsAnswered,
  pausePageClock,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  collapseRunningList,
  openRunningList,
} from "../../dashboard/tests/runningCursorList.ts";
import { terminalPanel } from "../../dashboard/tests/terminalScreenPage.ts";
import {
  heldSessionsAnswer,
  holdSession,
  instruction,
  showPageWithTaken,
  withRunningCursor,
} from "../../dashboard/tests/runningCursorSessionsPage.ts";
import { trackCursorSessionsDemand } from "../../dashboard/tests/support/cursorSessionsDemand.ts";
import { holdRunnerSessionsReads } from "../../dashboard/tests/support/cursorRunnerHeldReads.ts";
import {
  expect,
  keptRecord,
} from "../../dashboard/tests/support/cursorStart.ts";

const quietWatchMs = 10_000;
// Ten seconds of page time as a proxy for about one ask per second.
const quietAskFloor = 8;
const quietAskCeil = 12;
const changeWithinBoundMs = askGapMs + 500;

const quiet = withRunningCursor({ screen: "working", becomeReady: true });
quiet(
  "an expanded quiet section asks about once per second, shows a follow-up label within about one second, and collapse ends further asks",
  async ({ page, dashboard, origin, cursor }) => {
    const gate = await holdRunnerSessionsReads(dashboard);
    try {
      const pid = await holdSession(dashboard, cursor);
      await pausePageClock(page);
      await showPageWithTaken(page, origin);
      const demand = trackCursorSessionsDemand(page);
      const shownTerminal = terminalPanel(page);
      const running = await openRunningList(page);
      const { sidebar, region } = running;
      const row = running.heldRows(/Open Dough/);
      await expect(region).toContainText("The Cursor runner is running.");
      await expect(row).toContainText("working");
      await expect.poll(() => demand.started()).toBeGreaterThanOrEqual(1);
      await expect.poll(() => gate.sessionsReads()).toBeGreaterThanOrEqual(1);

      await untilPageRequestsAnswered(page);
      const browserAtQuiet = demand.started();
      const runnerAtQuiet = gate.sessionsReads();
      await passPageMsAnswered(page, quietWatchMs);
      const browserAsks = demand.started() - browserAtQuiet;
      const runnerReads = gate.sessionsReads() - runnerAtQuiet;
      expect(browserAsks).toBeGreaterThanOrEqual(quietAskFloor);
      expect(browserAsks).toBeLessThanOrEqual(quietAskCeil);
      expect(runnerReads).toBeGreaterThanOrEqual(quietAskFloor);
      expect(runnerReads).toBeLessThanOrEqual(quietAskCeil);

      // The runner answers the new label within the change bound of real
      // time; the page then shows it after one ask gap of page time.
      cursor.showReady();
      await expect
        .poll(
          async () => JSON.stringify(await heldSessionsAnswer(page, dashboard)),
          { timeout: changeWithinBoundMs },
        )
        .toContain(cursorHeldLabel.followUp);
      await passPageMsAnswered(page, askGapMs);
      await expect(row).toContainText(cursorHeldLabel.followUp);
      await expect(shownTerminal).toHaveCount(0);

      await collapseRunningList(running);
      await untilPageRequestsAnswered(page);
      const afterCollapse = demand.started();
      await passPageMsAnswered(page, askGapMs * 3);
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
    await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const { region, listed, heldRows } = await openRunningList(page);
    const rows = heldRows(/Open Dough/);
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("working");

    const record = keptRecord(dashboard.home);
    if (record.session.host !== "cursor") {
      throw new Error("Expected a Cursor session.");
    }
    await hangupCursorClient(record.session, dashboard.home);
    await expect(rows).toHaveCount(0, { timeout: changeWithinBoundMs });
    await expect(region).toContainText("The Cursor runner is running.");
    await expect(listed).toHaveCount(0);
  },
);
