import { useLayoutEffect, useRef, type CSSProperties } from "react";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import { ColumnPagingControl } from "./ColumnPagingControl.tsx";
import type { ColumnSummary } from "./columnSummary.ts";
import { useColumnPaging } from "./columnPaging.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { RecentlyDone } from "./RecentlyDone.tsx";
import { useRecentlyDone } from "./recentlyDoneView.ts";
import { columnSessionsOf } from "./columnSessions.ts";
import { columnsOf, Columns } from "./Columns.tsx";
import { boardMarks } from "./storyCardFocus.ts";
import "./board.css";

// The Board: Backlog, Taken, and Recently done, left to right on
// one row (./board.css). Published work and local sessions use
// the same projected lists and completeness in headings and column paging controls.
// Where the Board has no room for all three, the whole columns that fit show, and a column paging
// control on either side that has a hidden column moves the view to it
// (./columnPaging.ts), as does focus or a reveal landing in it. Hidden
// columns stay rendered, in the reading and tab order, cut off at the row's
// sides, and the row names them (`data-hidden`, counted from 1) so that they
// add nothing to the Board's scroll range.
export function Board({
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
  const columns = columnsOf(work, sessions.taken);
  const recent = useRecentlyDone({
    sourceId,
    work,
    creations: launches.creations,
    // Unread until a sessions read for the current project list has ended.
    records: launches.sessionsSettled ? sessions.done : undefined,
    noneKept: sessions.noneKept,
    sessionsSettled: launches.sessionsSettled,
  });
  const summaries: readonly ColumnSummary[] = [
    ...columns.map(({ column }) => column),
    recent.column,
  ];
  const { frame, row, shown, leftmost, move, sliding, slid, hidden } =
    useColumnPaging(summaries.length);
  const left = summaries[leftmost - 1];
  const right = summaries[leftmost + shown];
  // The keyboard stays on the column paging controls: a control that holds it and is
  // gone after its move hands it to the other side's, which points back the
  // way the developer came, kept in sight where it stands, so the Board does
  // not scroll for it.
  const pagingControls = {
    left: useRef<HTMLButtonElement>(null),
    right: useRef<HTMLButtonElement>(null),
  };
  const handed = useRef<"left" | "right" | undefined>(undefined);
  const press = (side: "left" | "right") => () => {
    if (document.activeElement === pagingControls[side].current)
      handed.current = side;
    move(side === "left" ? -1 : 1);
  };
  useLayoutEffect(() => {
    const side = handed.current;
    handed.current = undefined;
    if (side === undefined || pagingControls[side].current) return;
    pagingControls[side === "left" ? "right" : "left"].current?.focus({
      preventScroll: true,
    });
  });
  return (
    <div
      ref={frame}
      className="board"
      role="region"
      aria-label="Board"
      {...boardMarks}
      data-paged={shown < summaries.length || undefined}
    >
      {left && (
        <ColumnPagingControl
          ref={pagingControls.left}
          side="left"
          column={left}
          onMove={press("left")}
        />
      )}
      <div className="board-view">
        <div
          ref={row}
          className="board-row"
          data-sliding={sliding || undefined}
          data-hidden={
            hidden.map((column) => column + 1).join(" ") || undefined
          }
          style={{ "--leftmost": leftmost } as CSSProperties}
          onTransitionEnd={slid}
          onTransitionCancel={slid}
        >
          <Columns
            work={work}
            columns={columns}
            launches={launches}
            onOpenRoster={onOpenRoster}
          />
          <RecentlyDone
            view={recent}
            sourceId={sourceId}
            launchRecords={launches.records}
          />
        </div>
      </div>
      {right && (
        <ColumnPagingControl
          ref={pagingControls.right}
          side="right"
          column={right}
          onMove={press("right")}
        />
      )}
    </div>
  );
}
