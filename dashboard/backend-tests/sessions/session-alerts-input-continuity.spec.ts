// SessionAlerts keeps a handled input wait quiet across omitted records,
// unknown readings and a changed wait summary, then alerts once after a
// confirmed working reading rearms it. Native listing and parsing stay with
// the host's reader; these cases drive typed LaunchWithState observations.
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import type { TerminalNotificationContent } from "../../server/terminalNotifier.ts";
import type { LaunchRecord, LaunchWithState } from "../../src/agentLaunch.ts";

const checkMsKey = "DOUGH_ALERT_CHECK_MS";
const origin = "http://127.0.0.1:49176";
const words = "Which database?";
const changed = "A changed question";

const claudeRecord = (sessionId: string, title: string): LaunchRecord =>
  makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#continuity-${sessionId}`,
      title,
      source: "open-dough",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .please();

const codexRecord = (sessionId: string, title: string): LaunchRecord =>
  makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#continuity-${sessionId}`,
      title,
      source: "open-dough",
    })
    .inCodexSession({ sessionId })
    .please();

const observed = (
  kept: LaunchRecord,
  sessionState: LaunchWithState["sessionState"],
): LaunchWithState =>
  makeMe.anObservedLaunch.of(kept).withSessionState(sessionState).please();

const working = (kept: LaunchRecord) =>
  observed(kept, makeMe.aSessionState.loaded("working").please());

const waiting = (kept: LaunchRecord, waitingFor = words) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("waiting").waitingFor(waitingFor).please(),
  );

const unknown = (kept: LaunchRecord) =>
  observed(kept, makeMe.aSessionState.unknown().please());

const incomplete = (kept: LaunchRecord) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("unknown").unknownReason("incomplete").please(),
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

const inputNotices = (sent: TerminalNotificationContent[]) =>
  sent.filter((notice) => notice.message.startsWith("Needs input"));

async function silenceThroughGaps(
  owner: ReturnType<typeof observe>,
  kept: LaunchRecord,
  baseline: readonly LaunchWithState[],
  waitingObservation: LaunchWithState,
) {
  owner.become([unknown(kept), ...baseline]);
  await owner.further();
  owner.become([incomplete(kept), ...baseline]);
  await owner.further();
  owner.become([...baseline]);
  await owner.further();
  owner.become([waiting(kept, changed), ...baseline]);
  await owner.further();
  owner.become([waitingObservation, ...baseline]);
  await owner.further();
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

test("baselined Codex input stays quiet through unknown, incomplete, omitted and changed summary, then alerts once after working rearms it", async () => {
  const kept = codexRecord("codex-baseline", "Codex baseline");
  const needing = waiting(kept);
  const owner = observe([needing]);
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);
  await silenceThroughGaps(owner, kept, [], needing);
  expect(inputNotices(owner.sent)).toEqual([]);
  owner.become([working(kept)]);
  await owner.further();
  owner.become([needing]);
  await expect.poll(() => inputNotices(owner.sent).length).toBe(1);
  await owner.further();
  expect(inputNotices(owner.sent)).toEqual([
    {
      title: "open-dough · Codex baseline",
      message: `Needs input: ${words}`,
      destination: `${origin}/?project=open-dough&story=SEED-413%23continuity-codex-baseline`,
    },
  ]);
});

test("already-alerted Claude input stays quiet through the same gaps, then alerts once after working rearms it", async () => {
  const kept = claudeRecord("claude-alerted", "Claude alerted");
  const needing = waiting(kept);
  const owner = observe([working(kept)]);
  owners.push(owner);
  await owner.further();
  expect(owner.sent).toEqual([]);
  owner.become([needing]);
  await expect.poll(() => inputNotices(owner.sent).length).toBe(1);
  await silenceThroughGaps(owner, kept, [], needing);
  expect(inputNotices(owner.sent)).toHaveLength(1);
  owner.become([working(kept)]);
  await owner.further();
  owner.become([needing]);
  await expect.poll(() => inputNotices(owner.sent).length).toBe(2);
  await owner.further();
  expect(inputNotices(owner.sent).at(-1)?.message).toBe(
    `Needs input: ${words}`,
  );
  expect(inputNotices(owner.sent)).toHaveLength(2);
});

test("each newly listed Codex or Claude wait alerts once, and omission of both keeps prior input quiet until working rearms one", async () => {
  const first = codexRecord("codex-first", "First Codex");
  const second = claudeRecord("claude-second", "Claude collision");
  const owner = observe([]);
  owners.push(owner);
  await owner.further();
  owner.become([waiting(first)]);
  await expect.poll(() => inputNotices(owner.sent).length).toBe(1);
  owner.become([waiting(first), waiting(second)]);
  await expect.poll(() => inputNotices(owner.sent).length).toBe(2);
  expect(inputNotices(owner.sent).map((notice) => notice.title)).toEqual([
    "open-dough · First Codex",
    "open-dough · Claude collision",
  ]);
  owner.become([]);
  await owner.further();
  owner.become([waiting(first), waiting(second)]);
  await owner.further();
  expect(inputNotices(owner.sent)).toHaveLength(2);
  owner.become([working(first), waiting(second)]);
  await owner.further();
  owner.become([waiting(first), waiting(second)]);
  await expect.poll(() => inputNotices(owner.sent).length).toBe(3);
  await owner.further();
  expect(inputNotices(owner.sent).at(-1)?.title).toBe(
    "open-dough · First Codex",
  );
  expect(inputNotices(owner.sent)).toHaveLength(3);
});
