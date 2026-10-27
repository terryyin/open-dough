// Sessions a replaced runner held: observation of a stale-proof runner
// starts or replaces nothing, a third launch replaces it, and its held
// sessions then stand as resumable launch records — Recover on the scoped
// one resumes the same chat under its recorded scope on the replacement.
import type { Page } from "@playwright/test";
import { readCursorRunnerAddress } from "../server/hosts/cursor/runnerPaths.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchStoryCardPage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import {
  holdSession,
  openRunningList,
  showPage,
} from "./runningCursorSessionsPage.ts";
import {
  expectContinuationThroughScope,
  recordedScope,
} from "./support/cursorScopeAssertions.ts";
import { makeRecordedRunnerProofStale } from "./support/cursorRunnerRecordedAddress.ts";
import {
  agentCalls,
  cursorRecord,
  expectNormalizedReading,
  expectReadingWithoutScreenLabel,
  projectedSessions,
} from "./support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  keptRecords,
  launchSecondHeldSession,
  startScopedCursorExecution,
} from "./support/cursorSessionRecovery.ts";
import { expect, test, workingCursorTest } from "./support/cursorStart.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

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
    workingCursorTest.setTimeout(120_000);
    const pid = await holdSession(dashboard, cursor);
    await showHeldSessionPage(page, origin);
    const runnerPid = readCursorRunnerAddress(dashboard.home)?.pid;
    expect(runnerPid).toBeGreaterThan(0);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    makeRecordedRunnerProofStale(dashboard.home);
    const terminalPanel = page.getByRole("region", { name: "Terminal" });
    const { region } = await openRunningList(page);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("working");
    await expect(terminalPanel).toHaveCount(0);
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(runnerPid);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(attaches);

    await row.click();
    await expect(terminalPanel.locator(".xterm-rows")).toContainText(
      "ctrl+c to stop",
    );
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(runnerPid);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(attaches);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  },
);

const secondSessionId = "b2c3d4e5-f6a7-489a-bcde-f0123456789a";
const thirdSessionId = "c3d4e5f6-a7b8-49ab-8def-0123456789ab";

const replacementTest = test.extend({ cursorSubmitPaintMs: 300 });
replacementTest(
  "sessions a replaced runner held remain resumable records, and Recover on the scoped one resumes it on the replacement runner",
  async ({ page, dashboard, origin, cursor }) => {
    replacementTest.setTimeout(180_000);
    await startScopedCursorExecution(page, origin, cursor);
    await launchSecondHeldSession(
      page,
      origin,
      cursor,
      dashboard.home,
      secondSessionId,
    );
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

    // Observation on the stale-proof runner: listing in Running Cursor
    // sessions and opening either held session joins its client and
    // starts or replaces nothing.
    makeRecordedRunnerProofStale(dashboard.home);
    const running = await openRunningList(page);
    await expect(running.region).toContainText("The Cursor runner is running.");
    await expect(
      running.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(2);
    await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(0);
    await running.button.click();
    await expect(running.sidebar).toBeHidden();
    const entries = parts(page).taken.locator(".session-entry");
    await expect(entries).toHaveCount(2);
    const scopedEntry = entries.filter({ hasText: cursor.sessionId });
    const otherEntry = entries.filter({ hasText: secondSessionId });
    const panel = page.getByRole("region", { name: "Terminal" });
    for (const entry of [scopedEntry, otherEntry]) {
      await entry.getByRole("button", { name: "Open terminal" }).click();
      await expect(panel.locator(".xterm-rows")).toContainText(
        "Add a follow-up",
      );
      await panel.getByRole("button", { name: "Close", exact: true }).click();
      await expect(panel).toHaveCount(0);
    }
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(stalePid);
    expect(agentCalls(cursor)).toEqual(callsBefore);
    expect(cursor.attaches()).toHaveLength(attachesBefore);

    // A third launch is new work: it replaces the stale runner first.
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
    // The serving dashboard's own build proof: present and no longer the
    // stale value written above (its digest is of the code that server
    // would start, which this test process does not resolve the same way).
    expect(replacement?.buildId).toBeTruthy();
    expect(replacement?.buildId).not.toBe("stale-build");

    // Replacement itself mutated no record: both held sessions stand as
    // their launch records, neither done nor completed nor deleted.
    const recordsAfter = keptRecords(dashboard.home);
    expect(recordsAfter).toHaveLength(3);
    for (const before of recordsBefore) {
      const after = recordsAfter.find(
        (record) => record.session.sessionId === before.session.sessionId,
      );
      // The session (conversation, workspace, recorded scope) and launch
      // time are exactly as before; a record's own start settlement may
      // still have been landing when `before` was read, so it is not
      // compared here.
      expect(after?.session).toEqual(before.session);
      expect(after?.launchedAt).toBe(before.launchedAt);
      expect(after?.doneAt).toBeUndefined();
      expect(after?.completion).toBeUndefined();
    }

    await reloadUntilRead(page);
    // The two execution entries plus the third launch's own entry.
    await expect(entries).toHaveCount(3);
    for (const [entry, sessionId] of [
      [scopedEntry, cursor.sessionId],
      [otherEntry, secondSessionId],
    ] as const) {
      await expectReadingWithoutScreenLabel(entry, agentNotRunningLabel);
      await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(
        1,
      );
      const answer = await projectedSessions(page);
      expect(cursorRecord(answer, sessionId)?.sessionState).toEqual({
        kind: "unknown",
        label: agentNotRunningLabel,
      });
    }
    await expect(
      parts(page).recentlyDone.locator(".session-entry"),
    ).toHaveCount(0);

    // Recover on the scoped session resumes the same chat under its
    // recorded scope, on the replacement runner, which is reused.
    const attachesBeforeRecover = cursor.attaches().length;
    await scopedEntry.getByRole("button", { name: "Recover" }).click();
    await expectNormalizedReading(scopedEntry, "Ready for review", true);
    await expect
      .poll(() => cursor.attaches().length)
      .toBe(attachesBeforeRecover + 1);
    const resumed = cursor.attaches().at(-1);
    expect(resumed?.sessionId).toBe(cursor.sessionId);
    expectContinuationThroughScope(resumed, scope);
    expect(resumed?.args).toEqual([
      "--workspace",
      workspace,
      "--resume",
      cursor.sessionId,
    ]);
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(replacement?.pid);
    // The other replaced session still stands resumable, untouched.
    await expectReadingWithoutScreenLabel(otherEntry, agentNotRunningLabel);
    await expect(
      otherEntry.getByRole("button", { name: "Recover" }),
    ).toHaveCount(1);
  },
);
