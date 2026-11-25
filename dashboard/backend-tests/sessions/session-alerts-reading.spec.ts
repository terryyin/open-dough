// SessionAlerts raises one macOS notification when a kept session begins
// needing the developer: each alerting reading once, quiet through an
// unreadable listing and Done, quiet for a restart that finds attention
// already present, and one alert when a later reading first needs attention
// or genuinely re-enters it. Delivery lifetime stays in
// ./session-alerts.spec.ts until its owned slice moves it.
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import type { TerminalNotificationContent } from "../../server/terminalNotifier.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";

const checkMsKey = "DOUGH_ALERT_CHECK_MS";
const origin = "http://127.0.0.1:49175";

const record = (sessionId: string, title: string, doneAt?: string) => {
  const builder = makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#alert-${sessionId}`,
      title,
      source: "open-dough",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) });
  return doneAt === undefined
    ? builder.please()
    : builder.markedDoneAt(doneAt).please();
};

const observed = (
  kept: ReturnType<typeof record>,
  sessionState: LaunchWithState["sessionState"],
): LaunchWithState =>
  makeMe.anObservedLaunch.of(kept).withSessionState(sessionState).please();

const working = (kept: ReturnType<typeof record>) =>
  observed(kept, makeMe.aSessionState.loaded("working").please());

const waiting = (kept: ReturnType<typeof record>, waitingFor?: string) => {
  const state = makeMe.aSessionState.loaded("waiting");
  if (waitingFor !== undefined) state.waitingFor(waitingFor);
  return observed(kept, state.please());
};

const reading = (
  kept: ReturnType<typeof record>,
  activity: "review" | "failed" | "interrupted",
) => observed(kept, makeMe.aSessionState.loaded(activity).please());

const unavailable = (kept: ReturnType<typeof record>) =>
  observed(kept, makeMe.aSessionState.unavailable().please());

const unrecognized = (kept: ReturnType<typeof record>) =>
  observed(
    kept,
    makeMe.aSessionState
      .loaded("unknown")
      .describedAs("Claude Code lists it as napping")
      .unknownReason("unrecognized")
      .please(),
  );

const unreadable = (kept: ReturnType<typeof record>) =>
  observed(kept, makeMe.aSessionState.unknown().please());

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

test("raises one for each other reading: ready for review, failed, stopped, unavailable, and not recognized", async () => {
  const reviewKept = record("reading-0", "Alert story 0");
  const failedKept = record("reading-1", "Alert story 1");
  const stoppedKept = record("reading-2", "Alert story 2");
  const unavailableKept = record("reading-3", "Alert story 3");
  const unrecognizedKept = record("reading-4", "Alert story 4");
  const kept = [
    reviewKept,
    failedKept,
    stoppedKept,
    unavailableKept,
    unrecognizedKept,
  ];
  const owner = observe(kept.map(working));
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);
  owner.become([
    reading(reviewKept, "review"),
    reading(failedKept, "failed"),
    reading(stoppedKept, "interrupted"),
    unavailable(unavailableKept),
    unrecognized(unrecognizedKept),
  ]);
  await expect.poll(() => owner.sent.length).toBe(5);
  await owner.further();
  expect(owner.sent.map(({ message }) => message).sort()).toEqual([
    "Ready for review",
    "Session failed",
    "Session stopped",
    "Session unavailable",
    "State not recognized",
  ]);
});

test("raises nothing when Claude Code's listing cannot be read", async () => {
  const kept = record("listing-fail", "Listing fail story");
  const owner = observe([working(kept)]);
  owners.push(owner);
  await owner.further();
  owner.become([unreadable(kept)]);
  await owner.further();
  await owner.further();
  expect(owner.sent).toEqual([]);
});

test("never raises one for a session marked done, even when it stops", async () => {
  const kept = record(
    "done-stop",
    "Done stop story",
    "2026-11-25T10:00:00.000Z",
  );
  const owner = observe([working(kept)]);
  owners.push(owner);
  await owner.further();
  owner.become([reading(kept, "interrupted")]);
  await owner.further();
  expect(owner.sent).toEqual([]);
});

test("stays quiet for a session a restarted server finds already needing the developer, and raises one when it leaves and re-enters", async () => {
  const kept = record("restart", "Restart story");
  const needing = waiting(kept, "Which database?");
  const owner = observe([needing]);
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);
  owner.become([unreadable(kept)]);
  await owner.further();
  owner.become([needing]);
  await owner.further();
  expect(owner.sent).toEqual([]);
  owner.become([working(kept)]);
  await owner.further();
  owner.become([needing]);
  await expect.poll(() => owner.sent.length).toBe(1);
  expect(owner.sent[0]?.message).toBe("Needs input: Which database?");
});

test("raises one for a session first listed after server start, once it needs the developer", async () => {
  const kept = record("later", "Later story");
  const owner = observe([]);
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);
  owner.become([working(kept)]);
  await owner.further();
  expect(owner.sent).toEqual([]);
  owner.become([waiting(kept)]);
  await expect.poll(() => owner.sent.length).toBe(1);
  await owner.further();
  expect(owner.sent).toHaveLength(1);
  expect(owner.sent[0]?.message).toBe("Needs input");
});
