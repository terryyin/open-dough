// Machine-restart shape, end to end: the runner is killed with its
// address left stale (dead pid, freed port), reopening reads the scoped
// recorded session as not running and starts nothing, and the next
// new-work path starts a current runner and holds that previously held
// unfinished session again without Recover. Deterministic fake-Cursor
// proof only: real `cursor-agent` resumption after a real runner kill and
// after a real machine reboot, with a scoped session, remains pending
// native verification under ADR 0005 and is claimed nowhere here.
import { cursorRunnerSentence } from "../../src/cursorRunnerSessions.ts";
import { readCursorRunnerAddress } from "../../server/hosts/cursor/runnerPaths.ts";
import { parts, sessionStateOf } from "../dashboardPage.ts";
import { startSessionField } from "../launchStoryCardPage.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import {
  agentCalls,
  expectReadingWithoutScreenLabel,
} from "../support/cursorSessionReading.ts";
import {
  expectContinuationThroughScope,
  recordedScope,
} from "../support/cursorScopeAssertions.ts";
import { killCursorRunnerLeavingAddress } from "../support/cursorRunnerRecordedAddress.ts";
import {
  agentNotRunningLabel,
  keptRecords,
  startScopedCursorExecution,
} from "../support/cursorSessionRecovery.ts";
import { expect, test } from "../support/cursorStart.ts";
import { launchWaitMs } from "../support/launchWait.ts";

test.use({ cursorSubmitPaintMs: 300 });

const newWorkSessionId = "f6a7b8c9-d0e1-4cde-bef0-3456789abcde";

test("runner killed with its address left stale: reopening starts nothing and new work revives the prior unfinished session without Recover", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await startScopedCursorExecution(page, origin, cursor);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined) throw new Error("Missing a held Cursor session.");
  const scope = recordedScope(record);
  const workspace =
    record.session.host === "cursor"
      ? record.session.continuation.workspace
      : "";
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;

  const stale = await killCursorRunnerLeavingAddress(dashboard.home);

  // Reopening the dashboard only reads: the session stands as its
  // launch record, not running with Recover offered, and the stale
  // address, the dead runner, and the agent are all left untouched.
  await reloadUntilRead(page);
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expectReadingWithoutScreenLabel(
    entry,
    cursorRunnerSentence("not-running"),
  );
  await expect(entry.getByRole("button", { name: "Recover" })).toHaveCount(1);
  expect(readCursorRunnerAddress(dashboard.home)).toEqual(stale);
  expect(agentCalls(cursor)).toEqual(calls);
  expect(cursor.attaches()).toHaveLength(attaches);

  // New work starts a current runner and revives the prior unfinished
  // last-held session without a Recover click.
  cursor.queueCreateChatId(newWorkSessionId);
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill(
    "new work after dead runner should revive prior session",
  );
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(
      () =>
        cursor.attaches().filter((each) => each.sessionId === newWorkSessionId)
          .length,
      { timeout: launchWaitMs },
    )
    .toBe(1);

  const fresh = readCursorRunnerAddress(dashboard.home);
  expect(fresh?.pid).not.toBe(stale.pid);
  expect(fresh?.buildId).toBeTruthy();

  await expect
    .poll(
      () =>
        cursor.attaches().filter((each) => each.sessionId === cursor.sessionId)
          .length,
      { timeout: launchWaitMs },
    )
    .toBe(attaches + 1);

  await reloadUntilRead(page);
  const prior = parts(page)
    .taken.locator(".session-entry")
    .filter({ hasText: cursor.sessionId });
  await expect(prior.getByRole("button", { name: "Recover" })).toHaveCount(0);
  await expect(sessionStateOf(prior)).not.toHaveText(agentNotRunningLabel);
  await expect(sessionStateOf(prior)).not.toHaveText(
    cursorRunnerSentence("not-running"),
  );

  const resumed = cursor
    .attaches()
    .filter((each) => each.sessionId === cursor.sessionId)
    .at(-1);
  expect(resumed?.sessionId).toBe(cursor.sessionId);
  expect(resumed?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  expectContinuationThroughScope(resumed, scope);
});
