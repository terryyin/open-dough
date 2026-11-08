// Replacement revive controls: finished and never-held last-held keys are
// not started; one failing revive leaves Recover on that entry while
// siblings resume. Companion to ./cursor-runner-replacement.spec.ts.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { hangupCursorClient } from "../../server/hosts/cursor/runnerClient.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { parts } from "../dashboardPage.ts";
import { startSessionField } from "../launchStoryCardPage.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import { makeRecordedRunnerProofStale } from "../support/cursorRunnerRecordedAddress.ts";
import {
  doneSessionId,
  expectNotAgentNotRunning,
  failSessionId,
  secondSessionId,
  thirdSessionId,
  writeKeptRecords,
  writeLastHeld,
} from "../support/cursorRunnerReplacement.ts";
import { expectReadingWithoutScreenLabel } from "../support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  keptRecords,
  launchSecondHeldSession,
  startScopedCursorExecution,
} from "../support/cursorSessionRecovery.ts";
import { expect, test } from "../support/cursorStart.ts";
import { launchWaitMs } from "../support/launchWait.ts";

const replacementTest = test.extend({ cursorSubmitPaintMs: 300 });
replacementTest(
  "done, never-held, and one failing revive leave Recover only where revival failed",
  async ({ page, dashboard, origin, cursor }) => {
    await startScopedCursorExecution(page, origin, cursor, dashboard.home);
    await launchSecondHeldSession(
      page,
      origin,
      cursor,
      dashboard.home,
      secondSessionId,
    );
    const records = keptRecords(dashboard.home);
    const scoped = records.find(
      (record) => record.session.sessionId === cursor.sessionId,
    );
    const other = records.find(
      (record) => record.session.sessionId === secondSessionId,
    );
    if (scoped?.session.host !== "cursor" || other?.session.host !== "cursor") {
      throw new Error("Missing a held Cursor session.");
    }

    // Hangup removes this unfinished session from last-held. Its record
    // stays kept and replacement must leave it stopped.
    await hangupCursorClient(other.session, dashboard.home);

    // A finished session in a workspace that still exists, and an
    // unfinished one whose saved workspace is gone.
    const doneRecord = makeMe.aLaunchRecord
      .adHoc({ instruction: "Finish the report.", title: "Finished session" })
      .inCursorSession({
        sessionId: doneSessionId,
        continuation: { workspace: other.session.continuation.workspace },
      })
      .launchedAt(new Date(Date.now() - 120_000).toISOString())
      .markedDoneAt(new Date(Date.now() - 60_000).toISOString())
      .please();
    const missingWorkspace = path.join(
      dashboard.home,
      "missing-revive-workspace",
      failSessionId,
    );
    const failRecord = makeMe.aLaunchRecord
      .adHoc({ instruction: "Keep going.", title: "Failing revival" })
      .inCursorSession({
        sessionId: failSessionId,
        continuation: { workspace: missingWorkspace },
      })
      .launchedAt(new Date(Date.now() - 90_000).toISOString())
      .please();
    writeKeptRecords(dashboard.home, [scoped, other, doneRecord, failRecord]);
    // last-held names the still-revivable scoped session, a finished one,
    // and a failing workspace — not the hung-up never-held session.
    writeLastHeld(dashboard.home, [
      `cursor:${cursor.sessionId}`,
      `cursor:${doneSessionId}`,
      `cursor:${failSessionId}`,
    ]);

    const scopedAttachesBeforeReplace = cursor
      .attaches()
      .filter((each) => each.sessionId === cursor.sessionId).length;
    const neverHeldAttachesBeforeReplace = cursor
      .attaches()
      .filter((each) => each.sessionId === secondSessionId).length;

    const stalePid = readCursorRunnerAddress(dashboard.home)?.pid;
    expect(stalePid).toBeGreaterThan(0);
    makeRecordedRunnerProofStale(dashboard.home);
    cursor.queueCreateChatId(thirdSessionId);
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
    await startSessionField(dialog).fill(
      "replace after done and fail controls",
    );
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(
        () =>
          cursor.attaches().filter((each) => each.sessionId === thirdSessionId)
            .length,
        { timeout: launchWaitMs },
      )
      .toBe(1);

    const replacement = readCursorRunnerAddress(dashboard.home);
    expect(replacement?.pid).toBeGreaterThan(0);
    expect(replacement?.pid).not.toBe(stalePid);
    await expect
      .poll(
        () =>
          cursor
            .attaches()
            .filter((each) => each.sessionId === cursor.sessionId).length,
        { timeout: launchWaitMs },
      )
      .toBe(scopedAttachesBeforeReplace + 1);

    await reloadUntilRead(page);
    const entries = parts(page).taken.locator(".session-entry");
    const revived = entries.filter({ hasText: cursor.sessionId });
    const neverHeld = entries.filter({ hasText: secondSessionId });
    const failed = entries.filter({ hasText: failSessionId });
    await expect(revived.getByRole("button", { name: "Recover" })).toHaveCount(
      0,
    );
    await expectNotAgentNotRunning(revived);
    await expectReadingWithoutScreenLabel(neverHeld, agentNotRunningLabel);
    await expect(
      neverHeld.getByRole("button", { name: "Recover" }),
    ).toHaveCount(1);
    await expectReadingWithoutScreenLabel(failed, agentNotRunningLabel);
    await expect(failed.getByRole("button", { name: "Recover" })).toHaveCount(
      1,
    );
    await expect(
      parts(page).recentlyDone.locator(".session-entry").filter({
        hasText: doneSessionId,
      }),
    ).toHaveCount(1);
    expect(
      cursor.attaches().some((each) => each.sessionId === failSessionId),
    ).toBe(false);
    expect(
      cursor.attaches().some((each) => each.sessionId === doneSessionId),
    ).toBe(false);
    // Never-held: no additional attach beyond the original before hangup.
    expect(
      cursor.attaches().filter((each) => each.sessionId === secondSessionId),
    ).toHaveLength(neverHeldAttachesBeforeReplace);
  },
);
