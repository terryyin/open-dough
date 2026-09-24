import { shortRevision } from "./publishedWork";
import { Moment } from "./Moment";
import { DashboardBanner } from "./DashboardBanner";
import { usePublishedObservation } from "./publishedObservation";
import { checkIntervalMs } from "./revisionCheckSchedule";
import { WorkStages } from "./WorkStages";

export function App() {
  const { source, work, attempt, notice, reading, refresh, selectSource } =
    usePublishedObservation();
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
              This attempt failed at <Moment at={attempt.at} />
              {work && attempt.afterMembership ? (
                <>
                  , after reading the published work at revision{" "}
                  {shortRevision(work.revision)}. What is shown is what it read,
                  retrieved at <Moment at={work.retrievedAt} />.
                </>
              ) : work ? (
                <>
                  . What is shown is the earlier snapshot, retrieved at{" "}
                  <Moment at={work.retrievedAt} />; this attempt added nothing
                  to it.
                </>
              ) : (
                ". No published work is shown, because none has been read."
              )}
            </p>
            <p>
              {work && attempt.checksResumeAt ? (
                <>
                  As GitHub asked, automatic checks wait until{" "}
                  <Moment at={attempt.checksResumeAt} />. Press Retry to read
                  again sooner.
                </>
              ) : work ? (
                `Automatic checks continue every ${String(checkIntervalMs / 1000)} seconds while this page is visible. Press Retry to read again now.`
              ) : (
                "Press Retry to read again."
              )}
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
