import { useLayoutEffect, useRef } from "react";
import { useVisibleProjects } from "./projectList.tsx";
import { DashboardBanner } from "./DashboardBanner.tsx";
import { usePublishedObservation } from "./publishedObservation.ts";
import { useBoardScrolling } from "./boardScroll.ts";
import { useAgentLaunches } from "./agentLaunches.ts";
import { PageFrame } from "./PageFrame.tsx";
import {
  FollowUpNavigationOnPage,
  FollowUpSelection,
} from "./ciFollowUpNavigation.tsx";
import { parseRoute } from "./dashboardRouteUrl.ts";
import { useDashboardNavigation } from "./dashboardNavigation.ts";
import { LaunchesOnPage } from "./pageLaunches.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ConfiguredDashboardContent } from "./configuredDashboardContent.tsx";
import { ConfiguredDashboardFrame } from "./configuredDashboardFrame.tsx";
import { PageReadsOnPage, type PageReads } from "./pageReads.tsx";
import { TransientRecoveryOnPage } from "./transientRecovery.ts";

export type DashboardSelection = {
  readonly source: PublishedSource | undefined;
  readonly select: (source: PublishedSource | undefined) => void;
};

export function ConfiguredDashboard(props: {
  readonly reads: PageReads;
  readonly settingsOpen: boolean;
  readonly onOpenSettings: () => void;
  readonly onDashboardReady: (value: DashboardSelection) => void;
}) {
  return (
    <TransientRecoveryOnPage>
      <ConfiguredDashboardBody {...props} />
    </TransientRecoveryOnPage>
  );
}

function ConfiguredDashboardBody({
  reads,
  settingsOpen,
  onOpenSettings,
  onDashboardReady,
}: {
  readonly reads: PageReads;
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
    connection,
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
  } = usePublishedObservation(initialSource.current, reads.observation);
  const readFailure = attempt.status === "failed" ? attempt.problem : undefined;
  const launches = useAgentLaunches(
    {
      shown,
      reading,
      failure: readFailure,
      readAfresh,
    },
    reads.machine,
  );

  const {
    route,
    selectProject,
    selectPerspective,
    openFollowUp,
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

  // Intent and roster replace content; the mounted Board and Side panel stay.
  const showsIntent = source !== undefined && route.perspective === "intent";
  const showsRoster =
    source !== undefined && !showsIntent && route.view === "roster";
  const showsBoard = source !== undefined && !showsIntent && !showsRoster;

  const banner = (
    <DashboardBanner
      connection={connection}
      source={source}
      perspective={route.perspective}
      onOpenSettings={onOpenSettings}
      onSelect={selectProject}
      onSelectPerspective={selectPerspective}
    />
  );

  const stories = {
    selected: source?.id ?? "",
    shown: showsBoard ? work?.source.id : undefined,
    show: showStories,
    select: selectProject,
    development: !showsIntent,
    work,
  };
  const showIntent = () => {
    selectPerspective("intent");
  };
  const followUpSelection = (
    <FollowUpSelection
      project={source?.id ?? ""}
      destination={route.followUp}
      navigate={openFollowUp}
    />
  );

  return (
    <PageReadsOnPage reads={reads}>
      <LaunchesOnPage value={launches}>
        <FollowUpNavigationOnPage value={openFollowUp}>
          {source === undefined ? (
            <PageFrame
              sessions={launches}
              showIntent={showIntent}
              stories={stories}
            >
              {followUpSelection}
              {banner}
              <main className="frame-state">
                <h1>All projects are hidden</h1>
                <p>
                  Open System settings → Projects to show a project on this
                  dashboard.
                </p>
              </main>
            </PageFrame>
          ) : (
            <ConfiguredDashboardFrame
              launches={launches}
              stories={stories}
              showIntent={showIntent}
              followUpSelection={followUpSelection}
              storyReference={{
                projects,
                selected: source.id,
                work,
                reading,
                failure: readFailure,
                show: showStories,
                retry: readAfresh,
                suspended: settingsOpen || !showsBoard,
              }}
              banner={banner}
            >
              {(storyNotice) => (
                <ConfiguredDashboardContent
                  source={source}
                  work={work}
                  route={route}
                  destination={destination}
                  showsIntent={showsIntent}
                  showsRoster={showsRoster}
                  showsBoard={showsBoard}
                  storyNotice={storyNotice}
                  attempt={attempt}
                  reading={reading}
                  withheld={withheld}
                  recoversAt={recoversAt}
                  limitedUntil={limitedUntil}
                  notice={notice}
                  launches={launches}
                  visibility={visibility}
                  readFailure={readFailure}
                  openRoster={openRoster}
                  rosterAgent={
                    opening?.sourceId === source.id ? opening.agent : undefined
                  }
                  onBack={onBack}
                  showStories={showStories}
                />
              )}
            </ConfiguredDashboardFrame>
          )}
        </FollowUpNavigationOnPage>
      </LaunchesOnPage>
    </PageReadsOnPage>
  );
}
