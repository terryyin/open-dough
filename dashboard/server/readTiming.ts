// Where one boundary request's time went, for the local authenticated read
// boundary (`./authenticatedRead.ts`), told in its answer's `Server-Timing`
// header and nowhere else: a browser's network record, and so a kept
// Playwright trace, then shows a slow read's share of waiting for a turn at
// GitHub, of `gh` itself, and of everything else. Observation only: nothing
// here decides admission, ordering, or an answer.
//
// - `admission`: this request's waits before each `gh` call it waited on was
//   asked of GitHub (`./readAdmission.ts`'s turns), summed.
// - `gh`: its waits from each call being asked until its answer, summed, with
//   how many calls it waited on, counting one answered while held back and
//   never asked. A request that joins a call already asked counts only its
//   own wait; one answered from this process's memory, or awaiting a read
//   another request began, names no `gh` time of its own.
// - `rest`: the request's time while it waited on no call at all.
// - `total`: from the request's arrival to its answer.
// Calls waited on together are each summed, so the first three can exceed
// `total`; a wait that ended without an answer, at the request's bound, is in
// `total` only. Whole milliseconds by this server's clock, as `askedAt` is.

import { AsyncLocalStorage } from "node:async_hooks";
import type { GhAnswer } from "./ghAnswer.ts";

class ReadTiming {
  private readonly arrivedAtMs = Date.now();
  private admissionMs = 0;
  private ghMs = 0;
  private calls = 0;

  // How many calls the request waits on now, since when at least one, and
  // how long it has waited on at least one so far.
  private waiting = 0;
  private waitingSinceMs = 0;
  private waitedMs = 0;

  // A wait on one call begins, at the time returned.
  waitBegins(): number {
    const nowMs = Date.now();
    if (this.waiting === 0) this.waitingSinceMs = nowMs;
    this.waiting += 1;
    return nowMs;
  }

  // A wait ends, answered or not.
  waitEnds(): void {
    this.waiting -= 1;
    if (this.waiting === 0) this.waitedMs += Date.now() - this.waitingSinceMs;
  }

  // The wait begun at `fromMs` was answered by a call asked of GitHub at
  // `askedAtMs`; a call asked before this request joined it was no wait for
  // a turn, and one never asked was nothing else.
  answered(fromMs: number, askedAtMs: number): void {
    const nowMs = Date.now();
    const askedMs = Math.min(Math.max(askedAtMs, fromMs), nowMs);
    this.admissionMs += askedMs - fromMs;
    this.ghMs += nowMs - askedMs;
    this.calls += 1;
  }

  header(): string {
    const totalMs = Date.now() - this.arrivedAtMs;
    const calls = this.calls === 1 ? "1 call" : `${String(this.calls)} calls`;
    return [
      `admission;dur=${String(this.admissionMs)}`,
      `gh;dur=${String(this.ghMs)};desc="${calls}"`,
      `rest;dur=${String(Math.max(0, totalMs - this.waitedMs))}`,
      `total;dur=${String(totalMs)}`,
    ].join(", ");
  }
}

const timing = new AsyncLocalStorage<ReadTiming>();

// Runs one request's handling, and gives what it came to with the
// `Server-Timing` value for its answer.
export async function withReadTiming<T>(
  run: () => Promise<T>,
): Promise<{ readonly outcome: T; readonly serverTiming: string }> {
  const request = new ReadTiming();
  const outcome = await timing.run(request, run);
  return { outcome, serverTiming: request.header() };
}

// One request's wait for one `gh` answer (`./ghRead.ts`'s `execGh`), counted
// for the request being handled, if any.
export async function timedGhWait(
  wait: () => Promise<GhAnswer>,
): Promise<GhAnswer> {
  const request = timing.getStore();
  if (request === undefined) return wait();
  const fromMs = request.waitBegins();
  try {
    const answer = await wait();
    request.answered(fromMs, Date.parse(answer.askedAt));
    return answer;
  } finally {
    request.waitEnds();
  }
}
