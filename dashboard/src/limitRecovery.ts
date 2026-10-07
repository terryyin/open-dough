// How the published observation (`./publishedObservation.ts`) recovers what
// a settled read left unanswered of its latest attempt: GitHub's rate limit
// (`./readingLimit.ts`) withheld of a settled read (`./snapshotRetrieval.ts`),
// or an eligible transient failure of an empty page
// (`./transientRecovery.ts`). Once recovery is due on a visible page, it
// reads the ref afresh -- the project when nothing is shown, or again beside
// the shown snapshot. A standing GitHub wait takes precedence over a shorter
// transient backoff and is never shortened. A hidden page waits until it is
// seen again. Until then no revision check is asked in its place. One
// schedule owns both recoveries; there is no second timer beside it.

import { useEffect } from "react";
import type { Visibility } from "./pageVisibility.ts";
import { ReadProblem } from "./readProblem.ts";
import { useStandingLimit } from "./readingLimit.ts";
import {
  clearTransientFailure,
  noteTransientFailure,
  useStandingTransientRecovery,
  useTransientRecoveryPending,
} from "./transientRecovery.ts";

export { clearTransientFailure };

// Records a settled empty-page failure when it is eligible for transient
// recovery. Access, malformed-data, and unknown failures are left alone.
export function recordSettledFailure(error: unknown, emptyPage: boolean): void {
  if (
    emptyPage &&
    error instanceof ReadProblem &&
    error.recovery === "transient"
  ) {
    noteTransientFailure();
  }
}

// Asks `readAfresh` once recovery is due, says whether revision checks may
// be scheduled, and when the visible page next reads on its own.
export function useLimitRecovery({
  withheld,
  readSettled,
  visibility,
  emptyPage,
  readAfresh,
}: {
  readonly withheld: boolean;
  readonly readSettled: boolean;
  readonly visibility: Visibility;
  readonly emptyPage: boolean;
  readonly readAfresh: () => void;
}): {
  readonly checksMayRun: boolean;
  readonly recoversAt: Date | undefined;
} {
  const standingLimit = useStandingLimit();
  const limitStands = standingLimit !== undefined;
  const transientUntil = useStandingTransientRecovery();
  const transientPending = useTransientRecoveryPending();
  const limitRecoveryDue =
    withheld && readSettled && !limitStands && visibility !== "hidden";
  const transientRecoveryDue =
    emptyPage &&
    transientPending &&
    transientUntil === undefined &&
    readSettled &&
    !limitStands &&
    visibility !== "hidden";
  useEffect(() => {
    if (limitRecoveryDue || transientRecoveryDue) readAfresh();
  }, [limitRecoveryDue, transientRecoveryDue]);
  return {
    // Settled reads exclude checks while withheld or while an empty page's
    // transient recovery is still unresolved.
    checksMayRun: readSettled && !withheld && !(emptyPage && transientPending),
    recoversAt:
      standingLimit ??
      (emptyPage && transientPending ? transientUntil : undefined),
  };
}
