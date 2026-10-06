import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import { ColumnEdge, type ColumnSummary } from "./ColumnEdge.tsx";
import { useColumnPaging } from "./columnPaging.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RecentlyDone, recentlyDoneColumn } from "./RecentlyDone.tsx";
import { stagesOf, WorkStages } from "./WorkStages.tsx";
import "./dashboard-columns.css";

// The dashboard columns: Backlog, Taken, and Recently done, left to right on
// one row (./dashboard-columns.css). The two stages stay the "Work stages"
// of published work; Recently done, the stories done recently and local
// evidence of launches, is the third column beside them. Where the page has
// no room for all three, the whole columns that fit show, and an edge
// control on either side that has a hidden column moves the view to it
// (./columnPaging.ts), as does focus or a reveal landing in it. Hidden
// columns stay rendered, in the reading and tab order, cut off at the row's
// sides.
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
    recentlyDoneColumn(
      sourceId,
      launches.creations,
      launches.records,
      work.done,
    ),
  ];
  const { frame, row, shown, leftmost, move, sliding, slid } = useColumnPaging(
    columns.length,
  );
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
          style={{ "--leftmost": leftmost } as CSSProperties}
          onTransitionEnd={slid}
          onTransitionCancel={slid}
        >
          <WorkStages
            work={work}
            launches={launches}
            onOpenRoster={onOpenRoster}
          />
          <RecentlyDone
            sourceId={sourceId}
            records={launches.records}
            creations={launches.creations}
            done={work.done}
          />
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
