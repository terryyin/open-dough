// The shared outstanding observation (../../server/sharedObservation.ts) on
// its own: a failed observation keeps no result, the next demand observes
// afresh, a demand under other inputs waits for the running observation to
// settle and then starts its own instead of being answered by it, a waiter
// past its bound is unanswered without ending the observation, and a fresh
// demand is answered only by an observation begun after it arrived.

import { expect, test } from "../support/pageTest.ts";
import { SharedObservation } from "../../server/sharedObservation.ts";

const open = () => new AbortController().signal;

test("a failed observation rejects its waiters and the next demand observes afresh", async () => {
  let starts = 0;
  let fail = true;
  const shared = new SharedObservation(
    () => {
      starts += 1;
      return fail
        ? Promise.reject(new Error("unreadable"))
        : Promise.resolve(starts);
    },
    () => 60_000,
  );
  const failed = [
    shared.demand(["a"], 1_000, open()),
    shared.demand(["a"], 1_000, open()),
  ];
  for (const demand of failed)
    await expect(demand).rejects.toThrow("unreadable");
  expect(starts).toBe(1);
  fail = false;
  expect(await shared.demand(["a"], 1_000, open())).toEqual({
    kind: "observed",
    value: 2,
  });
  // Settled within the window, it serves the next demand.
  expect(await shared.demand(["a"], 1_000, open())).toEqual({
    kind: "observed",
    value: 2,
  });
  expect(starts).toBe(2);
});

test("a demand under other inputs waits for the running observation and starts its own", async () => {
  const releases: (() => void)[] = [];
  let starts = 0;
  const shared = new SharedObservation(
    () =>
      new Promise<number>((resolve) => {
        starts += 1;
        const value = starts;
        releases.push(() => {
          resolve(value);
        });
      }),
    () => 60_000,
  );
  const earlier = shared.demand(["before"], 1_000, open());
  const later = shared.demand(["after"], 1_000, open());
  const departing = new AbortController();
  const departed = shared.demand(["before"], 1_000, departing.signal);
  departing.abort();
  expect(await departed).toEqual({ kind: "departed" });
  expect(starts).toBe(1);
  releases.shift()?.();
  expect(await earlier).toEqual({ kind: "observed", value: 1 });
  await expect.poll(() => starts).toBe(2);
  releases.shift()?.();
  expect(await later).toEqual({ kind: "observed", value: 2 });
});

test("a waiter past its bound is unanswered while the observation goes on", async () => {
  let starts = 0;
  const shared = new SharedObservation(
    () => {
      starts += 1;
      return new Promise<number>(() => undefined);
    },
    () => 60_000,
  );
  expect(await shared.demand(["a"], 50, open())).toEqual({
    kind: "unanswered",
  });
  expect(await shared.demand(["a"], 50, open())).toEqual({
    kind: "unanswered",
  });
  expect(starts).toBe(1);
});

test("a settled observation inside the reuse window does not answer a fresh demand", async () => {
  let starts = 0;
  const shared = new SharedObservation(
    () => {
      starts += 1;
      return Promise.resolve(starts);
    },
    () => 60_000,
  );
  expect(await shared.demand(["a"], 1_000, open())).toEqual({
    kind: "observed",
    value: 1,
  });
  expect(await shared.demand(["a"], 1_000, open())).toEqual({
    kind: "observed",
    value: 1,
  });
  expect(starts).toBe(1);
  expect(await shared.demand(["a"], 1_000, open(), true)).toEqual({
    kind: "observed",
    value: 2,
  });
  expect(await shared.demand(["a"], 1_000, open())).toEqual({
    kind: "observed",
    value: 2,
  });
  expect(starts).toBe(2);
});

test("an observation running before a fresh demand cannot complete it; no overlap", async () => {
  const releases: (() => void)[] = [];
  let starts = 0;
  const shared = new SharedObservation(
    () =>
      new Promise<number>((resolve) => {
        starts += 1;
        const value = starts;
        releases.push(() => {
          resolve(value);
        });
      }),
    () => 60_000,
  );
  const earlier = shared.demand(["a"], 1_000, open());
  expect(starts).toBe(1);
  const fresh = shared.demand(["a"], 1_000, open(), true);
  expect(starts).toBe(1);
  releases.shift()?.();
  expect(await earlier).toEqual({ kind: "observed", value: 1 });
  await expect.poll(() => starts).toBe(2);
  expect(starts).toBe(2);
  releases.shift()?.();
  expect(await fresh).toEqual({ kind: "observed", value: 2 });
  expect(starts).toBe(2);
});

test("concurrent fresh demands share one suitable observation; ordinary demands keep sharing", async () => {
  const releases: (() => void)[] = [];
  let starts = 0;
  const shared = new SharedObservation(
    () =>
      new Promise<number>((resolve) => {
        starts += 1;
        const value = starts;
        releases.push(() => {
          resolve(value);
        });
      }),
    () => 60_000,
  );
  const older = shared.demand(["a"], 1_000, open());
  expect(starts).toBe(1);
  const fresh = [
    shared.demand(["a"], 1_000, open(), true),
    shared.demand(["a"], 1_000, open(), true),
    shared.demand(["a"], 1_000, open(), true),
  ];
  expect(starts).toBe(1);
  releases.shift()?.();
  expect(await older).toEqual({ kind: "observed", value: 1 });
  await expect.poll(() => starts).toBe(2);
  expect(starts).toBe(2);
  releases.shift()?.();
  expect(await Promise.all(fresh)).toEqual([
    { kind: "observed", value: 2 },
    { kind: "observed", value: 2 },
    { kind: "observed", value: 2 },
  ]);
  expect(starts).toBe(2);

  // Ordinary demand still shares the settled observation inside the window.
  const ordinary = [
    shared.demand(["a"], 1_000, open()),
    shared.demand(["a"], 1_000, open()),
  ];
  expect(starts).toBe(2);
  expect(await Promise.all(ordinary)).toEqual([
    { kind: "observed", value: 2 },
    { kind: "observed", value: 2 },
  ]);
  expect(starts).toBe(2);
});
