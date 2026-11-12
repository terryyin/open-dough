// Sessions a replaced runner held: observation of a stale-proof runner
// starts or replaces nothing, a third launch replaces it when recorded
// build proof differs, and unfinished sessions that runner last held are
// resumed onto the replacement through Recover's keep path without a
// Recover click. Same-build helper-proof survival lives in
// ./cursor-runner-helper-survival.spec.ts. Done / never-held / fail
// controls live in ./cursor-runner-replacement-controls.spec.ts.
import type { Page } from "@playwright/test";
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { parts } from "../dashboardPage.ts";
import { startSessionField } from "../launchStoryCardPage.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import { terminalPanel, terminalScreenParts } from "../terminalScreenPage.ts";
import {
  holdSession,
  openRunningList,
  showPage,
} from "../runningCursorSessionsPage.ts";
import {
  expectContinuationThroughScope,
  recordedScope,
} from "../support/cursorScopeAssertions.ts";
import { makeRecordedRunnerProofStale } from "../support/cursorRunnerRecordedAddress.ts";
import {
  expectNotAgentNotRunning,
  secondSessionId,
  thirdSessionId,
} from "../support/cursorRunnerReplacement.ts";
import {
  agentCalls,
  cursorRecord,
  projectedSessions,
} from "../support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  keptRecords,
} from "../support/cursorSessionRecovery.ts";
import { expect, test, workingCursorTest } from "../support/cursorStart.ts";
import { launchWaitMs } from "../support/launchWait.ts";
import { openHeldCursorExecutions } from "../support/heldCursorExecutions.ts";
import type { StartOrigin } from "../support/startOrigin.ts";

// The page also lists the held session as the project's local Taken entry.
async function showHeldSessionPage(
  page: Page,
  origin: StartOrigin,
): Promise<void> {
  await showPage(page, origin);
  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
}

workingCursorTest(
  "a stale-proof runner is read and joined for its held session, and observation starts or replaces nothing",
  async ({ page, dashboard, origin, cursor }) => {
    const pid = await holdSession(dashboard, cursor);
    await showHeldSessionPage(page, origin);
    const runnerPid = readCursorRunnerAddress(dashboard.home)?.pid;
    expect(runnerPid).toBeGreaterThan(0);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    makeRecordedRunnerProofStale(dashboard.home);
    const shownTerminal = terminalPanel(page);
    const { region } = await openRunningList(page);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("working");
    await expect(shownTerminal).toHaveCount(0);
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(runnerPid);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(attaches);

    await row.click();
    await expect(terminalScreenParts(shownTerminal).rows).toContainText(
      "ctrl+c to stop",
    );
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(runnerPid);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(attaches);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  },
);

