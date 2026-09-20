import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { publishedSource } from "./publishedSource";
import { readPublishedWork, type PublishedWork } from "./publishedWork";
import { ReadProblem } from "./readProblem";
import { focusedWork, returnFocusTo, type FocusedWork } from "./workFocus";
import { WorkStages } from "./WorkStages";

// What is known about the observation itself. Reading and failure describe
// the latest attempt, never the published work: they add no state to any work
// entry, and they leave the last successfully read snapshot as it was.
type Attempt =
  | { readonly status: "reading" }
  | { readonly status: "read" }
  | { readonly status: "failed"; readonly problem: string };

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
  const [retrieval, setRetrieval] = useState<Retrieval>({
    work: undefined,
    attempt: { status: "reading" },
    notice: "",
  });
  // Opening the page asks for the first read; only Refresh asks for another.
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
            attempt: { status: "failed", problem: describe(error) },
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
                    <time dateTime={work.retrievedAt.toISOString()}>
                      {work.retrievedAt.toLocaleString()}
                    </time>
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
              button would drop keyboard focus to the page. */}
          <button
            type="button"
            className="refresh"
            aria-disabled={reading}
            onClick={refresh}
          >
            Refresh
          </button>
        </section>
        {reading && (
          <p role="status">
            Reading published work…
            {work && " What is shown is still the snapshot retrieved earlier."}
          </p>
        )}
        {attempt.status === "failed" && (
          <div role="alert" className="read-problem">
            <h2>Published work could not be read</h2>
            <p>{attempt.problem}</p>
          </div>
        )}
        <p className="notice" aria-live="polite">
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
