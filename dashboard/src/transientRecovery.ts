// The page's project-local backoff for eligible transient failures. Each
// contributor tracks its own unanswered reads, sharing waits of 15, 30, 60,
// then 60 seconds after settlement. A standing GitHub wait takes precedence
// (`./readingLimit.ts`), and a hidden page waits until it is seen again.
// The backoff ends when every contributor has an answer or the project is left.

import { useEffect, useSyncExternalStore } from "react";
import type { Visibility } from "./pageVisibility.ts";

const waitAfterSettlementSeconds = [15, 30, 60] as const;

export type TransientRecoveryContributor = "published-observation" | "intent";

let recoversUntil = 0;
let failureCount = 0;
const pending = new Set<TransientRecoveryContributor>();
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

// Failures settling during the same wait share its due time and step.
export function noteTransientFailure(
  contributor: TransientRecoveryContributor,
): void {
  const alreadyPending = pending.has(contributor);
  pending.add(contributor);
  const now = Date.now();
  if (now >= recoversUntil) {
    const step = Math.min(failureCount, waitAfterSettlementSeconds.length - 1);
    const waitSeconds = waitAfterSettlementSeconds[step] ?? 60;
    failureCount += 1;
    recoversUntil = now + waitSeconds * 1000;
  } else if (alreadyPending) {
    return;
  }
  changed();
}

export function clearTransientFailure(
  contributor: TransientRecoveryContributor,
): void {
  if (!pending.delete(contributor)) return;
  if (pending.size === 0) {
    clearAllTransientFailures();
  } else {
    changed();
  }
}

export function clearAllTransientFailures(): void {
  pending.clear();
  failureCount = 0;
  recoversUntil = 0;
  changed();
}

export function useTransientRecoveryPending(
  contributor: TransientRecoveryContributor,
): boolean {
  return useSyncExternalStore(subscribe, () => pending.has(contributor));
}

// Mounted once by the published observation. The shared timer wakes all
// contributors. Keep the due time while pending, including after it passes.
export function useStandingTransientRecovery(): Date | undefined {
  const until = useSyncExternalStore(subscribe, () => recoversUntil);
  useEffect(() => {
    if (until === 0) return;
    const left = until - Date.now();
    if (left <= 0) {
      changed();
      return;
    }
    const ending = setTimeout(changed, left);
    return () => {
      clearTimeout(ending);
    };
  }, [until]);
  return until > 0 ? new Date(until) : undefined;
}

export function transientRecoveryIsDue(
  contributor: TransientRecoveryContributor,
): boolean {
  return pending.has(contributor) && Date.now() >= recoversUntil;
}

export function useTransientRecoveryDue(
  contributor: TransientRecoveryContributor,
  visibility: Visibility,
  limitStands: boolean,
): boolean {
  const due = useSyncExternalStore(subscribe, () =>
    transientRecoveryIsDue(contributor),
  );
  return due && visibility !== "hidden" && !limitStands;
}
