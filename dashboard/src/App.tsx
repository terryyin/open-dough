import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  ProjectsOnPage,
  useProjectConfiguration,
  useProjects,
} from "./projectList.tsx";
import { DashboardBanner } from "./DashboardBanner.tsx";
import { usePublishedObservation } from "./publishedObservation.ts";
import { WorkStages } from "./WorkStages.tsx";
import { PublishedReadStatus } from "./PublishedReadStatus.tsx";
import { useAgentLaunches } from "./agentLaunches.ts";
import { RecentSessions } from "./RecentSessions.tsx";
import { TerminalSplit } from "./TerminalSplit.tsx";
import { PreparationLegend } from "./PreparationLegend.tsx";
import { NearFutureDirection } from "./NearFutureDirection.tsx";
import { StartSession } from "./StartSession.tsx";
import { StartupRecovery } from "./StartupRecovery.tsx";
import { StartupAnnouncer } from "./StartupAnnouncer.tsx";
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
  const { projects, problem } = useProjectConfiguration();
  if (projects === undefined)
    return <p role="status">{problem ?? "Loading projects…"}</p>;
  return (
    <ProjectsOnPage projects={projects}>
      <ConfiguredDashboard />
    </ProjectsOnPage>
  );
}

function ConfiguredDashboard() {
  const projects = useProjects();
  const [opening, setOpening] = useState<RosterOpening | undefined>();
  const latestOpening = useRef<RosterOpening | undefined>(undefined);
  const closed = useRef<RosterOpening | undefined>(undefined);
  const returningFromRoster = useRef(false);

  const initialSource = useRef(
    parseRoute(window.location, projects).route.source,
  );
  const {
    source,
    work,
    shown,
    attempt,
    notice,
    reading,
    refresh,
    selectSource,
  } = usePublishedObservation(initialSource.current);
  const readFailure = attempt.status === "failed" ? attempt.problem : undefined;
  const launches = useAgentLaunches({
    shown,
    reading,
    failure: readFailure,
    readAfresh: refresh,
  });

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
    showStories,
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
      showStories(source);
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
    <TerminalSplit
      sessions={launches}
      stories={{
        selected: source.id,
        shown: showsRoster ? undefined : work?.source.id,
        show: showStories,
      }}
    >
      <DashboardBanner
        source={source}
        work={work}
        reading={reading}
        failed={attempt.status === "failed"}
        onSelect={selectProject}
        onRefresh={refresh}
      />
      <div className="page-header">
        <PublishedReadStatus
          attempt={attempt}
          reading={reading}
          work={work}
          notice={notice}
        />
        <div className="project-actions" hidden={showsRoster}>
          {work && (
            <NearFutureDirection key={source.id} direction={work.direction} />
          )}
          <div className="project-actions-end">
            <StartSession
              sourceId={source.id}
              project={source.label}
              attempt={launches.adHocAttemptOf(source.id)}
              onStart={(choices, onLaunched) =>
                launches.startAdHoc(source.id, choices, onLaunched)
              }
            />
            {showsPreparation && <PreparationLegend />}
          </div>
        </div>
        {!showsRoster && (
          <StartupRecovery sourceId={source.id} recoveries={launches} />
        )}
        <StartupAnnouncer
          sourceId={source.id}
          startups={launches.storyStartupsOf(source.id)}
        />
      </div>
      {work && (
        <main hidden={showsRoster}>
          <WorkStages
            work={work}
            launches={launches}
            onOpenRoster={openRoster}
          />
          <RecentSessions
            sourceId={source.id}
            records={launches.records}
            creations={launches.creations}
          />
        </main>
      )}
      {showsRoster && (
        <main>
          <AgentRoster
            source={source}
            work={work}
            problem={readFailure}
            agent={opening?.sourceId === source.id ? opening.agent : undefined}
            onBack={onBack}
          />
        </main>
      )}
    </TerminalSplit>
  );
}
