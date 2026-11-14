// Stopping one of several held Cursor sessions leaves the others
// running under Running Cursor sessions. Single-session stop and
// unconfirmed-stop journeys live in ./agent-session-cursor-stop.spec.ts.
import { sessionAction } from "../../dashboard/tests/support/sessionEntryDisclosure.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/tests/dashboardPage.ts";
import { openRunningList } from "../../dashboard/tests/runningCursorList.ts";
import {
  closeTerminal,
  terminalPanel,
} from "../../dashboard/tests/terminalScreenPage.ts";
import {
  launchSecondHeldSession,
  startScopedCursorExecution,
} from "../../dashboard/tests/support/cursorSessionRecovery.ts";
import {
  expect,
  workingCursorTest,
} from "../../dashboard/tests/support/cursorStart.ts";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";

const stopOneSecondId = "f6a7b8c9-d0e1-4cdf-b012-3456789abcde";

workingCursorTest(
  "Stop on one of several held Cursor sessions ends only that client and leaves the others running under Running Cursor sessions",
  async ({ page, dashboard, origin, cursor }) => {
    await startScopedCursorExecution(page, origin, cursor, dashboard.home);
    await launchSecondHeldSession(
      page,
      origin,
      cursor,
      dashboard.home,
      stopOneSecondId,
    );
    const panel = terminalPanel(page);
    if ((await panel.count()) > 0) await closeTerminal(panel);

    const entries = sessionEntriesIn(parts(page).taken);
    await expect(entries).toHaveCount(2);
    const scopedEntry = entries.filter({ hasText: cursor.sessionId });
    const otherEntry = entries.filter({ hasText: stopOneSecondId });
    const scopedAttach = cursor
      .attaches()
      .find((each) => each.sessionId === cursor.sessionId);
    const otherAttach = cursor
      .attaches()
      .find((each) => each.sessionId === stopOneSecondId);
    expect(scopedAttach).toBeDefined();
    expect(otherAttach).toBeDefined();
    const otherPid = otherAttach?.pid ?? 0;
    expect(processRunning(otherPid)).toBe(true);

    const heldRows = (await openRunningList(page)).heldRows(/Open Dough/);
    await expect(heldRows).toHaveCount(2);

    await (await sessionAction(scopedEntry, "Stop")).click();
    await expect(scopedEntry).toContainText("Session stopped.");
    await expect
      .poll(() => cursor.signals(scopedAttach?.pid ?? 0))
      .toContain("SIGHUP");
    expect(processRunning(otherPid)).toBe(true);
    expect(cursor.signals(otherPid)).not.toContain("SIGHUP");

    await expect(heldRows).toHaveCount(1);
    await expect(otherEntry).toContainText("Working");
    expect(processRunning(otherPid)).toBe(true);
  },
);
