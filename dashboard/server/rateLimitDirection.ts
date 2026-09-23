// When GitHub asked the local `gh` login to wait before asking again, read
// from the headers of a refused answer (`./ghRead.ts`), so the page's
// automatic revision checks (`../src/revisionCheckSchedule.ts`) never ask
// sooner. GitHub directs a wait in one of two ways: `Retry-After` (seconds, or
// an HTTP date), or `X-RateLimit-Reset` (epoch seconds) once
// `X-RateLimit-Remaining` has reached zero.

import { longestDirectedWaitSeconds } from "../src/authenticatedReadPath";

const wholeNumber = /^\d+$/;

function secondsUntil(atMs: number, nowMs: number): number {
  return Math.ceil((atMs - nowMs) / 1000);
}

function askedWait(
  headers: ReadonlyMap<string, string>,
  nowMs: number,
): number | undefined {
  const retryAfter = headers.get("retry-after");
  if (retryAfter !== undefined) {
    if (wholeNumber.test(retryAfter)) {
      return Number(retryAfter);
    }
    const at = Date.parse(retryAfter);
    return Number.isFinite(at) ? secondsUntil(at, nowMs) : undefined;
  }
  const reset = headers.get("x-ratelimit-reset");
  if (
    headers.get("x-ratelimit-remaining") === "0" &&
    reset !== undefined &&
    wholeNumber.test(reset)
  ) {
    return secondsUntil(Number(reset) * 1000, nowMs);
  }
  return undefined;
}

// Whole seconds from `nowMs` until GitHub allows another request, bounded to
// `longestDirectedWaitSeconds`, or undefined when the headers direct nothing
// usable. A time already passed directs no wait at all (zero).
export function directedWaitSeconds(
  headers: ReadonlyMap<string, string>,
  nowMs: number,
): number | undefined {
  const asked = askedWait(headers, nowMs);
  return asked === undefined || !Number.isFinite(asked)
    ? undefined
    : Math.min(Math.max(asked, 0), longestDirectedWaitSeconds);
}
