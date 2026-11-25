// A refused send surfaces the fixed availability reason without native stderr
// and recovers after a new attention transition. Before a usable listener
// address exists, attention emits no notification and reports why. The
// sidebar that shows the reading stays in
// ../../../e2e/sessions/session-alerts-unavailable.spec.ts.
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import type { TerminalNotificationContent } from "../../server/terminalNotifier.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";

const checkMsKey = "DOUGH_ALERT_CHECK_MS";
const origin = "http://127.0.0.1:49176";
const refused =
  "Open Dough did not accept the notification. Turn on Allow notifications in System Settings → Notifications → Open Dough, or run npm run setup-notifier:dashboard -- --test and choose Allow when macOS asks.";
const noDestination =
  "The dashboard has no listening loopback HTTP address for notification clicks.";

const record = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({
      identity: `SEED-413#refused-${sessionId}`,
      title: `Refuse ${sessionId}`,
      source: "open-dough",
    })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .please();

const observed = (
  kept: ReturnType<typeof record>,
  sessionState: LaunchWithState["sessionState"],
): LaunchWithState =>
  makeMe.anObservedLaunch.of(kept).withSessionState(sessionState).please();

const working = (kept: ReturnType<typeof record>) =>
  observed(kept, makeMe.aSessionState.loaded("working").please());

const waiting = (kept: ReturnType<typeof record>) =>
  observed(
    kept,
    makeMe.aSessionState.loaded("waiting").waitingFor("Choose").please(),
  );

function observe(
  initial: readonly LaunchWithState[],
  options: {
    origin?: () => string | undefined;
    notifier?: SessionAlertNotifier;
  } = {},
) {
  let sessions = [...initial];
  let reads = 0;
  const sent: TerminalNotificationContent[] = [];
  const notifier: SessionAlertNotifier = options.notifier ?? {
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
    options.origin ?? (() => origin),
    notifier,
  );
  return {
    alerts,
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

test("a refused send explains without stderr and recovers on the next transition", async () => {
  const kept = record("recover");
  let refuseNext = true;
  const probes: Array<string | undefined> = [];
  const sent: TerminalNotificationContent[] = [];
  const owner = observe([working(kept)], {
    notifier: {
      probe: () => {
        probes.push(undefined);
        return Promise.resolve(undefined);
      },
      send: (content) => {
        sent.push(content);
        if (refuseNext) {
          refuseNext = false;
          return Promise.resolve(refused);
        }
        return Promise.resolve(undefined);
      },
    },
  });
  owners.push(owner);
  await owner.further();
  expect(owner.alerts.availability()).toEqual({ available: true });

  owner.become([waiting(kept)]);
  await expect
    .poll(() => owner.alerts.availability())
    .toEqual({ available: false, reason: refused });
  expect(sent).toHaveLength(1);
  expect(JSON.stringify(sent[0])).not.toMatch(/stderr|errno|ENOENT/i);

  owner.become([working(kept)]);
  await owner.further();
  owner.become([waiting(kept)]);
  await expect.poll(() => sent.length).toBe(2);
  await expect
    .poll(() => owner.alerts.availability())
    .toEqual({
      available: true,
    });
  expect(probes.length).toBeGreaterThanOrEqual(2);
});

test("before a usable listening address, attention emits no notification and reports why", async () => {
  const kept = record("no-origin");
  const listening: { origin: string | undefined } = { origin: undefined };
  const owner = observe([working(kept)], {
    origin: () => listening.origin,
  });
  owners.push(owner);
  await owner.further();
  await expect
    .poll(() => owner.alerts.availability())
    .toEqual({
      available: false,
      reason: noDestination,
    });

  owner.become([waiting(kept)]);
  await owner.further();
  expect(owner.sent).toEqual([]);

  listening.origin = origin;
  owner.become([working(kept)]);
  await owner.further();
  owner.become([waiting(kept)]);
  await expect.poll(() => owner.sent.length).toBe(1);
  await expect
    .poll(() => owner.alerts.availability())
    .toEqual({
      available: true,
    });
});
