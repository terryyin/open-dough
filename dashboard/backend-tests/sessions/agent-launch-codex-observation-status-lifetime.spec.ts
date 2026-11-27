// Recorded-target reads crossing a deletion or the native endpoint deadline.
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { codexSessions } from "../../server/hosts/codex/sessions.ts";
import { deleteRecord } from "../../server/launchRecordDeletion.ts";
import {
  keptRecords,
  keptRecordsByProject,
  machineRecordStore,
} from "../../server/launchRecordStore.ts";
import {
  MachineSessionObservation,
  machineSessionInputs,
  observedMachineRecords,
} from "../../server/machineSessionObservation.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { codexEndpoint } from "../../test-support/support/fakeCodex.ts";
import { expectPassiveCodexReads } from "../../test-support/support/codexPassiveProtocol.ts";
import {
  codexRecord,
  startNativeCodexEndpoint,
  privateHome,
  source,
} from "../support/codexObservationFixture.ts";

const retainedReview = {
  kind: "available",
  availability: "retained",
  activity: "review",
};
const unknown = { kind: "unknown" };

test("deleting an unreadable saved record while passive reads are pending never recreates it", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  onTestFinished(mountProjectConfiguration("production"));
  const target = codexRecord("held", codexEndpoint(native));
  native.observations.set("held", {
    status: { type: "idle" },
    turns: [],
    holdRead: true,
  });
  await machineRecordStore.replaceRecords(() => ({ [source]: [target] }));
  const emptyAnswer = makeMe.aMachineAnswer.please();
  const inputReads: ReturnType<typeof machineSessionInputs>[] = [];
  const observer = new MachineSessionObservation(
    async () => {
      const { records } = await observedMachineRecords(
        await keptRecordsByProject(),
      );
      return { ...emptyAnswer, records };
    },
    () => {
      const reading = machineSessionInputs();
      inputReads.push(reading);
      return reading;
    },
    { waitMs: 10_000, reuseMs: 60_000 },
  );
  const controller = new AbortController();
  const pending = Promise.all([
    observer.machineSessions(controller.signal),
    observer.machineSessions(controller.signal),
  ]);
  try {
    await expect.poll(() => inputReads.length).toBe(2);
    await Promise.all(inputReads);
    await expect
      .poll(() => native.calls.map(({ method }) => method))
      .toContain("thread/read");
    native.observations.set("held", {
      status: { type: "idle" },
      turns: [],
      metadataError: { code: -32600, message: "Native read refused" },
    });
    expect(
      (await codexSessions([target], controller.signal))[0]?.sessionState,
    ).toEqual(unknown);
    expect(await deleteRecord(source, target.session)).toBe(true);
    native.releaseReads();

    const pendingRecord = [
      {
        session: { sessionId: "held" },
        sessionState: {
          kind: "available",
          availability: "loaded",
          activity: "awaiting-instruction",
        },
      },
    ];
    expect(await pending).toMatchObject([pendingRecord, pendingRecord]);
    expect(await keptRecords(source)).toEqual([]);
    expect(await observer.machineSessions(controller.signal)).toEqual([]);
    expectPassiveCodexReads(native.calls, expect);
  } finally {
    native.releaseReads();
    controller.abort();
    await Promise.allSettled([pending]);
  }
});

test("a silent native endpoint reaches its bound without erasing a healthy Codex endpoint", async () => {
  const home = privateHome();
  const native = await startNativeCodexEndpoint(home);
  const silent = await startNativeCodexEndpoint(path.join(home, "silent"));
  native.observations.set("healthy", {
    status: { type: "notLoaded" },
    turns: [{ id: "completed-turn", status: "completed" }],
  });
  silent.observations.set("silent", {
    status: { type: "idle" },
    turns: [],
    holdRead: true,
  });
  // Node's AbortSignal uses its own timer. Route the supplied delay through
  // the controlled clock while keeping both real sockets and abort handling.
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const timeout = vi
    .spyOn(AbortSignal, "timeout")
    .mockImplementation((delay) => {
      const controller = new AbortController();
      setTimeout(() => {
        controller.abort();
      }, delay);
      return controller.signal;
    });
  onTestFinished(() => {
    timeout.mockRestore();
    vi.useRealTimers();
  });
  const controller = new AbortController();
  const result = codexSessions(
    [
      codexRecord("healthy", codexEndpoint(native)),
      codexRecord("silent", codexEndpoint(silent)),
    ],
    controller.signal,
  );
  try {
    await expect
      .poll(() => silent.calls.map(({ method }) => method), { interval: 0 })
      .toContain("thread/read");
    await expect.poll(() => native.sockets.size, { interval: 0 }).toBe(0);
    await vi.advanceTimersByTimeAsync(8_999);
    expect(silent.sockets.size).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(timeout.mock.calls).toEqual([[9_000], [9_000]]);
    expect(
      (await result).map(({ session, sessionState }) => [
        session.sessionId,
        sessionState,
      ]),
    ).toEqual([
      ["healthy", retainedReview],
      ["silent", unknown],
    ]);
    await expect.poll(() => silent.sockets.size, { interval: 0 }).toBe(0);
    expectPassiveCodexReads(native.calls, expect);
    expectPassiveCodexReads(silent.calls, expect);
  } finally {
    controller.abort();
    await result;
  }
});
