import { sessionAction } from "../../dashboard/tests/support/sessionEntryDisclosure.ts";
// Recover for an unfinished Cursor session the runner does not hold: the
// not-held offer, resume through the runner, one continuation only on the
// idle composer with confirmed first input, and cases that type nothing or
// withhold Recover. Keep-wait expiry, cannot-load replacement, and
// sessions a replaced runner held live in sibling specs.
import { cursorRunnerSentence } from "../../dashboard/src/cursorRunnerSessions.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import { stopCursorRunner } from "../../dashboard/server/hosts/cursor/runnerClient.ts";
import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/tests/dashboardPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  agentCalls,
  expectNormalizedReading,
  expectReadingWithoutScreenLabel,
  openTakenCursorSession,
  projectedSessions,
  cursorRecord,
} from "../../dashboard/tests/support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  endHeldClient,
  keptRecords,
  openStoppedCursorEntry,
  startCursorExecution,
} from "../../dashboard/tests/support/cursorSessionRecovery.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";

// Cursor repaints a while after Enter on a paste chip, so a continuation's
// answer can read the submitted chip unless Recover waits for that repaint.
// A shorter delay reaches the first test's read only some of the time.
test.use({ cursorSubmitPaintMs: 300 });

test("an unfinished not-held Cursor session says the agent is not running, offers Recover, and starts no agent", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  const entry = await openStoppedCursorEntry(
    page,
    origin,
    cursor,
    dashboard.home,
  );
  await expect(entry).not.toHaveClass(/needs-attention/);
  await expect(await sessionAction(entry, "Delete record…")).toHaveCount(1);
  const answer = await projectedSessions(page);
  expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
    label: agentNotRunningLabel,
  });
});

test("Recover on the idle composer with confirmed first input resumes the same chat and sends one continuation", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await startCursorExecution(page, origin, cursor, dashboard.home);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record?.firstInput?.state).toBe("confirmed");
  expect(record?.start).toMatchObject({
    identity: queuedIdentity,
    branch: expect.any(String),
    workspace: expect.any(String),
  });
  const originalPrompt = "Implement the selected slice.";
  const before = cursor.attaches().length;
  await endHeldClient(page, cursor, dashboard.home);
  await reloadUntilRead(page);
  const stopped = sessionEntriesIn(parts(page).taken);
  await expectReadingWithoutScreenLabel(stopped, agentNotRunningLabel);
  await stopped.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(stopped, "Ready for review", true);
  await expect(stopped.getByRole("button", { name: "Recover" })).toHaveCount(0);
  await expect.poll(() => cursor.attaches().length).toBe(before + 1);
  const resumed = cursor.attaches().at(-1);
  expect(resumed?.sessionId).toBe(cursor.sessionId);
  const workspace =
    record?.session.host === "cursor"
      ? record.session.continuation.workspace
      : "";
  expect(resumed?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  const typed = cursor.input(resumed?.pid ?? 0).replace(/\r$/u, "");
  expect(typed).toContain("Continue the recorded Execution");
  expect(typed).toContain(`Identity: ${queuedIdentity}.`);
  expect(typed).toContain(`Branch: ${record?.start?.branch}.`);
  expect(typed).toContain(`Worktree: ${workspace}.`);
  expect(typed).toContain("without opening another assignment");
  expect(typed).toContain(record?.request.reporting?.command ?? "missing");
  expect(typed).not.toContain(originalPrompt);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
});

test("Recover on a working screen types nothing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  const entry = await openStoppedCursorEntry(
    page,
    origin,
    cursor,
    dashboard.home,
  );
  cursor.setAttachMode("working");
  const before = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Working", false);
  await expect.poll(() => cursor.attaches().length).toBe(before + 1);
  const resumed = cursor.attaches().at(-1);
  expect(cursor.input(resumed?.pid ?? 0)).toBe("");
});

test("Recover with unconfirmed first input types nothing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await openTakenCursorSession(page, origin);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  keepLaunchStore(dashboard, {
    "open-dough": [
      {
        ...record,
        firstInput: {
          state: "uncertain",
          instruction: "inspect this session",
          explanation: "not confirmed",
        },
      },
    ],
  });
  await endHeldClient(page, cursor, dashboard.home);
  await page.reload();
  const entry = sessionEntriesIn(parts(page).taken);
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Awaiting first instruction", false);
  const resumed = cursor.attaches().at(-1);
  expect(cursor.input(resumed?.pid ?? 0)).toBe("");
  await expect(entry).toContainText("First input acceptance uncertain");
});

test("done and completed sessions offer no Recover", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await openTakenCursorSession(page, origin);
  await endHeldClient(page, cursor, dashboard.home);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing record.");
  keepLaunchStore(dashboard, {
    "open-dough": [
      { ...record, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  await reloadUntilRead(page);
  let entry = sessionEntriesIn(parts(page).recentlyDone);
  await expect(entry).toHaveCount(1);
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(0);

  keepLaunchStore(dashboard, {
    "open-dough": [
      {
        ...record,
        completion: makeMe.aCompletionReport
          .withOutcome("completed")
          .saying("Finished with attention")
          .please(),
      },
    ],
  });
  await reloadUntilRead(page);
  entry = sessionEntriesIn(parts(page).taken);
  await expect(entry).toHaveCount(1);
  await expectReadingWithoutScreenLabel(
    entry,
    "Activity unknown: Cursor has no passive status for this session",
  );
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(0);
  await expect(entry).toContainText("Unread report");
});

test("runner not running offers Recover; the click starts the runner and resumes", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await openTakenCursorSession(page, origin);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await stopCursorRunner(dashboard.home);
  await reloadUntilRead(page);
  const entry = sessionEntriesIn(parts(page).taken);
  await expectReadingWithoutScreenLabel(
    entry,
    cursorRunnerSentence("not-running"),
  );
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(1);
  expect(agentCalls(cursor)).toEqual(calls);
  expect(cursor.attaches()).toHaveLength(attaches);
  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Ready for review", true);
  await expect.poll(() => cursor.attaches().length).toBeGreaterThan(attaches);
});
