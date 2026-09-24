// What is known about the published observation's latest attempt, apart from
// the snapshot it shows (`./publishedObservation.ts`): whether a read is under
// way, read, or failed, and the wait GitHub's rate limit directed before the
// next automatic check.
//
// A failed attempt usually added nothing to the shown snapshot. One that
// failed after reading a new revision's membership -- detail still unread when
// the read's wait bound ended it -- is what the shown snapshot comes from, so
// its failure stands until a later read replaces that snapshot: a check that
// finds the ref unchanged never turns it into a settled read.

import { useState } from "react";
import { ReadProblem } from "./readProblem";

type FailedAttempt = {
  readonly status: "failed";
  readonly problem: string;
  readonly at: Date;
  // When GitHub asked the local `gh` login to wait, the time before which
  // no automatic check is asked.
  readonly checksResumeAt: Date | undefined;
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

// A failed read or revision check, said without touching the snapshot, with
// the time GitHub's rate limit, if it directed one, lets checks resume.
function failedAttempt(
  error: unknown,
  afterMembership: boolean,
): FailedAttempt {
  const at = new Date();
  const known = error instanceof ReadProblem ? error : undefined;
  const wait = known?.retryAfterSeconds;
  return {
    status: "failed",
    problem: known?.message ?? "An unexpected problem stopped the read.",
    at,
    checksResumeAt:
      wait === undefined ? undefined : new Date(at.getTime() + wait * 1000),
    afterMembership,
  };
}

const reading: Attempts = {
  latest: { status: "reading" },
  standing: undefined,
};

export function useObservationAttempt() {
  const [attempts, setAttempts] = useState<Attempts>(reading);
  // The page-clock time before which no check may be asked, because GitHub's
  // rate limit said so; zero when nothing directs a wait. A successful read
  // or check lifts it, since GitHub has answered again.
  const [checksResumeAt, setChecksResumeAt] = useState(0);

  // A read is asked; what is shown stays until it lands.
  const startReading = () => {
    setAttempts((last) => ({ ...last, latest: { status: "reading" } }));
  };

  // A newly read membership replaces the shown snapshot, and with it any
  // failure the replaced snapshot was read by.
  const acceptMembership = () => {
    setChecksResumeAt(0);
    setAttempts({ latest: { status: "read" }, standing: undefined });
  };

  // Records a failed read or check, and any wait it directs. A read that
  // already replaced the shown membership leaves its failure standing.
  const fail = (error: unknown, afterMembership = false) => {
    const failed = failedAttempt(error, afterMembership);
    setAttempts((last) => ({
      latest: failed,
      standing: afterMembership ? failed : last.standing,
    }));
    if (failed.checksResumeAt !== undefined) {
      setChecksResumeAt(failed.checksResumeAt.getTime());
    }
  };

  // A check found the ref still naming the shown revision: GitHub answered,
  // so a failed check is over, but a failure the shown snapshot was read by
  // stands.
  const findUnchanged = () => {
    setChecksResumeAt(0);
    setAttempts((last) =>
      last.latest.status === "failed"
        ? { ...last, latest: last.standing ?? { status: "read" } }
        : last,
    );
  };

  // Another project is observed: nothing known of this one's attempts
  // carries over.
  const restart = () => {
    setAttempts(reading);
  };

  // A failed attempt says when checks resume from the same wait the schedule
  // obeys, so a later failure that directs none (a manual Retry refused for
  // another reason) still reports the wait GitHub asked for.
  const { latest } = attempts;
  const attempt: Attempt =
    latest.status === "failed"
      ? {
          ...latest,
          checksResumeAt:
            checksResumeAt > latest.at.getTime()
              ? new Date(checksResumeAt)
              : undefined,
        }
      : latest;

  return {
    attempt,
    checksResumeAt,
    startReading,
    acceptMembership,
    fail,
    findUnchanged,
    restart,
  };
}
