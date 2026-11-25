// SessionAlerts raises one notification when an unread report arrives on a
// kept open record, in the report's own words, while a native reading still
// alerts as it would without a report; a Done record suppresses the report.
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import type { TerminalNotificationContent } from "../../server/terminalNotifier.ts";
import type { LaunchRecord, LaunchWithState } from "../../src/agentLaunch.ts";
import type { CompletionReport } from "../../src/completionReport.ts";

const checkMsKey = "DOUGH_ALERT_CHECK_MS";
const origin = "http://127.0.0.1:49177";
const attention = "Published. Reminder: check the migration.";
const waitingFor = "Which port?";

const record = (
  sessionId: string,
  title: string,
  doneAt?: string,
): LaunchRecord => {
  const builder = makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#unread-${sessionId}`,
      title,
      source: "open-dough",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) });
  return doneAt === undefined
    ? builder.please()
    : builder.markedDoneAt(doneAt).please();
};

const observed = (
  kept: LaunchRecord,
  sessionState: LaunchWithState["sessionState"],
  completion?: CompletionReport,
): LaunchWithState => {
  const base = makeMe.anObservedLaunch
    .of(kept)
    .withSessionState(sessionState)
    .please();
  return completion === undefined ? base : { ...base, completion };
};

const working = (kept: LaunchRecord, completion?: CompletionReport) =>
  observed(kept, makeMe.aSessionState.loaded("working").please(), completion);

const waiting = (kept: LaunchRecord, completion?: CompletionReport) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("waiting").waitingFor(waitingFor).please(),
    completion,
  );

const stopped = (kept: LaunchRecord, completion?: CompletionReport) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("interrupted").please(),
    completion,
  );

function observe(initial: readonly LaunchWithState[]) {
  let sessions = [...initial];
  let reads = 0;
  const sent: TerminalNotificationContent[] = [];
  const notifier: SessionAlertNotifier = {
    probe: () => Promise.resolve(undefined),
    send: (content) => {
      sent.push(content);
      return Promise.resolve(undefined);
    },
  };
  const alerts = new SessionAlerts(
    {
      machineSessions: () => {
        reads += 1;
        return Promise.resolve(sessions);
      },
    },
    () => origin,
    notifier,
  );
  return {
    sent,
    become(next: readonly LaunchWithState[]) {
      sessions = [...next];
    },
    async further() {
      const prior = reads;
      await expect.poll(() => reads).toBeGreaterThanOrEqual(prior + 2);
    },
    close() {
      alerts.close();
    },
  };
}

let priorCheckMs: string | undefined;
const owners: { close(): void }[] = [];

beforeEach(() => {
  priorCheckMs = process.env[checkMsKey];
  process.env[checkMsKey] = "20";
});

afterEach(() => {
  while (owners.length > 0) owners.pop()?.close();
  if (priorCheckMs === undefined)
    Reflect.deleteProperty(process.env, checkMsKey);
  else process.env[checkMsKey] = priorCheckMs;
});

test("a report arriving unread raises one notification in its own words, apart from the native reading, and none once marked done", async () => {
  const openKept = record("open-report", "Unread open");
  const doneKept = record(
    "done-report",
    "Marked done",
    "2026-11-25T10:00:00.000Z",
  );
  const unread = makeMe.aCompletionReport.saying(attention).please();
  const suppressed = makeMe.aCompletionReport
    .saying(attention)
    .withReceipt("aaaaaaaa-0000-4000-8000-000000000099")
    .please();
  const owner = observe([working(openKept), working(doneKept)]);
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);

  owner.become([working(openKept, unread), working(doneKept)]);
  await expect.poll(() => owner.sent.length).toBe(1);
  expect(owner.sent).toEqual([
    {
      title: "open-dough · Unread open",
      message: "Unread report: Completed with attention",
      destination: `${origin}/?project=open-dough&story=SEED-413%23unread-open-report`,
    },
  ]);
  await owner.further();
  expect(owner.sent).toHaveLength(1);

  owner.become([waiting(openKept, unread), working(doneKept)]);
  await expect.poll(() => owner.sent.length).toBe(2);
  await owner.further();
  expect(owner.sent.map(({ message }) => message)).toEqual([
    "Unread report: Completed with attention",
    `Needs input: ${waitingFor}`,
  ]);

  owner.become([waiting(openKept, unread), stopped(doneKept, suppressed)]);
  await owner.further();
  await owner.further();
  expect(owner.sent).toHaveLength(2);
});
