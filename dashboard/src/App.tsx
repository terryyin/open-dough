import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { publishedSource } from "./publishedSource";
import {
  readPublishedWork,
  shortRevision,
  type PublishedWork,
} from "./publishedWork";
import { ReadProblem } from "./readProblem";
import { focusedWork, returnFocusTo, type FocusedWork } from "./workFocus";
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

function Moment({ at }: { readonly at: Date }) {
  return <time dateTime={at.toISOString()}>{at.toLocaleString()}</time>;
}

export function App() {
  const [retrieval, setRetrieval] = useState<Retrieval>({
    work: undefined,
    attempt: { status: "reading" },
    notice: "",
  });
  // Opening the page asks for the first read; only Refresh, named Retry after
  // a failed attempt, asks for another. Nothing reads again by itself.
  const [readsAsked, setReadsAsked] = useState(1);
  const heldFocus = useRef<FocusedWork | undefined>(undefined);

  useEffect(() => {
    const reading = new AbortController();
    readPublishedWork(reading.signal).then(
      (work) => {
        if (reading.signal.aborted) {
          return;
        }
        const held = focusedWork();
        heldFocus.current = held;
        setRetrieval({
          work,
          attempt: { status: "read" },
          notice:
            held && !lists(work, held.identity)
              ? `${held.title} is no longer listed in the published work.`
              : "",
        });
      },
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
  }, [readsAsked]);

  const { work, attempt, notice } = retrieval;

  useLayoutEffect(() => {
    const held = heldFocus.current;
    heldFocus.current = undefined;
    if (held) {
      returnFocusTo(held);
    }
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

  return (
    <>
      <header className="page-header">
        <h1>Published work</h1>
        <section className="source" aria-label="Published Git state">
          <dl>
            <div>
              <dt>Project</dt>
              <dd>{publishedSource.repository}</dd>
            </div>
            <div>
              <dt>Ref</dt>
              <dd>{publishedSource.ref}</dd>
            </div>
            {work && (
              <>
                <div>
                  <dt>Revision</dt>
                  <dd>
                    <code>{work.revision}</code>
                  </dd>
                </div>
                <div>
                  <dt>Retrieved</dt>
                  <dd>
                    <Moment at={work.retrievedAt} />
                  </dd>
                </div>
              </>
            )}
          </dl>
          <p className="source-note">
            Only published changes are visible. Current agent activity is
            unknown.
          </p>
          {/* Unavailable while reading, yet still focusable: a disabled
              button would drop keyboard focus to the page. After a failed
              attempt the same control is named for what pressing it means,
              so one read action is offered, never two competing ones. */}
          <button
            type="button"
            className="refresh"
            aria-disabled={reading}
            onClick={refresh}
          >
            {attempt.status === "failed" ? "Retry" : "Refresh"}
          </button>
        </section>
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
            <h2 id="direction-heading">Near-future direction</h2>
            {work.direction === "" ? (
              <p className="quiet">No near-future direction is recorded.</p>
            ) : (
              <p className="direction-text">{work.direction}</p>
            )}
          </section>
        )}
      </header>
      {work && (
        <main>
          <WorkStages work={work} />
        </main>
      )}
    </>
  );
}
