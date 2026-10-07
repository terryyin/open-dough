// The page's project-local backoff for an eligible transient failure of its
// empty-page membership read or of detail on a shown snapshot: waits after
// settlement of 15, 30, 60, then 60 seconds before the observation reads the
// ref afresh again (`./limitRecovery.ts`). Distinct from the login-wide
// rate-limit record (`./readingLimit.ts`): a standing GitHub wait takes
// precedence and is never shortened. Hiding cancels the pending recovery ask
// and this page's wait without clearing the due time or step; revealing asks
// once when due. An unrelated success, unchanged check, or visibility toggle
// does not reset this unresolved failure's step; only healing every eligible
// unanswered question, or leaving the project, clears it.

import { useEffect, useState, useSyncExternalStore } from "react";

// Whole seconds after settlement before the next recovery attempt, by how
// many eligible failures this observation has settled.
const waitAfterSettlementSeconds = [15, 30, 60] as const;

let recoversUntil = 0;
let failureCount = 0;
let pending = false;
const listeners = new Set<() => void>();

function changed(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// An eligible failure settled (empty page or unanswered detail): schedule
// the next recovery after the wait for this step, advancing through
// 15 → 30 → 60 and staying at 60.
export function noteTransientFailure(): void {
  const step = Math.min(failureCount, waitAfterSettlementSeconds.length - 1);
  const waitSeconds = waitAfterSettlementSeconds[step] ?? 60;
  failureCount += 1;
  pending = true;
  recoversUntil = Date.now() + waitSeconds * 1000;
  changed();
}

// Every eligible unanswered question healed, or the observed project was
// left: the unresolved failure and its backoff are over.
export function clearTransientFailure(): void {
  if (!pending && failureCount === 0 && recoversUntil === 0) {
    return;
  }
  pending = false;
  failureCount = 0;
  recoversUntil = 0;
  changed();
}

function useRecoversUntil(): number {
  return useSyncExternalStore(subscribe, () => recoversUntil);
}

// Whether an unresolved transient recovery still stands, re-rendered when
// it is noted or cleared.
export function useTransientRecoveryPending(): boolean {
  return useSyncExternalStore(subscribe, () => pending);
}

// When the standing transient recovery is due, re-rendered when it becomes
// due; undefined when none stands. The due Instant is kept while pending —
// even after it has passed — so a hidden page still names when it reads, or
// when it is next seen.
export function useStandingTransientRecovery(): Date | undefined {
  const until = useRecoversUntil();
  const pendingNow = useTransientRecoveryPending();
  const [, setEnded] = useState(0);
  useEffect(() => {
    if (!pendingNow) return;
    const left = until - Date.now();
    if (left <= 0) {
      setEnded((ended) => ended + 1);
      return;
    }
    const ending = setTimeout(() => {
      setEnded((ended) => ended + 1);
    }, left);
    return () => {
      clearTimeout(ending);
    };
  }, [until, pendingNow]);
  return pendingNow && until > 0 ? new Date(until) : undefined;
}
