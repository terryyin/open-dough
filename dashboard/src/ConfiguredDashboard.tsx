import { useLayoutEffect, useRef } from "react";
import { useVisibleProjects } from "./projectList.tsx";
import { DashboardBanner } from "./DashboardBanner.tsx";
import { usePublishedObservation } from "./publishedObservation.ts";
import { useBoardScrolling } from "./boardScroll.ts";
import { Board } from "./Board.tsx";
import { PublishedReadStatus } from "./PublishedReadStatus.tsx";
import { useAgentLaunches } from "./agentLaunches.ts";
import { PageFrame } from "./PageFrame.tsx";
import { ProjectActions } from "./ProjectActions.tsx";
import { StartupRecovery } from "./StartupRecovery.tsx";
import { StartupAnnouncer } from "./StartupAnnouncer.tsx";
import { StoryDestination } from "./StoryDestination.tsx";
import { AgentRoster } from "./AgentRoster.tsx";
import { IntentPerspective } from "./IntentPerspective.tsx";
import { IntentReadRecovery } from "./intentReadRecovery.tsx";
import { parseRoute } from "./dashboardRouteUrl.ts";
import { useDashboardNavigation } from "./dashboardNavigation.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { StoryReferenceNavigation } from "./storyNavigation.tsx";

export type DashboardSelection = {
  readonly source: PublishedSource | undefined;
  readonly select: (source: PublishedSource | undefined) => void;
};

export function ConfiguredDashboard({
  settingsOpen,
  onOpenSettings,
  onDashboardReady,
}: {
  readonly settingsOpen: boolean;
  readonly onOpenSettings: () => void;
  readonly onDashboardReady: (value: DashboardSelection) => void;
}) {
  useBoardScrolling(settingsOpen);
  const projects = useVisibleProjects();
  const initialSource = useRef(
    parseRoute(window.location, projects).route.source,
  );
  const {
    source,
    work,
    shown,
    attempt,
    notice,
    withheld,
    recoversAt,
    limitedUntil,
    visibility,
    reading,
    readAfresh,
    selectSource,
  } = usePublishedObservation(initialSource.current);
  const readFailure = attempt.status === "failed" ? attempt.problem : undefined;
  const launches = useAgentLaunches({
    shown,
    reading,
    failure: readFailure,
    readAfresh,
  });

  const {
    route,
    selectProject,
    selectPerspective,
    showStories,
    openRoster,
    onBack,
    opening,
    destination,
  } = useDashboardNavigation({
    source,
    work,
    attempt,
    suspended: settingsOpen,
    selectSource,
  });

  useLayoutEffect(() => {
    onDashboardReady({ source, select: selectProject });
  });

  // Intent replaces Development's content and keeps its view to return to;
  // the mounted Board, the Sessions sidebar and the Side panel stay.
  const showsIntent = source !== undefined && route.perspective === "intent";
  const showsRoster =
    source !== undefined && !showsIntent && route.view === "roster";
  const showsBoard = source !== undefined && !showsIntent && !showsRoster;
  return (
    <PageFrame
      sessions={launches}
      stories={{
        selected: source?.id ?? "",
        shown: showsBoard ? work?.source.id : undefined,
        show: showStories,
        select: selectProject,
        development: !showsIntent,
        work,
      }}
    >
      <DashboardBanner
        source={source}
        perspective={route.perspective}
        onOpenSettings={onOpenSettings}
        onSelect={selectProject}
        onSelectPerspective={selectPerspective}
      />
      {source === undefined ? (
        <main className="frame-state">
          <h1>All projects are hidden</h1>
          <p>
            Open System settings → Projects to show a project on this dashboard.
          </p>
        </main>
      ) : (
        <StoryReferenceNavigation
          projects={projects}
          selected={source.id}
          work={work}
          reading={reading}
          failure={readFailure}
          show={showStories}
          retry={readAfresh}
          suspended={settingsOpen || !showsBoard}
        >
          {(storyNotice) => (
            <div
              className={
                showsIntent
                  ? "intent-scroll"
                  : showsRoster
                    ? "roster-scroll"
                    : "board-scroll"
              }
            >
              <div className="scroll-content">
                <div className="page-header">
                  <StoryDestination
                    route={route}
                    status={destination}
                    retry={() => {
                      window.location.reload();
                    }}
                    showStories={() => {
                      showStories(source);
                    }}
                  />
                  <PublishedReadStatus
                    attempt={attempt}
                    reading={reading}
                    work={work}
                    withheld={withheld}
                    recoversAt={recoversAt}
                    limitedUntil={limitedUntil}
                    notice={notice}
                  />
                  {storyNotice}
                  <ProjectActions
                    source={source}
                    work={work}
                    launches={launches}
                    hidden={!showsBoard}
                  />
                  {showsBoard && (
                    <StartupRecovery
                      sourceId={source.id}
                      recoveries={launches}
                    />
                  )}
                  <StartupAnnouncer
                    sourceId={source.id}
                    startups={launches.storyStartupsOf(source.id)}
                  />
                </div>
                {work && (
                  <main hidden={!showsBoard}>
                    <Board
                      sourceId={source.id}
                      work={work}
                      launches={launches}
                      onOpenRoster={openRoster}
                    />
                  </main>
                )}
                {showsIntent && (
                  <IntentReadRecovery
                    visibility={visibility}
                    limitStands={limitedUntil !== undefined}
                  >
                    <IntentPerspective
                      source={source}
                      work={work}
                      records={launches.records}
                      workspaces={launches.workspaces}
                    />
                  </IntentReadRecovery>
                )}
                {showsRoster && (
                  <main>
                    <AgentRoster
                      source={source}
                      work={work}
                      problem={readFailure}
                      agent={
                        opening?.sourceId === source.id
                          ? opening.agent
                          : undefined
                      }
                      onBack={onBack}
                    />
                  </main>
                )}
              </div>
            </div>
          )}
        </StoryReferenceNavigation>
      )}
    </PageFrame>
  );
}
