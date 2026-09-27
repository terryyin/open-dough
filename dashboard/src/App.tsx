import { useLayoutEffect, useRef, useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { Moment } from "./Moment.tsx";
import { DashboardBanner } from "./DashboardBanner.tsx";
import { usePublishedObservation } from "./publishedObservation.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import { WorkStages } from "./WorkStages.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import { AgentRoster } from "./AgentRoster.tsx";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import {
  focusStages,
  returnFocusTo,
  workHolding,
  type FocusedWork,
} from "./workFocus.ts";

// A portrait's opening of the roster: its agent, and the project it was opened
// in. Back returns the keyboard to that portrait, or, once it is gone, to its
// work's card in the same project.
type RosterOpening = {
  readonly agent: string;
  readonly element: HTMLElement;
  readonly sourceId: string;
  readonly work: FocusedWork | undefined;
};

export function App() {
  const { source, work, attempt, notice, reading, refresh, selectSource } =
    usePublishedObservation();
  // The opening of the roster while it is shown. The stories stay mounted
  // behind it, so their reading state is there on the way back.
  const [opening, setOpening] = useState<RosterOpening | undefined>();
  // The opening Back just closed, until the keyboard is returned from it.
  const closed = useRef<RosterOpening | undefined>(undefined);
  const openRoster: OpenRoster = (agent, element) => {
    setOpening({
      agent,
      element,
      sourceId: source.id,
      work: workHolding(element),
    });
  };
  useLayoutEffect(() => {
    const opener = closed.current;
    if (opening !== undefined || opener === undefined) {
      return;
    }
    closed.current = undefined;
    // Work identities never carry focus into another project.
    if (opener.sourceId !== source.id) {
      focusStages();
    } else if (opener.element.isConnected) {
      opener.element.focus();
    } else if (opener.work !== undefined) {
      returnFocusTo({ ...opener.work, link: undefined });
    }
  }, [opening, source.id]);
  const showsRoster = opening !== undefined;
  const showsPreparation =
    work &&
    [...work.taken, ...work.backlog].some(
      (entry) => entry.preparation !== undefined,
    );
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
          <div className="direction-row" hidden={showsRoster}>
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
            {showsPreparation && <PreparationLegend />}
          </div>
        )}
      </div>
      {work && (
        <main hidden={showsRoster}>
          <WorkStages work={work} onOpenRoster={openRoster} />
        </main>
      )}
      {showsRoster && (
        <main>
          <AgentRoster
            source={source}
            work={work}
            problem={attempt.status === "failed" ? attempt.problem : undefined}
            agent={opening.sourceId === source.id ? opening.agent : undefined}
            onBack={() => {
              closed.current = opening;
              setOpening(undefined);
            }}
          />
        </main>
      )}
    </>
  );
}
