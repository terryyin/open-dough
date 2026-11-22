import { Board } from "./Board.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import type { DashboardRoute } from "./dashboardRouteUrl.ts";
import { IntentPerspective } from "./IntentPerspective.tsx";
import { IntentReadRecovery } from "./intentReadRecovery.tsx";
import type { Visibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RetainedFollowUpPerspective } from "./RetainedFollowUpPerspective.tsx";

// The project's Board, kept mounted while hidden, and the Intent body that
// replaces it when the route shows the Intent perspective.
export function BoardOrIntent({
  source,
  work,
  launches,
  showsBoard,
  showsIntent,
  followUp,
  visibility,
  limitStands,
  openRoster,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly launches: MachineSessions;
  readonly showsBoard: boolean;
  readonly showsIntent: boolean;
  readonly followUp: DashboardRoute["followUp"];
  readonly visibility: Visibility;
  readonly limitStands: boolean;
  readonly openRoster: (agent: string, element: HTMLElement) => void;
}) {
  return (
    <>
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
        <IntentReadRecovery visibility={visibility} limitStands={limitStands}>
          {followUp !== undefined ? (
            <RetainedFollowUpPerspective
              source={source}
              work={work}
              records={launches.records}
              workspaces={launches.workspaces}
              destination={followUp}
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
    </>
  );
}