const replacementTest = test.extend({ cursorSubmitPaintMs: 300 });
replacementTest(
  "sessions a replaced runner last held are revived without Recover; the third launch stays running",
  async ({ page, dashboard, origin, cursor }) => {
    await openHeldCursorExecutions(page, dashboard, origin, cursor, [
      { story: storyA, sessionId: cursor.sessionId, model: "gpt-5.2" },
      { story: storyB, sessionId: secondSessionId },
    ]);
    const recordsBefore = keptRecords(dashboard.home);
    expect(recordsBefore).toHaveLength(2);
    const scoped = recordsBefore.find(
      (record) => record.session.sessionId === cursor.sessionId,
    );
    const other = recordsBefore.find(
      (record) => record.session.sessionId === secondSessionId,
    );
    if (scoped === undefined || other === undefined) {
      throw new Error("Missing a held Cursor session.");
    }
    const scope = recordedScope(scoped);
    const workspace =
      scoped.session.host === "cursor"
        ? scoped.session.continuation.workspace
        : "";
    const stalePid = readCursorRunnerAddress(dashboard.home)?.pid;
    expect(stalePid).toBeGreaterThan(0);
    const callsBefore = agentCalls(cursor);
    const attachesBefore = cursor.attaches().length;
    expect(attachesBefore).toBe(2);

    // Observation on the stale-proof runner: listing both held sessions
    // and joining one client starts or replaces nothing. A second Taken
    // Open terminal is incidental; call/attach counts already cover spawn.
    makeRecordedRunnerProofStale(dashboard.home);
    const running = await openRunningList(page);
    await expect(running.region).toContainText("The Cursor runner is running.");
    await expect(
      running.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(2);
    await expect(terminalPanel(page)).toHaveCount(0);
    await running.button.click();
    await expect(running.sidebar).toBeHidden();
    const entries = parts(page).taken.locator(".session-entry");
    await expect(entries).toHaveCount(2);
    const scopedEntry = entries.filter({ hasText: cursor.sessionId });
    const otherEntry = entries.filter({ hasText: secondSessionId });
    await scopedEntry.getByRole("button", { name: "Session details" }).click();
    await expect(scopedEntry.getByText("First input accepted")).toBeVisible();
    await scopedEntry.getByRole("button", { name: "Session details" }).click();
    const panel = terminalPanel(page);
    await scopedEntry.getByRole("button", { name: "Open terminal" }).click();
    await expect(terminalScreenParts(panel).rows).toContainText(
      "Add a follow-up",
    );
    await panel.getByRole("button", { name: "Close", exact: true }).click();
    await expect(panel).toHaveCount(0);
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(stalePid);
    expect(agentCalls(cursor)).toEqual(callsBefore);
    expect(cursor.attaches()).toHaveLength(attachesBefore);

    // A third launch is new work: it replaces the stale runner first, then
    // unfinished last-held sessions resume onto the replacement without
    // Recover (fake-Cursor uses two unfinished for the five-session journey).
    cursor.queueCreateChatId(thirdSessionId);
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
    await startSessionField(dialog).fill(
      "trigger replacement of the stale runner",
    );
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(() => keptRecords(dashboard.home).length, {
        timeout: launchWaitMs,
      })
      .toBe(3);
    await expect
      .poll(
        () =>
          cursor.attaches().filter((each) => each.sessionId === thirdSessionId)
            .length,
        { timeout: launchWaitMs },
      )
      .toBe(1);
    if ((await panel.count()) > 0) {
      await panel.getByRole("button", { name: "Close", exact: true }).click();
      await expect(panel).toHaveCount(0);
    }
    const replacement = readCursorRunnerAddress(dashboard.home);
    expect(replacement?.pid).not.toBe(stalePid);
    expect(replacement?.buildId).toBeTruthy();
    expect(replacement?.buildId).not.toBe("stale-build");

    const recordsAfter = keptRecords(dashboard.home);
    expect(recordsAfter).toHaveLength(3);
    for (const before of recordsBefore) {
      const after = recordsAfter.find(
        (record) => record.session.sessionId === before.session.sessionId,
      );
      expect(after?.session).toEqual(before.session);
      expect(after?.launchedAt).toBe(before.launchedAt);
      expect(after?.doneAt).toBeUndefined();
      expect(after?.completion).toBeUndefined();
    }

    await expect
      .poll(
        () =>
          cursor
            .attaches()
            .filter(
              (each) =>
                each.sessionId === cursor.sessionId ||
                each.sessionId === secondSessionId,
            ).length,
        { timeout: launchWaitMs },
      )
      .toBe(attachesBefore + 2);

    await reloadUntilRead(page);
    await expect(entries).toHaveCount(3);
    for (const [entry, sessionId] of [
      [scopedEntry, cursor.sessionId],
      [otherEntry, secondSessionId],
    ] as const) {
      await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(
        0,
      );
      await expectNotAgentNotRunning(entry);
      const answer = await projectedSessions(page);
      expect(cursorRecord(answer, sessionId)?.sessionState.label).not.toBe(
        agentNotRunningLabel,
      );
    }
    const thirdEntry = entries.filter({ hasText: thirdSessionId });
    await expect(
      thirdEntry.getByRole("button", { name: "Recover" }),
    ).toHaveCount(0);

    const revived = cursor
      .attaches()
      .filter((each) => each.sessionId === cursor.sessionId)
      .at(-1);
    expect(revived?.sessionId).toBe(cursor.sessionId);
    expectContinuationThroughScope(revived, scope);
    expect(revived?.args).toEqual([
      "--workspace",
      workspace,
      "--resume",
      cursor.sessionId,
    ]);

    const runningAgain = await openRunningList(page);
    await expect(runningAgain.region).toContainText(
      "The Cursor runner is running.",
    );
    await expect(
      runningAgain.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(3);
  },
);
