import type { ReactNode } from "react";
import { Board } from "./Board.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import type { DashboardRoute } from "./dashboardRouteUrl.ts";
import { IntentPerspective } from "./IntentPerspective.tsx";
import { IntentReadRecovery } from "./intentReadRecovery.tsx";
import type { useObservationAttempt } from "./observationAttempt.ts";
import type { Visibility } from "./pageVisibility.ts";
import { AgentRoster } from "./AgentRoster.tsx";
import { ProjectActions } from "./ProjectActions.tsx";
import { PublishedReadStatus } from "./PublishedReadStatus.tsx";
import { usePageSessions } from "./pageSessions.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RetainedFollowUpPerspective } from "./RetainedFollowUpPerspective.tsx";
import { StartupAnnouncer } from "./StartupAnnouncer.tsx";
import { StartupRecovery } from "./StartupRecovery.tsx";
import { StoryDestination, useStoryDestination } from "./StoryDestination.tsx";

// Scrolled page body under the banner: board, Intent, or roster, with the
// page-header status row. Lives beside the banner inside story-reference
// navigation so both share that context.
export function ConfiguredDashboardContent({
  source,
  work,
  route,
  destination,
  showsIntent,
  showsRoster,
  showsBoard,
  storyNotice,
  attempt,
  reading,
  withheld,
  recoversAt,
  limitedUntil,
  notice,
  launches,
  visibility,
  readFailure,
  openRoster,
  rosterAgent,
  onBack,
  showStories,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly route: DashboardRoute;
  readonly destination: ReturnType<typeof useStoryDestination>;
  readonly showsIntent: boolean;
  readonly showsRoster: boolean;
  readonly showsBoard: boolean;
  readonly storyNotice: ReactNode;
  readonly attempt: ReturnType<typeof useObservationAttempt>["attempt"];
  readonly reading: boolean;
  readonly withheld: boolean;
  readonly recoversAt: Date | undefined;
  readonly limitedUntil: Date | undefined;
  readonly notice: string;
  readonly launches: MachineSessions;
  readonly visibility: Visibility;
  readonly readFailure: string | undefined;
  readonly openRoster: (agent: string, element: HTMLElement) => void;
  readonly rosterAgent: string | undefined;
  readonly onBack: () => void;
  readonly showStories: (project: PublishedSource) => void;
}) {
  const { presentTerminal } = usePageSessions();
  return (
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
            presentTerminal={presentTerminal}
            hidden={!showsBoard}
          />
          {showsBoard && (
            <StartupRecovery sourceId={source.id} recoveries={launches} />
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
              project={source.label}
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
            {route.followUp !== undefined ? (
              <RetainedFollowUpPerspective
                source={source}
                work={work}
                records={launches.records}
                workspaces={launches.workspaces}
                destination={route.followUp}
              />
            ) : (
              <IntentPerspective
                source={source}
                work={work}
                records={launches.records}
                workspaces={launches.workspaces}
              />
            )}
          </IntentReadRecovery>
        )}
        {showsRoster && (
          <main>
            <AgentRoster
              source={source}
              work={work}
              problem={readFailure}
              agent={rosterAgent}
              onBack={onBack}
            />
          </main>
        )}
      </div>
    </div>
  );
}
