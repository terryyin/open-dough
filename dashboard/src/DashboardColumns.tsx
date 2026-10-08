import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import { ColumnEdge } from "./ColumnEdge.tsx";
import type { ColumnSummary } from "./columnSummary.ts";
import { useColumnPaging } from "./columnPaging.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RecentlyDone } from "./RecentlyDone.tsx";
import { useRecentlyDone } from "./recentlyDoneView.ts";
import { columnSessionsOf } from "./columnSessions.ts";
import { stagesOf, WorkStages } from "./WorkStages.tsx";
import "./dashboard-columns.css";

// The dashboard columns: Backlog, Taken, and Recently done, left to right on
// one row (./dashboard-columns.css). Published work and local sessions use
// the same projected lists and completeness in headings and edge controls.
// Where the page has no room for all three, the whole columns that fit show, and an edge
// control on either side that has a hidden column moves the view to it
// (./columnPaging.ts), as does focus or a reveal landing in it. Hidden
// columns stay rendered, in the reading and tab order, cut off at the row's
// sides, and the row names them (`data-hidden`, counted from 1) so that they
// add nothing to the page's length.
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
  const sessions = columnSessionsOf(
    sourceId,
    launches.records,
    [...work.backlog, ...work.taken].map(({ identity }) => identity),
  );
  const stages = stagesOf(work, sessions.taken);
  const recent = useRecentlyDone({
    sourceId,
    work,
    creations: launches.creations,
    records: sessions.done,
    noneKept: sessions.noneKept,
  });
  const columns: readonly ColumnSummary[] = [
    ...stages.map(({ column }) => column),
    recent.column,
  ];
  const { frame, row, shown, leftmost, move, sliding, slid, hidden } =
    useColumnPaging(columns.length);
  const left = columns[leftmost - 1];
  const right = columns[leftmost + shown];
  // The keyboard stays on the edge controls: a control that holds it and is
  // gone after its move hands it to the other side's, which points back the
  // way the developer came, kept in sight where it stands, so the page does
  // not scroll for it.
  const edges = {
    left: useRef<HTMLButtonElement>(null),
    right: useRef<HTMLButtonElement>(null),
  };
  const handed = useRef<"left" | "right" | undefined>(undefined);
  const press = (side: "left" | "right") => () => {
    if (document.activeElement === edges[side].current) handed.current = side;
    move(side === "left" ? -1 : 1);
  };
  useLayoutEffect(() => {
    const side = handed.current;
    handed.current = undefined;
    if (side === undefined || edges[side].current) return;
    edges[side === "left" ? "right" : "left"].current?.focus({
      preventScroll: true,
    });
  });
  return (
    <div
      ref={frame}
      className="dashboard-columns"
      data-paged={shown < columns.length || undefined}
    >
      {left && (
        <ColumnEdge
          ref={edges.left}
          side="left"
          column={left}
          onMove={press("left")}
        />
      )}
      <div className="dashboard-columns-view">
        <div
          ref={row}
          className="dashboard-columns-row"
          data-sliding={sliding || undefined}
          data-hidden={
            hidden.map((column) => column + 1).join(" ") || undefined
          }
          style={{ "--leftmost": leftmost } as CSSProperties}
          onTransitionEnd={slid}
          onTransitionCancel={slid}
        >
          <WorkStages
            work={work}
            stages={stages}
            launches={launches}
            onOpenRoster={onOpenRoster}
          />
          <RecentlyDone view={recent} />
        </div>
      </div>
      {right && (
        <ColumnEdge
          ref={edges.right}
          side="right"
          column={right}
          onMove={press("right")}
        />
      )}
    </div>
  );
}
