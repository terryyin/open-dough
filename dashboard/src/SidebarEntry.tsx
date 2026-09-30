// One Sessions sidebar entry (`./SessionSidebar.tsx`): its story's title, its
// project and workflow, when it was launched, and its session's state as a
// card entry shows it (`shownSession`). The entry is one control over its
// whole area, named by its title, project, and workflow; opening it goes to
// its story and its session (`./TerminalSplit.tsx`). It is current, and
// outlined, while the page's terminal shows its session.

import { useId } from "react";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
import { sourceById } from "./publishedSource.ts";
import { shownSession } from "./SessionEntry.tsx";
import { usePageSessions, type SessionOperation } from "./pageSessions.ts";

// Goes to an entry's story and session, asked by the entry's control.
export type OpenSidebarEntry = SessionOperation<void, LaunchWithState>;

export function SidebarEntry({
  record,
  onOpen,
}: {
  readonly record: LaunchWithState;
  readonly onOpen: OpenSidebarEntry;
}) {
  const { source } = record.request;
  const { title, name, modelWords } = launchSubject(record.request);
  const { entryClass, stateWords } = shownSession(record);
  const current =
    usePageSessions().shownInTerminal === record.session.sessionId;
  const titleId = useId();
  const projectId = useId();
  return (
    <li
      className={`${entryClass} sidebar-entry${current ? " in-terminal" : ""}`}
    >
      <button
        type="button"
        className="sidebar-entry-open"
        aria-labelledby={`${titleId} ${projectId}`}
        aria-current={current || undefined}
        title={title}
        onClick={(event) => {
          onOpen({ record, control: event.currentTarget });
        }}
      />
      <h3 id={titleId} className="sidebar-title" title={title}>
        {title}
      </h3>
      <p id={projectId}>
        {sourceById(source)?.label ?? source} · {name}
      </p>
      {modelWords !== undefined && <p>{modelWords}</p>}
      <p>
        Launched <Moment at={new Date(record.launchedAt)} />
      </p>
      {stateWords}
    </li>
  );
}
