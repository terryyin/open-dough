// The selected project's observation, apart from how the page presents it:
// which project is observed, its last snapshot, the latest attempt (kept by
// `./observationAttempt.ts`), and focus kept across a snapshot's replacement.
// Reads happen on opening, on Refresh or Retry, on selecting a project, and
// when a scheduled revision check (`./revisionCheckSchedule.ts`) finds the
// selected ref naming another commit.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePageVisibility } from "./pageVisibility";
import { defaultSource, type PublishedSource } from "./publishedSource";
import { readPublishedWork, type PublishedWork } from "./publishedWork";
import { useObservationAttempt } from "./observationAttempt";
import { useRevisionCheckSchedule } from "./revisionCheckSchedule";
import {
  focusedWork,
  restoreSnapshotFocus,
  type FocusedWork,
} from "./workFocus";

type Retrieval = {
  // The last snapshot read, whole or with its unread detail labeled; a later
  // read replaces it whole.
  readonly work: PublishedWork | undefined;
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

export function usePublishedObservation() {
  // The project this dashboard is currently observing. Selecting another
  // project replaces this whole, never merges into what is already shown.
  const [source, setSource] = useState<PublishedSource>(defaultSource);
  const [retrieval, setRetrieval] = useState<Retrieval>({
    work: undefined,
    notice: "",
  });
  const {
    attempt,
    checksResumeAt,
    startReading,
    acceptMembership,
    fail,
    findUnchanged,
    restart,
  } = useObservationAttempt();
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
        acceptMembership();
        const held = focusedWork();
        heldFocus.current = held;
        setRetrieval({
          work: partial,
          notice:
            held && !lists(partial, held.identity)
              ? `${held.title} is no longer listed in the published work.`
              : "",
        });
        return;
      }
      setRetrieval((last) => ({ ...last, work: partial }));
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
          fail(error, acceptedMembership);
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
    startReading();
    setRetrieval((last) => ({ ...last, notice: "" }));
    setReadSettled(false);
    setReadRequest((last) => ({ asked: last.asked + 1, revision }));
  };

  const { work, notice } = retrieval;
  const shownRevision = work?.revision;

  useRevisionCheckSchedule({
    source,
    shownRevision,
    readSettled,
    visibility,
    checksResumeAt,
    onChanged: askRead,
    onUnchanged: () => {
      findUnchanged();
      settleRevealed();
    },
    onFailed: (error) => {
      fail(error);
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
    restart();
    setRetrieval({ work: undefined, notice: "" });
  };

  return {
    source,
    work,
    attempt,
    notice,
    reading,
    refresh,
    selectSource,
  };
}
