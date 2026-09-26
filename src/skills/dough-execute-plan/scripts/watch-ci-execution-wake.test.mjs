import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import { watchCiExecution } from "./watch-ci-execution.mjs";

const neverScheduled = 10 * 60 * 1000;

// Records each recheck pause and its signal while pausing as the product does.
function recordedPause() {
  const pauses = [];
  const waiting = [];
  return {
    pauses,
    // Resolves once `count` pauses have begun.
    pausesBegun: (count) =>
      new Promise((resolve) => {
        waiting.push({ count, resolve });
        if (pauses.length >= count) resolve();
      }),
    sleep: (milliseconds, value, options) => {
      pauses.push({ milliseconds, signal: options.signal });
      for (const { count, resolve } of waiting)
        if (pauses.length >= count) resolve();
      return pause(milliseconds, value, options);
    },
  };
}

function registrations() {
  const armed = [];
  return {
    armed,
    armRegistrationWake: () => {
      const wake = new AbortController();
      armed.push(wake);
      return wake.signal;
    },
    register: () => armed.at(-1).abort(),
  };
}

test("a registration during an in-flight poll brings exactly one more immediate check", async () => {
  const observation = new AbortController();
  const { sleep, pauses, pausesBegun } = recordedPause();
  const registration = registrations();
  let polls = 0;
  let finishFirstPoll;
  const firstPollRunning = new Promise((running) => {
    finishFirstPoll = running;
  });
  let releaseFirstPoll;
  const watching = watchCiExecution({
    repo: "example/example",
    branch: "main",
    signal: observation.signal,
    pollMs: neverScheduled,
    sleep,
    armRegistrationWake: registration.armRegistrationWake,
    gh: async () => {
      polls += 1;
      if (polls === 1)
        await new Promise((release) => {
          releaseFirstPoll = release;
          finishFirstPoll();
        });
      return [];
    },
  });
  await firstPollRunning;
  registration.register();
  releaseFirstPoll();
  // The first pause ends at once; the second waits for the next poll time.
  await pausesBegun(2);
  assert.equal(polls, 2);
  assert.equal(pauses[1].signal.aborted, false);
  observation.abort();
  await watching;
  assert.equal(polls, 2);
  assert.deepEqual(
    pauses.map(({ milliseconds }) => milliseconds),
    [neverScheduled, neverScheduled],
  );
});

test("registrations do not shorten the retry after a poll error, and three errors still end observation", async () => {
  const events = [];
  const retries = [];
  let polls = 0;
  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    emit: (event) => events.push(event),
    // Every poll has a registration waiting.
    armRegistrationWake: () => AbortSignal.abort(),
    sleep: async (milliseconds, ...[, { signal }]) => {
      retries.push({ milliseconds, aborted: signal.aborted });
    },
    gh: async () => {
      polls += 1;
      throw new Error(`provider outage ${polls}`);
    },
  });
  assert.equal(polls, 3);
  assert.deepEqual(retries, [
    { milliseconds: 30_000, aborted: false },
    { milliseconds: 30_000, aborted: false },
  ]);
  assert.deepEqual(
    events.map(({ type, reason }) => ({ type, reason })),
    [{ type: "CI_MONITOR_UNAVAILABLE", reason: "provider outage 3" }],
  );
});

test("registrations cannot extend observation past its budget", async () => {
  const events = [];
  let elapsed = 0;
  let polls = 0;
  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    emit: (event) => events.push(event),
    maxDurationMs: 5_000,
    now: () => elapsed,
    pollMs: neverScheduled,
    armRegistrationWake: () => AbortSignal.abort(),
    gh: async () => {
      polls += 1;
      elapsed += 1_000;
      return [];
    },
  });
  assert.equal(polls, 5);
  assert.deepEqual(
    events.map(({ type, reason }) => ({ type, reason })),
    [
      {
        type: "CI_MONITOR_UNAVAILABLE",
        reason: "Execution observation budget expired after 5000 ms.",
      },
    ],
  );
});

test("aborting observation still ends a wakeable pause silently", async () => {
  const observation = new AbortController();
  const { sleep, pausesBegun } = recordedPause();
  const registration = registrations();
  const events = [];
  let polls = 0;
  const watching = watchCiExecution({
    repo: "example/example",
    branch: "main",
    signal: observation.signal,
    emit: (event) => events.push(event),
    pollMs: neverScheduled,
    sleep,
    armRegistrationWake: registration.armRegistrationWake,
    gh: async () => {
      polls += 1;
      return [];
    },
  });
  await pausesBegun(1);
  observation.abort();
  registration.register();
  await watching;
  assert.equal(polls, 1);
  assert.deepEqual(events, []);
});
