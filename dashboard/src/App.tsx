import { useEffect, useState } from "react";
import { publishedSource } from "./publishedSource";
import { readPublishedWork, type PublishedWork } from "./publishedWork";
import { ReadProblem } from "./readProblem";
import { WorkStages } from "./WorkStages";

// What is known about the observation itself. Loading and failure describe
// reading, never the published work: they add no state to any work entry.
type Retrieval =
  | { readonly status: "reading" }
  | { readonly status: "read"; readonly work: PublishedWork }
  | { readonly status: "failed"; readonly problem: string };

function describe(error: unknown): string {
  return error instanceof ReadProblem
    ? error.message
    : "An unexpected problem stopped the read.";
}

export function App() {
  const [retrieval, setRetrieval] = useState<Retrieval>({ status: "reading" });

  useEffect(() => {
    const reading = new AbortController();
    readPublishedWork(reading.signal).then(
      (work) => {
        setRetrieval({ status: "read", work });
      },
      (error: unknown) => {
        if (!reading.signal.aborted) {
          setRetrieval({ status: "failed", problem: describe(error) });
        }
      },
    );
    return () => {
      reading.abort();
    };
  }, []);

  const work = retrieval.status === "read" ? retrieval.work : undefined;

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
        </section>
        {retrieval.status === "reading" && (
          <p role="status">Reading published work…</p>
        )}
        {retrieval.status === "failed" && (
          <div role="alert" className="read-problem">
            <h2>Published work could not be read</h2>
            <p>{retrieval.problem}</p>
          </div>
        )}
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
