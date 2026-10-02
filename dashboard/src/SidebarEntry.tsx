import { workspaceLimitation } from "./sessionAccess.ts";
import { sessionKey } from "./sessionReference.ts";
// One Sessions sidebar entry (`./SessionSidebar.tsx`): one line, its story's
// title, cut with an ellipsis when it is long, and, at the end, how long ago
// its session was launched (`./sidebarElapsed.ts`). Its state's kind shows by
// the style, thickness, and colour of its left border, with the state's label,
// hidden from sight, for assistive technology; the state as a card entry
// shows it (`shownSession`), the project and workflow, the model asked for,
// and the launch time are its tooltip. The entry is one control over its
// whole area, named by its title; opening it goes to its story and its
// session (`./TerminalSplit.tsx`). It is current, and outlined, while the
// page's session panel shows its session.

import { useId } from "react";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import { useProjects } from "./projectList.tsx";
import { shownSession } from "./SessionEntry.tsx";
import { sessionShown } from "./sessionShown.ts";
import { elapsedWords } from "./sidebarElapsed.ts";
import { useTickingNow } from "./useTickingNow.ts";
import { usePageSessions, type SessionOperation } from "./pageSessions.ts";

// Often enough that a shown minute is never more than half a minute stale.
const sidebarTickMs = 30_000;

// Goes to an entry's story and session, asked by the entry's control.
export type OpenSidebarEntry = SessionOperation<void, LaunchWithState>;

export function SidebarEntry({
  record,
  onOpen,
}: {
  readonly record: LaunchWithState;
  readonly onOpen: OpenSidebarEntry;
}) {
  const projects = useProjects();
  const { source } = record.request;
  const { title, name, modelWords } = launchSubject(record.request);
  const { entryClass, label, tone } = shownSession(record);
  const { note } = sessionShown(record);
  const launchedAt = new Date(record.launchedAt);
  const now = useTickingNow(sidebarTickMs);
  const current =
    usePageSessions().shownSession?.key === sessionKey(record.session);
  const limitation = workspaceLimitation(record);
  const titleId = useId();
  const tooltip = [
    ...(limitation === undefined ? [] : [limitation]),
    note === undefined ? label : `${label}: ${note}`,
    `${projects.find((project) => project.id === source)?.label ?? source} · ${name}`,
    ...(modelWords === undefined ? [] : [modelWords]),
    `${record.firstInput !== undefined && record.firstInput.state !== "confirmed" ? "Conversation created" : "Launched"} ${launchedAt.toLocaleString()}`,
  ].join("\n");
  return (
    <li
      className={`${entryClass} sidebar-entry tone-${tone}${current ? " in-terminal" : ""}`}
    >
      <button
        type="button"
        className="sidebar-entry-open"
        aria-labelledby={titleId}
        aria-current={current || undefined}
        title={tooltip}
        onClick={(event) => {
          onOpen({ record, control: event.currentTarget });
        }}
      />
      <h3 id={titleId} className="sidebar-title">
        {title}
      </h3>
      <time className="sidebar-elapsed" dateTime={launchedAt.toISOString()}>
        {elapsedWords(now - launchedAt.getTime())}
      </time>
      <span className="visually-hidden">{label}</span>
    </li>
  );
}
