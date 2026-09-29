import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { shortRevision } from "./publishedWork.ts";
import { Moment } from "./Moment.tsx";
import { DashboardBanner } from "./DashboardBanner.tsx";
import { usePublishedObservation } from "./publishedObservation.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import { WorkStages } from "./WorkStages.tsx";
import { useAgentLaunches } from "./agentLaunches.ts";
import { RecentSessions } from "./RecentSessions.tsx";
import { TerminalSplit } from "./TerminalSplit.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import { AgentRoster } from "./AgentRoster.tsx";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import {
  isFromPortrait,
  parseRoute,
  useDashboardRoute,
} from "./dashboardRoute.ts";
import { useProjectKeyboardNavigation } from "./projectKeyboardNavigation.ts";
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
  const [opening, setOpening] = useState<RosterOpening | undefined>();
  const latestOpening = useRef<RosterOpening | undefined>(undefined);
  const closed = useRef<RosterOpening | undefined>(undefined);
  const returningFromRoster = useRef(false);

  const initialSource = useRef(parseRoute(window.location).route.source);
  const { source, work, attempt, notice, reading, refresh, selectSource } =
    usePublishedObservation(initialSource.current);
  const launches = useAgentLaunches(source);

  const onReturnToStories = useCallback(() => {
    returningFromRoster.current = true;
    closed.current = opening ?? latestOpening.current;
    setOpening(undefined);
  }, [opening]);

  const onForwardToRoster = useCallback((targetSourceId: string) => {
    if (latestOpening.current?.sourceId === targetSourceId) {
      setOpening(latestOpening.current);
    }
  }, []);

  const {
    route,
    selectProject,
    openRoster: navigateToRoster,
    backToStories,
  } = useDashboardRoute({
    sourceId: source.id,
    selectSource,
    onReturnToStories,
    onForwardToRoster,
  });

  useProjectKeyboardNavigation({ source, selectProject });

  const openRoster: OpenRoster = (agent, element) => {
    const openingInfo: RosterOpening = {
      agent,
      element,
      sourceId: source.id,
      work: workHolding(element),
    };
    latestOpening.current = openingInfo;
    setOpening(openingInfo);
    navigateToRoster(source);
  };

  const onBack = () => {
    if (
      isFromPortrait(window.history.state) &&
      opening?.sourceId === source.id
    ) {
      window.history.back();
    } else {
      onReturnToStories();
      backToStories(source);
    }
  };

  useLayoutEffect(() => {
    if (route.view === "roster") {
      return;
    }
    if (!returningFromRoster.current) {
      return;
    }
    if (work === undefined && closed.current === undefined) {
      return;
    }
    returningFromRoster.current = false;
    const opener = closed.current;
    closed.current = undefined;
    // Work identities never carry focus into another project.
    if (opener === undefined || opener.sourceId !== source.id) {
      focusStages();
    } else if (opener.element.isConnected) {
      opener.element.focus();
    } else if (opener.work !== undefined) {
      returnFocusTo({ ...opener.work, link: undefined });
    } else {
      focusStages();
    }
  }, [route.view, source.id, work]);

  const showsRoster = route.view === "roster";
  const showsPreparation =
    work &&
    [...work.taken, ...work.backlog].some(
      (entry) => entry.preparation !== undefined,
    );
  return (
    <TerminalSplit sessions={launches}>
      <DashboardBanner
        source={source}
        work={work}
        reading={reading}
        failed={attempt.status === "failed"}
        onSelect={selectProject}
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
          <WorkStages
            work={work}
            launches={launches}
            onOpenRoster={openRoster}
          />
          <RecentSessions records={launches.records} />
        </main>
      )}
      {showsRoster && (
        <main>
          <AgentRoster
            source={source}
            work={work}
            problem={attempt.status === "failed" ? attempt.problem : undefined}
            agent={opening?.sourceId === source.id ? opening.agent : undefined}
            onBack={onBack}
          />
        </main>
      )}
    </TerminalSplit>
  );
}
