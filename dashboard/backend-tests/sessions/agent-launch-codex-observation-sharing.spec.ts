// Viewers and alerts share the same typed machine-session reader and native calls.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { SharedAnswer } from "../../server/agentLaunchResponse.ts";
import { withStates } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import {
  MachineSessionObservation,
  machineSessionInputs,
  observedMachineRecords,
} from "../../server/machineSessionObservation.ts";
import {
  mountProjectConfiguration,
  removeConfiguredProject,
} from "../../server/projectConfiguration.ts";
import {
  SessionAlerts,
  type SessionAlertNotifier,
} from "../../server/sessionAlerts.ts";
import { machineSessionsReadSchema } from "../../src/machineSessionsRevision.ts";
import { expectPassiveCodexReads } from "../../test-support/support/codexPassiveProtocol.ts";
import {
  codexEndpoint,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  codexObservationCounts,
  codexRecord,
  privateHome,
  source,
  startNativeCodexEndpoint,
} from "../support/codexObservationFixture.ts";

const reuseMs = 1_000;
const waitMs = 10_000;
const overview = {
  audience: "overview",
  held: undefined,
  fresh: false,
} as const;
const review = {
  kind: "available",
  availability: "loaded",
  activity: "review",
};

function fullOverview({ serialized }: SharedAnswer) {
  const answer = machineSessionsReadSchema.parse(JSON.parse(serialized));
  if ("unchanged" in answer)
    throw new Error("Expected a full sessions overview");
  return answer;
}

function observeCodex(native: FakeCodex, sessionId: string, reuse: number) {
  const kept = codexRecord(sessionId, codexEndpoint(native));
  const inputs = vi.fn(() => Promise.resolve([source]));
  const observation = new MachineSessionObservation(
    async () =>
      makeMe.aMachineAnswer
        .observing(...(await withStates(machineFolder(), [kept], "recurring")))
        .please(),
    inputs,
    { waitMs, reuseMs: reuse },
  );
  return { observation, inputs };
}

test("eight viewers and the alert observer share one held observation", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  native.observations.set("shared", {
    status: { type: "idle" },
    turns: [{ id: "shared-turn", status: "completed" }],
    holdRead: true,
  });
  const { observation, inputs } = observeCodex(native, "shared", 60_000);
  vi.stubEnv("DOUGH_ALERT_CHECK_MS", "20");
  const signal = new AbortController();
  let alertPollsAnswered = 0;
  const send = vi
    .fn<SessionAlertNotifier["send"]>()
    .mockResolvedValue(undefined);
  const notifier: SessionAlertNotifier = {
    probe: () => Promise.resolve(undefined),
    send,
  };
  const alerts = new SessionAlerts(
    {
      async machineSessions(alertSignal) {
        const records = await observation.machineSessions(alertSignal);
        alertPollsAnswered += 1;
        return records;
      },
    },
    () => "http://127.0.0.1:4173",
    notifier,
  );
  const viewers: Promise<SharedAnswer>[] = [];
  try {
    await expect
      .poll(() => codexObservationCounts(native), { interval: 1 })
      .toEqual([1, 1]);
    viewers.push(
      ...Array.from({ length: 8 }, () =>
        observation.answerFor(overview, signal.signal),
      ),
    );
    await expect.poll(() => inputs.mock.calls.length, { interval: 1 }).toBe(9);
    expect(codexObservationCounts(native)).toEqual([1, 1]);
    native.releaseReads();

    const [first, ...others] = await Promise.all(viewers);
    if (first === undefined) throw new Error("Expected an overview");
    expect(others.map(({ serialized }) => serialized)).toEqual(
      Array.from({ length: 7 }, () => first.serialized),
    );
    const { records, attempts } = fullOverview(first);
    expect(records.map(({ sessionState }) => sessionState)).toEqual([review]);
    expect(attempts).toEqual([]);
    await expect
      .poll(() => alertPollsAnswered, { interval: 5 })
      .toBeGreaterThanOrEqual(3);
    expect(codexObservationCounts(native)).toEqual([1, 1]);
    expect(send).not.toHaveBeenCalled();
    expectPassiveCodexReads(native.calls, expect);
  } finally {
    alerts.close();
    signal.abort();
    native.releaseReads();
    await Promise.allSettled(viewers);
  }
});

test("a settled observation is reused within its window and refreshed at expiry", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  native.observations.set("settled", {
    status: { type: "idle" },
    turns: [{ id: "settled-turn", status: "completed" }],
  });
  const { observation } = observeCodex(native, "settled", reuseMs);
  const { signal } = new AbortController();
  vi.useFakeTimers({ toFake: ["Date"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });

  const first = await observation.answerFor(overview, signal);
  expect(
    fullOverview(first).records.map(({ sessionState }) => sessionState),
  ).toEqual([review]);
  expect(codexObservationCounts(native)).toEqual([1, 1]);
  native.observations.set("settled", {
    status: { type: "active", activeFlags: [] },
    turns: [],
  });

  const settledAt = Date.now();
  vi.setSystemTime(settledAt + reuseMs - 1);
  expect((await observation.answerFor(overview, signal)).serialized).toBe(
    first.serialized,
  );
  expect(codexObservationCounts(native)).toEqual([1, 1]);

  vi.setSystemTime(settledAt + reuseMs);
  const fresh = fullOverview(await observation.answerFor(overview, signal));
  expect(fresh.records.map(({ sessionState }) => sessionState)).toEqual([
    { kind: "available", availability: "loaded", activity: "working" },
  ]);
  expect(codexObservationCounts(native)).toEqual([2, 2]);
  expectPassiveCodexReads(native.calls, expect);
});

test("removing a project invalidates the settled observation within the reuse window", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  onTestFinished(mountProjectConfiguration("production"));
  native.observations.set("catalog", {
    status: { type: "idle" },
    turns: [{ id: "catalog-turn", status: "completed" }],
  });
  const kept = new Map([
    [source, [codexRecord("catalog", codexEndpoint(native))]],
  ]);
  const observation = new MachineSessionObservation(
    async () =>
      makeMe.aMachineAnswer
        .observing(...(await observedMachineRecords(kept)).records)
        .please(),
    machineSessionInputs,
    { waitMs, reuseMs },
  );
  const { signal } = new AbortController();
  vi.useFakeTimers({ toFake: ["Date"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });

  const first = fullOverview(await observation.answerFor(overview, signal));
  expect(first.records.map(({ session }) => session.sessionId)).toEqual([
    "catalog",
  ]);
  expect(codexObservationCounts(native)).toEqual([1, 1]);

  removeConfiguredProject(source);

  const after = fullOverview(await observation.answerFor(overview, signal));
  expect(after.records).toEqual([]);
  expect(codexObservationCounts(native)).toEqual([1, 1]);
});
