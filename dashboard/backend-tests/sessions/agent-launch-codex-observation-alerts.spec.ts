// Native Codex readings drive the real alert loop and a typed notification sink.
import { expect, onTestFinished, test, vi } from "vitest";
import { withStates } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import type { TerminalNotificationContent } from "../../server/terminalNotifier.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { expectPassiveCodexReads } from "../../test-support/support/codexPassiveProtocol.ts";
import {
  codexEndpoint,
  type FakeCodexObservation,
} from "../../test-support/support/fakeCodex.ts";
import {
  codexRecord,
  privateHome,
  startNativeCodexEndpoint,
  story,
} from "../support/codexObservationFixture.ts";

const working: FakeCodexObservation = {
  status: { type: "active", activeFlags: [] },
  turns: [],
};
const waiting: FakeCodexObservation = {
  status: { type: "active", activeFlags: ["waitingOnUserInput"] },
  turns: [],
};
const completed: FakeCodexObservation = {
  status: { type: "idle" },
  turns: [{ id: "completed-turn", status: "completed" }],
};
const incomplete: FakeCodexObservation = {
  ...completed,
  status: { type: "active" },
};
const historyUnavailable: FakeCodexObservation = {
  status: { type: "idle" },
  turns: [],
  historyError: { code: -32601, message: "History unavailable" },
};

const needsInput = "Needs input: Codex is waiting for your input";
const unrecognized = "State not recognized";
const readyForReview = "Ready for review";

function observeAlerts(records: () => readonly LaunchRecord[]) {
  vi.stubEnv("DOUGH_ALERT_CHECK_MS", "20");
  let pollsStarted = 0;
  const sent: TerminalNotificationContent[] = [];
  const notifier: SessionAlertNotifier = {
    probe: () => Promise.resolve(undefined),
    send(content) {
      sent.push(content);
      return Promise.resolve(undefined);
    },
  };
  const alerts = new SessionAlerts(
    {
      machineSessions() {
        pollsStarted++;
        return withStates(machineFolder(), records(), "recurring");
      },
    },
    () => "http://127.0.0.1:49175",
    notifier,
  );
  onTestFinished(() => {
    alerts.close();
  });
  return {
    sent,
    messages: () => sent.map(({ message }) => message),
    async further() {
      // The loop never overlaps polls. Two more starts mean that at least
      // one whole poll has finished since the test supplied a new reading.
      const next = pollsStarted + 2;
      await expect
        .poll(() => pollsStarted, { interval: 5 })
        .toBeGreaterThanOrEqual(next);
    },
  };
}

test("native transition alerts unrecognized states once and stays quiet for incomplete reads", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  onTestFinished(mountProjectConfiguration("production"));
  const kept = codexRecord("alert", codexEndpoint(native));
  const become = (observation: FakeCodexObservation) => {
    native.observations.set(kept.session.sessionId, observation);
  };
  become({ ...completed, status: { type: "notLoaded" } });
  const alerts = observeAlerts(() => [kept]);
  await alerts.further();
  expect(alerts.sent).toEqual([]);

  become(working);
  await alerts.further();
  become(waiting);
  await alerts.further();
  expect(alerts.sent[0]).toMatchObject({
    message: needsInput,
    title: `Open Dough · ${story.title}`,
  });
  expect(alerts.messages()).toEqual([needsInput]);

  become({
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  });
  await alerts.further();
  expect(alerts.messages()).toEqual([needsInput]);

  const unexpected = [
    { status: { type: "futureNativeStatus" }, turns: [] },
    { status: { type: "active", activeFlags: ["futureFlag"] }, turns: [] },
    {
      status: { type: "idle" },
      turns: [{ id: "future-turn", status: "futureTurnStatus" }],
    },
  ] satisfies FakeCodexObservation[];
  const expected = [needsInput];
  for (const observation of unexpected) {
    become(observation);
    await alerts.further();
    expected.push(unrecognized);
    expect(alerts.messages()).toEqual(expected);
    await alerts.further();
    expect(alerts.messages()).toEqual(expected);
    become(working);
    await alerts.further();
  }

  become({
    status: { type: "idle" },
    turns: [{ id: "future-turn", status: "futureTurnStatus" }],
  });
  await alerts.further();
  expected.push(unrecognized);
  expect(alerts.messages()).toEqual(expected);

  for (const gap of [incomplete, historyUnavailable]) {
    become(gap);
    await alerts.further();
    expect(alerts.messages()).toEqual(expected);
  }

  become(completed);
  await alerts.further();
  expect(alerts.messages()).toEqual([...expected, readyForReview]);
  expectPassiveCodexReads(native.calls, expect);
});

test("review baselines and notifications survive failed, incomplete and omitted observations until confirmed activity changes", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  onTestFinished(mountProjectConfiguration("production"));
  const endpoint = codexEndpoint(native);
  const reviewed = codexRecord("review", endpoint);
  const sentinel = codexRecord("sentinel", endpoint);
  const listed = [reviewed, sentinel];
  let kept = listed;
  const become = (observation: FakeCodexObservation) => {
    native.observations.set(reviewed.session.sessionId, observation);
  };
  become(completed);
  native.observations.set(sentinel.session.sessionId, working);
  const alerts = observeAlerts(() => kept);
  await alerts.further();
  expect(alerts.messages()).toEqual([]);

  const gaps = [
    [
      "metadata refusal",
      {
        ...completed,
        metadataError: {
          code: -32001,
          message: "Server overloaded; retry later.",
        },
      },
    ],
    ["incomplete status", incomplete],
    ["unreadable history", historyUnavailable],
    ["omitted record", undefined],
  ] satisfies [string, FakeCodexObservation | undefined][];

  async function staysQuietAcrossGaps(prior: readonly string[]) {
    for (const [gap, observation] of gaps) {
      if (observation === undefined) kept = [sentinel];
      else become(observation);
      await alerts.further();

      become(completed);
      kept = listed;
      await alerts.further();
      expect(alerts.messages(), gap).toEqual(prior);
    }
  }

  await staysQuietAcrossGaps([]);
  become(working);
  await alerts.further();
  become(completed);
  await alerts.further();
  expect(alerts.messages()).toEqual([readyForReview]);

  await staysQuietAcrossGaps([readyForReview]);
  become(waiting);
  await alerts.further();
  become(completed);
  await alerts.further();
  expect(alerts.messages()).toEqual([
    readyForReview,
    needsInput,
    readyForReview,
  ]);
  expectPassiveCodexReads(native.calls, expect);
});
