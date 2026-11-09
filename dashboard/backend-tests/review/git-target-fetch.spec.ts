// Controlled operations model Git's completion separately from a requester's
// departure: aborting a waiter must not release a still-running ref mutation.
import { GitTargetFetches } from "../../server/gitTargetFetch.ts";
import { expect, test } from "../../tests/support/pageTest.ts";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test("concurrent readers of one Git target share the fetch independently of caller cancellation", async () => {
  const fetches = new GitTargetFetches();
  const first = new AbortController();
  const second = new AbortController();
  const exited = deferred();
  let calls = 0;
  let child: AbortSignal | undefined;
  const start = async (signal: AbortSignal) => {
    calls += 1;
    child = signal;
    await exited.promise;
  };
  const left = fetches.fetch(
    "common.git",
    "origin",
    "main",
    first.signal,
    start,
  );
  const waiting = fetches.fetch(
    "common.git",
    "origin",
    "main",
    second.signal,
    start,
  );
  expect(calls).toBe(1);
  const reason = new Error("Review closed");
  const departed = expect(left).rejects.toBe(reason);
  first.abort(reason);
  await departed;
  expect(child?.aborted).toBe(false);
  exited.resolve();
  await waiting;
  await fetches.fetch("common.git", "origin", "main", second.signal, start);
  expect(calls).toBe(2);
});

test("a new target fetch waits for the aborted Git process to actually settle", async () => {
  const fetches = new GitTargetFetches();
  const first = new AbortController();
  const next = new AbortController();
  const exited = deferred();
  const secondStarted = deferred();
  const mutations: string[] = [];
  let child: AbortSignal | undefined;
  const leaving = fetches.fetch(
    "common.git",
    "origin",
    "main",
    first.signal,
    async (signal) => {
      mutations.push("first started");
      child = signal;
      await exited.promise;
      mutations.push("first exited");
      signal.throwIfAborted();
    },
  );
  const reason = new Error("No readers remain");
  const departed = expect(leaving).rejects.toBe(reason);
  first.abort(reason);
  await departed;
  expect(child?.aborted).toBe(true);
  const waiting = fetches.fetch(
    "common.git",
    "origin",
    "other",
    next.signal,
    () => {
      mutations.push("second started");
      secondStarted.resolve();
      return Promise.resolve();
    },
  );
  expect(mutations).toEqual(["first started"]);
  exited.resolve();
  await secondStarted.promise;
  await waiting;
  expect(mutations).toEqual([
    "first started",
    "first exited",
    "second started",
  ]);
});

test("a failed Git fetch does not keep a failed answer or block a different repository", async () => {
  const fetches = new GitTargetFetches();
  const waiter = new AbortController();
  const exited = deferred();
  const failure = new Error("Remote unavailable");
  const failed = fetches.fetch(
    "first.git",
    "origin",
    "main",
    waiter.signal,
    async () => {
      await exited.promise;
      throw failure;
    },
  );
  const rejected = expect(failed).rejects.toBe(failure);
  let otherRead = false;
  await fetches.fetch("second.git", "origin", "main", waiter.signal, () => {
    otherRead = true;
    return Promise.resolve();
  });
  expect(otherRead).toBe(true);
  exited.resolve();
  await rejected;
  let retried = false;
  await fetches.fetch("first.git", "origin", "main", waiter.signal, () => {
    retried = true;
    return Promise.resolve();
  });
  expect(retried).toBe(true);
});
