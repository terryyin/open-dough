// Stopping one of several held Cursor sessions leaves the others
// running under Running Cursor sessions. Single-session stop and
// unconfirmed-stop journeys live in ./agent-session-cursor-stop.spec.ts.
import { sessionAction } from "./support/sessionEntryDisclosure.ts";
import type { Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { openRunningList } from "./runningCursorSessionsPage.ts";
import {
  launchSecondHeldSession,
  startScopedCursorExecution,
} from "./support/cursorSessionRecovery.ts";
import { expect, workingCursorTest } from "./support/cursorStart.ts";
import { processRunning } from "./support/processGroup.ts";

async function closeTerminal(page: Page): Promise<void> {
  const panel = page.getByRole("region", { name: "Terminal" });
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
}

const stopOneSecondId = "f6a7b8c9-d0e1-4cdf-b012-3456789abcde";

workingCursorTest(
  "Stop on one of several held Cursor sessions ends only that client and leaves the others running under Running Cursor sessions",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(180_000);
    await startScopedCursorExecution(page, origin, cursor);
    await launchSecondHeldSession(
      page,
      origin,
      cursor,
      dashboard.home,
      stopOneSecondId,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    if ((await panel.count()) > 0) await closeTerminal(page);

    const entries = parts(page).taken.locator(".session-entry");
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

    const runningBefore = await openRunningList(page);
    await expect(
      runningBefore.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(2);

    await (await sessionAction(scopedEntry, "Stop")).click();
    await expect(scopedEntry).toContainText("Session stopped.");
    await expect
      .poll(() => cursor.signals(scopedAttach?.pid ?? 0))
      .toContain("SIGHUP");
    expect(processRunning(otherPid)).toBe(true);
    expect(cursor.signals(otherPid)).not.toContain("SIGHUP");

    await expect(
      runningBefore.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(1);
    await expect(otherEntry).toContainText("Working");
    expect(processRunning(otherPid)).toBe(true);
  },
);
