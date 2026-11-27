// A departing or expired waiter leaves the held native observation running.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { withStates } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";
import { expectPassiveCodexReads } from "../../test-support/support/codexPassiveProtocol.ts";
import {
  codexEndpoint,
  type FakeCodexObservation,
} from "../../test-support/support/fakeCodex.ts";
import {
  codexObservationCounts,
  codexRecord,
  privateHome,
  source,
  startNativeCodexEndpoint,
} from "../support/codexObservationFixture.ts";

const waitMs = 1_500;
const reuseMs = 1_000;
const review = {
  kind: "available",
  availability: "loaded",
  activity: "review",
};

test("a departing or expired waiter leaves other session reads on the same observation", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  const kept = codexRecord("slow", codexEndpoint(native));
  const settled: FakeCodexObservation = {
    status: { type: "idle" },
    turns: [{ id: "slow-turn", status: "completed" }],
  };
  native.observations.set("slow", { ...settled, holdRead: true });
  const observation = new MachineSessionObservation(
    async () =>
      makeMe.aMachineAnswer
        .observing(...(await withStates(machineFolder(), [kept], "recurring")))
        .please(),
    () => Promise.resolve([source]),
    { waitMs, reuseMs },
  );
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const staying = new AbortController();
  const departing = new AbortController();
  onTestFinished(() => {
    staying.abort();
    departing.abort();
    native.releaseReads();
  });
  const ask = (signal = staying.signal) => observation.machineSessions(signal);

  const waiting = Promise.all([ask(), ask()]);
  const departed = ask(departing.signal).catch((reason: unknown) => reason);
  await expect
    .poll(() => codexObservationCounts(native), { interval: 0 })
    .toEqual([1, 1]);
  departing.abort();
  expect(await departed).toBeInstanceOf(RefusedRequest);
  native.releaseReads();
  expect(
    (await waiting).map((records) =>
      records.map(({ sessionState }) => sessionState),
    ),
  ).toEqual([[review], [review]]);
  expect(codexObservationCounts(native)).toEqual([1, 1]);

  await vi.advanceTimersByTimeAsync(reuseMs);
  const replied = vi.fn<() => void>();
  const late = Promise.allSettled([
    ask().finally(replied),
    ask().finally(replied),
  ]);
  await expect
    .poll(() => codexObservationCounts(native), { interval: 0 })
    .toEqual([2, 2]);
  await vi.advanceTimersByTimeAsync(waitMs - 1);
  expect(replied).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  for (const result of await late) {
    if (result.status !== "rejected")
      throw new Error("Expected a retryable refusal");
    const reason: unknown = result.reason;
    if (!(reason instanceof RefusedRequest)) {
      throw new Error("Expected a RefusedRequest", { cause: reason });
    }
    expect(reason.status).toBe(503);
    expect(reason.message).toMatch(/not observed within .* Ask again\./);
  }
  expect(codexObservationCounts(native)).toEqual([2, 2]);

  const rejoined = ask();
  await vi.advanceTimersByTimeAsync(0);
  native.observations.set("slow", settled);
  native.releaseReads();
  expect((await rejoined).map(({ sessionState }) => sessionState)).toEqual([
    review,
  ]);
  expect(codexObservationCounts(native)).toEqual([2, 2]);

  await vi.advanceTimersByTimeAsync(reuseMs);
  expect((await ask()).map(({ sessionState }) => sessionState)).toEqual([
    review,
  ]);
  expect(codexObservationCounts(native)).toEqual([3, 3]);
  expectPassiveCodexReads(native.calls, expect);
});
