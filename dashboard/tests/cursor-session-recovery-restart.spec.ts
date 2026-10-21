// Machine-restart shape, end to end: the runner is killed with its
// address left stale (dead pid, freed port), reopening reads the scoped
// recorded session as not running and starts nothing, and Recover then
// resumes the same chat under its recorded scope on a freshly started
// current runner. Deterministic fake-Cursor proof only: real
// `cursor-agent` resumption after a real runner kill and after a real
// machine reboot, with a scoped session, remains pending native
// verification under ADR 0005 and is claimed nowhere here.
import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";
import { readCursorRunnerAddress } from "../server/hosts/cursor/runnerPaths.ts";
import { parts } from "./dashboardPage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import {
  agentCalls,
  expectNormalizedReading,
  expectReadingWithoutScreenLabel,
} from "./support/cursorSessionReading.ts";
import {
  expectContinuationThroughScope,
  recordedScope,
} from "./support/cursorScopeAssertions.ts";
import { killCursorRunnerLeavingAddress } from "./support/cursorRunnerRecordedAddress.ts";
import {
  keptRecords,
  startScopedCursorExecution,
} from "./support/cursorSessionRecovery.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({ cursorSubmitPaintMs: 300 });

test("runner killed with its address left stale: reopening starts nothing and Recover resumes the scoped session on a fresh runner", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
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

  await entry.getByRole("button", { name: "Recover" }).click();
  await expectNormalizedReading(entry, "Ready for review", true);
  await expect.poll(() => cursor.attaches().length).toBe(attaches + 1);
  const resumed = cursor.attaches().at(-1);
  expect(resumed?.sessionId).toBe(cursor.sessionId);
  expect(resumed?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  expectContinuationThroughScope(resumed, scope);
  const fresh = readCursorRunnerAddress(dashboard.home);
  expect(fresh?.pid).not.toBe(stale.pid);
  expect(fresh?.buildId).toBeTruthy();
});
