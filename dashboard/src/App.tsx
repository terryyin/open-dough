import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { defaultSource, type PublishedSource } from "./publishedSource";
import {
  readPublishedWork,
  shortRevision,
  type PublishedWork,
} from "./publishedWork";
import { Moment } from "./Moment";
import { DashboardBanner } from "./DashboardBanner";
import { ReadProblem } from "./readProblem";
import {
  focusedWork,
  restoreSnapshotFocus,
  type FocusedWork,
} from "./workFocus";
import { WorkStages } from "./WorkStages";

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

function describe(error: unknown): string {
  return error instanceof ReadProblem
    ? error.message
    : "An unexpected problem stopped the read.";
}

export function App() {
  // The project this dashboard is currently observing. Selecting another
  // project replaces this whole, never merges into what is already shown.
  const [source, setSource] = useState<PublishedSource>(defaultSource);
  const [retrieval, setRetrieval] = useState<Retrieval>({
    work: undefined,
    attempt: { status: "reading" },
    notice: "",
  });
  // Opening the page asks for the first read; only Refresh, named Retry after
  // a failed attempt, asks for another. Selecting a different project also
  // starts a fresh read, through the `source` dependency below. Nothing
  // reads again by itself.
  const [readsAsked, setReadsAsked] = useState(1);
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
    readPublishedWork(source, reading.signal, acceptProgress).then(
      acceptProgress,
      (error: unknown) => {
        if (!reading.signal.aborted) {
          setRetrieval((last) => ({
            ...last,
            attempt: {
              status: "failed",
              problem: describe(error),
              at: new Date(),
            },
          }));
        }
      },
    );
    return () => {
      reading.abort();
    };
  }, [readsAsked, source]);

  const { work, attempt, notice } = retrieval;

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
    if (reading) {
      return;
    }
    setRetrieval((last) => ({
      ...last,
      attempt: { status: "reading" },
      notice: "",
    }));
    setReadsAsked((asked) => asked + 1);
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
    setRetrieval({
      work: undefined,
      attempt: { status: "reading" },
      notice: "",
    });
  };

  return (
    <>
      <DashboardBanner
        source={source}
        work={work}
        reading={reading}
        failed={attempt.status === "failed"}
        onSelect={selectSource}
        onRefresh={refresh}
      />
      <div className="page-header">
        <h1>Published work</h1>
        {/* Both polite regions stay rendered while they have nothing to say:
            assistive technology speaks a change of text inside a region it
            already knows, and may never speak one inserted with its text.
            Neither takes focus. The result names only what was read; the
            source evidence above already shows it, so it is spoken and not
            shown twice, while a read under way is said in sight. */}
        <p
          role="status"
          className={
            attempt.status === "read"
              ? "announcement spoken-only"
              : "announcement"
          }
        >
          {reading && (
            <>
              Reading published work…
              {work &&
                " What is shown is still the snapshot retrieved earlier."}
            </>
          )}
          {attempt.status === "read" && work && (
            <>
              Published work read at revision {shortRevision(work.revision)},
              retrieved <Moment at={work.retrievedAt} />.
            </>
          )}
        </p>
        {attempt.status === "failed" && (
          <div role="alert" className="read-problem">
            <h2>Published work could not be read</h2>
            <p>{attempt.problem}</p>
            <p>
              This attempt failed at <Moment at={attempt.at} />.{" "}
              {work ? (
                <>
                  What is shown is the earlier snapshot, retrieved at{" "}
                  <Moment at={work.retrievedAt} />; this attempt added nothing
                  to it.
                </>
              ) : (
                "No published work is shown, because none has been read."
              )}{" "}
              Press Retry to read again.
            </p>
          </div>
        )}
        <p className="announcement" aria-live="polite">
          {notice}
        </p>
        {work && (
          <section className="direction" aria-labelledby="direction-heading">
            <details key={source.id}>
              <summary>
                <h2 id="direction-heading">Near-future direction</h2>
              </summary>
              {work.direction === "" ? (
                <p className="quiet">No near-future direction is recorded.</p>
              ) : (
                <p className="direction-text">{work.direction}</p>
              )}
            </details>
          </section>
        )}
      </div>
      {work && (
        <main>
          <WorkStages work={work} />
        </main>
      )}
    </>
  );
}
