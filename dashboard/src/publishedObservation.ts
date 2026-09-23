// The selected project's observation, apart from how the page presents it:
// which project is observed, its last snapshot, the latest attempt, and
// focus kept across a snapshot's replacement. Reads happen on opening, on
// Refresh or Retry, on selecting a project, and when a scheduled revision
// check (`./revisionCheckSchedule.ts`) finds the selected ref naming another
// commit.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePageVisibility } from "./pageVisibility";
import { defaultSource, type PublishedSource } from "./publishedSource";
import { readPublishedWork, type PublishedWork } from "./publishedWork";
import { ReadProblem } from "./readProblem";
import { useRevisionCheckSchedule } from "./revisionCheckSchedule";
import {
  focusedWork,
  restoreSnapshotFocus,
  type FocusedWork,
} from "./workFocus";

// What is known about the observation itself. Reading and failure describe
// the latest attempt, never the published work: they add no state to any work
// entry, and they leave the last successfully read snapshot as it was.
type Attempt =
  | { readonly status: "reading" }
  | { readonly status: "read" }
  | {
      readonly status: "failed";
      readonly problem: string;
      readonly at: Date;
      // When GitHub asked the local `gh` login to wait, the time before which
      // no automatic check is asked.
      readonly checksResumeAt: Date | undefined;
    };

type Retrieval = {
  // The last snapshot read successfully; a later read replaces it whole.
  readonly work: PublishedWork | undefined;
  readonly attempt: Attempt;
  // Said once when a new snapshot no longer lists the work that held focus.
  readonly notice: string;
};

function lists(work: PublishedWork, identity: string): boolean {
  return [...work.taken, ...work.backlog].some(
    (entry) => entry.identity === identity,
  );
}

// A read of the selected project: of its ref afresh, or of a revision a check
// already found the ref naming.
type ReadRequest = {
  readonly asked: number;
  readonly revision: string | undefined;
};

// A failed read or revision check, said without touching the snapshot, with
// the time GitHub's rate limit, if it directed one, lets checks resume.
function failedAttempt(error: unknown): Attempt & { status: "failed" } {
  const at = new Date();
  const known = error instanceof ReadProblem ? error : undefined;
  const wait = known?.retryAfterSeconds;
  return {
    status: "failed",
    problem: known?.message ?? "An unexpected problem stopped the read.",
    at,
    checksResumeAt:
      wait === undefined ? undefined : new Date(at.getTime() + wait * 1000),
  };
}

