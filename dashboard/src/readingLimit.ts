// The page's one record of GitHub's rate limit on the local `gh` login: the
// page-clock time before which this page asks the local read boundary
// nothing. `./authenticatedGet.ts` sets it where the boundary answers a read
// as limited (`retryAfterSeconds`), and while it stands answers every read as
// limited itself, without asking. A further limited answer only moves it
// later; nothing but its time ends it, and it outlives the observed project,
// since the limit is the login's, not a project's. The revision check
// schedule (`./revisionCheckSchedule.ts`) and the page's notice
// (`./PublishedReadStatus.tsx`) read it.

import { useEffect, useState, useSyncExternalStore } from "react";

// The page-clock time the limit ends; zero until a limit is met. Kept after
// it passes, so a check scheduled for that time is not rescheduled when it
// does.
let limitedUntil = 0;
// How many limited answers and refusals this page has met: a read can tell
// whether the limit withheld any of its detail.
let limitsMet = 0;
const listeners = new Set<() => void>();

function changed(): void {
  for (const listener of listeners) listener();
}

// The boundary answered a read as limited for `retryAfterSeconds` more:
// the record stands until then, unless it already stands longer.
export function noteLimit(retryAfterSeconds: number): void {
  limitsMet += 1;
  const until = Date.now() + retryAfterSeconds * 1000;
  if (until > limitedUntil) {
    limitedUntil = until;
    changed();
  }
}

// When the standing limit ends, or undefined when none stands. A read asked
// now is answered as limited without asking (and counted as withheld).
export function standingLimit(): Date | undefined {
  return Date.now() < limitedUntil ? new Date(limitedUntil) : undefined;
}

// Counts a read the standing limit withheld without asking.
export function noteWithheld(): void {
  limitsMet += 1;
}

// Whether the limit has met any read since this was asked.
export function limitsMetSince(): () => boolean {
  const before = limitsMet;
  return () => limitsMet > before;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// The page-clock time the latest limit ends, kept once it has passed; zero
// when none was met.
export function useLimitedUntil(): number {
  return useSyncExternalStore(subscribe, () => limitedUntil);
}

// When the standing limit ends, re-rendered when it does; undefined when none
// stands.
export function useStandingLimit(): Date | undefined {
  const until = useLimitedUntil();
  const [, setEnded] = useState(0);
  useEffect(() => {
    const left = until - Date.now();
    if (left <= 0) return;
    const ending = setTimeout(() => {
      setEnded((ended) => ended + 1);
    }, left);
    return () => {
      clearTimeout(ending);
    };
  }, [until]);
  return Date.now() < until ? new Date(until) : undefined;
}
