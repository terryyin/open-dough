import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RecentSessions } from "./RecentSessions.tsx";
import { WorkStages } from "./WorkStages.tsx";

// The dashboard columns: Backlog, Taken, and Recent sessions, left to right
// on one row (./stage-frame.css). The two stages stay the "Work stages" of
// published work; Recent sessions, local evidence of launches, is the third
// column beside them.
export function DashboardColumns({
  sourceId,
  work,
  launches,
  onOpenRoster,
}: {
  // The selected project.
  sourceId: string;
  work: PublishedWork;
  launches: MachineSessions;
  onOpenRoster: OpenRoster;
}) {
  return (
    <div className="dashboard-columns">
      <WorkStages work={work} launches={launches} onOpenRoster={onOpenRoster} />
      <RecentSessions
        sourceId={sourceId}
        records={launches.records}
        creations={launches.creations}
      />
    </div>
  );
}