export function usePublishedObservation() {
  // The project this dashboard is currently observing. Selecting another
  // project replaces this whole, never merges into what is already shown.
  const [source, setSource] = useState<PublishedSource>(defaultSource);
  const [retrieval, setRetrieval] = useState<Retrieval>({
    work: undefined,
    attempt: { status: "reading" },
    notice: "",
  });
  // Opening the page asks for the first read; Refresh, named Retry after a
  // failed attempt, asks for another. Selecting a different project also
  // starts a fresh read, through the `source` dependency below. Otherwise a
  // read is asked only when a revision check finds the ref naming another
  // commit, and it reads exactly that commit.
  const [readRequest, setReadRequest] = useState<ReadRequest>({
    asked: 1,
    revision: undefined,
  });
  // Whether the latest read, detail included, has finished.
  const [readSettled, setReadSettled] = useState(false);
  // The page-clock time before which no check may be asked, because GitHub's
  // rate limit said so; zero when nothing directs a wait. A successful read
  // or check lifts it, since GitHub has answered again.
  const [checksResumeAt, setChecksResumeAt] = useState(0);
  // Records a failed attempt, keeping the snapshot, and any wait it directs.
  const noteFailure = (error: unknown) => {
    const failed = failedAttempt(error);
    setRetrieval((last) => ({ ...last, attempt: failed }));
    if (failed.checksResumeAt !== undefined) {
      setChecksResumeAt(failed.checksResumeAt.getTime());
    }
  };
  const { visibility, settleRevealed } = usePageVisibility();
  const heldFocus = useRef<FocusedWork | undefined>(undefined);
  const deferredFocus = useRef<FocusedWork | undefined>(undefined);
  useEffect(() => {
    const reading = new AbortController();
    let acceptedMembership = false;
    const acceptProgress = (partial: PublishedWork) => {
      if (reading.signal.aborted) {
        return;
      }
      if (!acceptedMembership) {
        acceptedMembership = true;
        setChecksResumeAt(0);
        const held = focusedWork();
        heldFocus.current = held;
        setRetrieval({
          work: partial,
          attempt: { status: "read" },
          notice:
            held && !lists(partial, held.identity)
              ? `${held.title} is no longer listed in the published work.`
              : "",
        });
        return;
      }
      setRetrieval((last) => ({
        ...last,
        work: partial,
        attempt: { status: "read" },
      }));
    };
    readPublishedWork(
      source,
      reading.signal,
      acceptProgress,
      readRequest.revision,
    ).then(
      (read) => {
        acceptProgress(read);
        if (!reading.signal.aborted) {
          setReadSettled(true);
          settleRevealed();
        }
      },
      (error: unknown) => {
        if (!reading.signal.aborted) {
          noteFailure(error);
          setReadSettled(true);
          settleRevealed();
        }
      },
    );
    return () => {
      reading.abort();
    };
  }, [readRequest, source]);

  // Asks for a read of the selected project: of its ref afresh, or of the
  // revision a check found it naming. What is shown stays until it lands.
  const askRead = (revision: string | undefined) => {
    setRetrieval((last) => ({
      ...last,
      attempt: { status: "reading" },
      notice: "",
    }));
    setReadSettled(false);
    setReadRequest((last) => ({ asked: last.asked + 1, revision }));
  };

  const { work, attempt, notice } = retrieval;
  const shownRevision = work?.revision;

  useRevisionCheckSchedule({
    source,
    shownRevision,
    readSettled,
    visibility,
    checksResumeAt,
    onChanged: askRead,
    onUnchanged: () => {
      setChecksResumeAt(0);
      setRetrieval((last) =>
        last.attempt.status === "failed"
          ? { ...last, attempt: { status: "read" } }
          : last,
      );
      settleRevealed();
    },
    onFailed: (error) => {
      noteFailure(error);
      settleRevealed();
    },
  });

  useLayoutEffect(() => {
    deferredFocus.current = restoreSnapshotFocus(
      heldFocus.current,
      deferredFocus.current,
      work,
    );
    heldFocus.current = undefined;
  }, [work]);

  const reading = attempt.status === "reading";
  const refresh = () => {
    if (!reading) {
      askRead(undefined);
    }
  };

  // Selecting a project replaces the observation whole: the previous
  // project's snapshot, failure, and held focus are cleared rather than kept
  // under the new label, and a fresh read starts through the `source`
  // dependency above. Work identities are meaningful within one project and
  // never carry focus into another.
  const selectSource = (next: PublishedSource) => {
    if (next.id === source.id) {
      return;
    }
    heldFocus.current = undefined;
    deferredFocus.current = undefined;
    setSource(next);
    // A revision found for the previous project names nothing here.
    askRead(undefined);
    setRetrieval({
      work: undefined,
      attempt: { status: "reading" },
      notice: "",
    });
  };

  // A failed attempt says when checks resume from the same wait the schedule
  // obeys, so a later failure that directs none (a manual Retry refused for
  // another reason) still reports the wait GitHub asked for.
  const shownAttempt: Attempt =
    attempt.status === "failed"
      ? {
          ...attempt,
          checksResumeAt:
            checksResumeAt > attempt.at.getTime()
              ? new Date(checksResumeAt)
              : undefined,
        }
      : attempt;

  return {
    source,
    work,
    attempt: shownAttempt,
    notice,
    reading,
    refresh,
    selectSource,
  };
}
