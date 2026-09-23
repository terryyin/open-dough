// The selected project's observation, apart from how the page presents it:
// which project is observed, its last snapshot, the latest attempt, and
// focus kept across a snapshot's replacement. Reads happen on opening, on
// Refresh or Retry, on selecting a project, and when a scheduled revision
// check finds the selected ref naming another commit. Checks are scheduled
// only while the page is visible.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { checkPublishedRevision } from "./authenticatedRead";
import { usePageVisibility } from "./pageVisibility";
import { defaultSource, type PublishedSource } from "./publishedSource";
import { readPublishedWork, type PublishedWork } from "./publishedWork";
import { ReadProblem } from "./readProblem";
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
  | { readonly status: "failed"; readonly problem: string; readonly at: Date };

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

// How long a shown snapshot waits before asking whether the selected
// project's `main` still names its revision: often enough that newly
// published work appears within 30 seconds, including the read itself.
const checkIntervalMs = 15_000;

// A read of the selected project: of its ref afresh, or of a revision a check
// already found the ref naming.
type ReadRequest = {
  readonly asked: number;
  readonly revision: string | undefined;
};

// A failed read or revision check, said without touching the snapshot.
function failedAttempt(error: unknown): Attempt {
  return {
    status: "failed",
    problem:
      error instanceof ReadProblem
        ? error.message
        : "An unexpected problem stopped the read.",
    at: new Date(),
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
  // Whether the latest read, detail included, has finished. Checks wait for
  // it, so a check and a read never overlap.
  const [readSettled, setReadSettled] = useState(false);
  // Each settled check that asked for no read schedules the next one.
  const [checksSettled, setChecksSettled] = useState(0);
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
          setRetrieval((last) => ({ ...last, attempt: failedAttempt(error) }));
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

  // While a snapshot is shown, the page is visible, and no read is under
  // way, ask at a steady pace whether the selected project's ref still names
  // its revision; a page seen again asks once at once. An unchanged answer
  // leaves the snapshot, its retrieval time, and its detail exactly as they
  // are; a changed one reads the newly named commit. Any new read, a project
  // switch, or hiding the page cancels a pending or outstanding check, and
  // its late answer is ignored.
  useEffect(() => {
    if (
      !readSettled ||
      shownRevision === undefined ||
      visibility === "hidden"
    ) {
      return;
    }
    const checking = new AbortController();
    const waiting = setTimeout(
      () => {
        checkPublishedRevision(source, shownRevision, checking.signal).then(
          (check) => {
            if (checking.signal.aborted) {
              return;
            }
            if (check.changed) {
              askRead(check.revision);
              return;
            }
            // The shown snapshot is still what the ref names.
            setRetrieval((last) =>
              last.attempt.status === "failed"
                ? { ...last, attempt: { status: "read" } }
                : last,
            );
            setChecksSettled((settled) => settled + 1);
            settleRevealed();
          },
          (error: unknown) => {
            if (checking.signal.aborted) {
              return;
            }
            setRetrieval((last) => ({
              ...last,
              attempt: failedAttempt(error),
            }));
            setChecksSettled((settled) => settled + 1);
            settleRevealed();
          },
        );
      },
      visibility === "revealed" ? 0 : checkIntervalMs,
    );
    return () => {
      clearTimeout(waiting);
      checking.abort();
    };
  }, [checksSettled, readSettled, shownRevision, source, visibility]);

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

  return { source, work, attempt, notice, reading, refresh, selectSource };
}
