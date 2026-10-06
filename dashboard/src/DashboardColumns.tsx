import type { CSSProperties } from "react";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import { ColumnEdge, type ColumnSummary } from "./ColumnEdge.tsx";
import { useColumnPaging } from "./columnPaging.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RecentSessions, recentSessionsColumn } from "./RecentSessions.tsx";
import { stagesOf, WorkStages } from "./WorkStages.tsx";
import "./dashboard-columns.css";

// The dashboard columns: Backlog, Taken, and Recent sessions, left to right
// on one row (./dashboard-columns.css). The two stages stay the "Work stages"
// of published work; Recent sessions, local evidence of launches, is the
// third column beside them. Where the page has no room for all three, the
// whole columns that fit show, and an edge control on either side that has a
// hidden column moves the view to it (./columnPaging.ts). Hidden columns stay
// rendered, in the reading and tab order, cut off at the row's sides.
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
  const columns: readonly ColumnSummary[] = [
    ...stagesOf(work).map(({ name, entries }) => ({
      name,
      entries: entries.length,
    })),
    recentSessionsColumn(sourceId, launches.creations, launches.records),
  ];
  const { frame, shown, leftmost, move, sliding, slid } = useColumnPaging(
    columns.length,
  );
  const left = columns[leftmost - 1];
  const right = columns[leftmost + shown];
  return (
    <div
      ref={frame}
      className="dashboard-columns"
      data-paged={shown < columns.length || undefined}
    >
      {left && (
        <ColumnEdge
          side="left"
          column={left}
          onMove={() => {
            move(-1);
          }}
        />
      )}
      <div className="dashboard-columns-view">
        <div
          className="dashboard-columns-row"
          data-sliding={sliding || undefined}
          style={{ "--leftmost": leftmost } as CSSProperties}
          onTransitionEnd={slid}
          onTransitionCancel={slid}
        >
          <WorkStages
            work={work}
            launches={launches}
            onOpenRoster={onOpenRoster}
          />
          <RecentSessions
            sourceId={sourceId}
            records={launches.records}
            creations={launches.creations}
          />
        </div>
      </div>
      {right && (
        <ColumnEdge
          side="right"
          column={right}
          onMove={() => {
            move(1);
          }}
        />
      )}
    </div>
  );
}
