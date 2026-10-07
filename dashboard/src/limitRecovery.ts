// How the published observation (`./publishedObservation.ts`) recovers what
// a settled read left unanswered of its latest attempt: GitHub's rate limit
// (`./readingLimit.ts`) withheld of a settled read (`./snapshotRetrieval.ts`),
// or an eligible transient failure of the empty page or of detail on a shown
// snapshot (`./transientRecovery.ts`, `./observationOutcomes.ts`). Once
// recovery is due on a visible page, it reads the ref afresh -- the project
// when nothing is shown, or again beside the shown snapshot. A standing
// GitHub wait takes precedence over a shorter transient backoff and is never
// shortened. A hidden page waits until it is seen again; hiding cancels that
// page's pending recovery timer and outstanding recovery wait without ending
// a shared upstream read, and retains the due time and step so reveal asks
// once when due. Until then no revision check, launch-reconciliation fresh
// read, or visibility toggle resets or bypasses the wait. One schedule owns
// both recoveries; there is no second timer beside it.

import { useEffect } from "react";
import type { ObservationOutcomes } from "./observationOutcomes.ts";
import type { Visibility } from "./pageVisibility.ts";
import { useStandingLimit } from "./readingLimit.ts";
import {
  clearTransientFailure,
  noteTransientFailure,
  useStandingTransientRecovery,
  useTransientRecoveryPending,
} from "./transientRecovery.ts";

export { clearTransientFailure };

// After a settled read: schedule project-local recovery when any question is
// still eligible and unanswered; clear the backoff when none remain.
export function recordSettledOutcomes(outcomes: ObservationOutcomes): void {
  if (outcomes.hasEligibleUnanswered()) {
    noteTransientFailure();
  } else {
    clearTransientFailure();
  }
}

// Asks `readAfresh` once recovery is due, says whether revision checks may
// be scheduled, when the visible page next reads on its own, and whether an
// outstanding recovery or standing limit blocks other fresh reads.
export function useLimitRecovery({
  withheld,
  readSettled,
  visibility,
  readAfresh,
}: {
  readonly withheld: boolean;
  readonly readSettled: boolean;
  readonly visibility: Visibility;
  readonly readAfresh: () => void;
}): {
  readonly checksMayRun: boolean;
  readonly recoversAt: Date | undefined;
  readonly blocksFreshRead: boolean;
} {
  const standingLimit = useStandingLimit();
  const limitStands = standingLimit !== undefined;
  const transientUntil = useStandingTransientRecovery();
  const transientPending = useTransientRecoveryPending();
  const limitRecoveryDue =
    withheld && readSettled && !limitStands && visibility !== "hidden";
  const transientDue =
    transientPending &&
    transientUntil !== undefined &&
    Date.now() >= transientUntil.getTime();
  const transientRecoveryDue =
    transientDue && readSettled && !limitStands && visibility !== "hidden";
  useEffect(() => {
    if (limitRecoveryDue || transientRecoveryDue) readAfresh();
  }, [limitRecoveryDue, transientRecoveryDue]);
  return {
    // Settled reads exclude checks while withheld or while transient
    // recovery is still unresolved (empty page or unanswered detail).
    checksMayRun: readSettled && !withheld && !transientPending,
    recoversAt: standingLimit ?? transientUntil,
    // Launch reconciliation must not bypass an outstanding recovery wait or
    // the login-wide standing limit; due recovery asks through `readAfresh`
    // above, not this gate.
    blocksFreshRead: withheld || transientPending || limitStands,
  };
}
