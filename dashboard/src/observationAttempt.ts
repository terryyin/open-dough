// What is known about the published observation's latest attempt, apart from
// the snapshot it shows (`./publishedObservation.ts`): whether a read is under
// way, read, or failed. The wait GitHub's rate limit directs is the page's,
// not an attempt's (`./readingLimit.ts`).
//
// A failed attempt usually added nothing to the shown snapshot. One that
// failed after reading a new revision's membership -- detail still unread when
// the read's wait bound ended it -- is what the shown snapshot comes from, so
// its failure stands until a later read replaces that snapshot: a check that
// finds the ref unchanged never turns it into a settled read.

import { useCallback, useRef, useState } from "react";
import { ReadProblem } from "./readProblem.ts";

export type FailedAttempt = {
  readonly status: "failed";
  readonly problem: string;
  readonly at: Date;
  // Whether this attempt read the membership now shown before it failed.
  readonly afterMembership: boolean;
};

// Reading and failure describe the latest attempt, never the published work:
// they add no state to any work entry, and they leave the last successfully
// read snapshot as it was.
type Attempt =
  { readonly status: "reading" } | { readonly status: "read" } | FailedAttempt;

type Attempts = {
  readonly latest: Attempt;
  // The failure the shown snapshot was read by, while that snapshot stays.
  readonly standing: FailedAttempt | undefined;
};

// A failed read or revision check, said without touching the snapshot.
function failedAttempt(
  error: unknown,
  afterMembership: boolean,
): FailedAttempt {
  return {
    status: "failed",
    problem:
      error instanceof ReadProblem
        ? error.message
        : "An unexpected problem stopped the read.",
    at: new Date(),
    afterMembership,
  };
}

const reading: Attempts = {
  latest: { status: "reading" },
  standing: undefined,
};

export function useObservationAttempt() {
  const [attempts, setAttempts] = useState<Attempts>(reading);
  // Latest attempt replaced by `startReading`, restored when a recovery wait
  // is released on hide without settling a new failure.
  const replacedAttempt = useRef<Attempt | undefined>(undefined);

  // A read is asked; what is shown stays until it lands.
  const startReading = () => {
    setAttempts((last) => {
      replacedAttempt.current = last.latest;
      return { ...last, latest: { status: "reading" } };
    });
  };

  // Hiding cancelled an in-flight recovery: restore what reading replaced,
  // without recording a new failure or advancing backoff.
  const cancelReading = useCallback(() => {
    setAttempts((last) => {
      if (last.latest.status !== "reading") {
        return last;
      }
      const prior = replacedAttempt.current;
      replacedAttempt.current = undefined;
      return {
        ...last,
        latest:
          prior !== undefined && prior.status !== "reading"
            ? prior
            : (last.standing ?? { status: "read" }),
      };
    });
  }, []);

  // A newly read membership replaces the shown snapshot, and with it any
  // failure the replaced snapshot was read by.
  const acceptMembership = () => {
    replacedAttempt.current = undefined;
    setAttempts({ latest: { status: "read" }, standing: undefined });
  };

  // Records a failed read or check. A read that already replaced the shown
  // membership leaves its failure standing.
  const fail = (error: unknown, afterMembership = false) => {
    const failed = failedAttempt(error, afterMembership);
    replacedAttempt.current = undefined;
    setAttempts((last) => ({
      latest: failed,
      standing: afterMembership ? failed : last.standing,
    }));
  };

  // A check found the ref still naming the shown revision: GitHub answered,
  // so a failed check is over, but a failure the shown snapshot was read by
  // stands.
  const findUnchanged = () => {
    setAttempts((last) =>
      last.latest.status === "failed"
        ? { ...last, latest: last.standing ?? { status: "read" } }
        : last,
    );
  };

  // Another project is observed: nothing known of this one's attempts
  // carries over.
  const restart = () => {
    replacedAttempt.current = undefined;
    setAttempts(reading);
  };

  return {
    attempt: attempts.latest,
    startReading,
    cancelReading,
    acceptMembership,
    fail,
    findUnchanged,
    restart,
  };
}
