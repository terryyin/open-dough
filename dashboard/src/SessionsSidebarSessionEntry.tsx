import { sessionAccess, workspaceLimitation } from "./sessionAccess.ts";
import { sessionKey } from "./sessionReference.ts";
// One Sessions sidebar Session entry (`./SessionsSidebar.tsx`): on desktop, one line
// of story title, cut with an ellipsis when long, and, at the end, how long ago
// its session was launched — or, for a Done entry, how long ago it was marked
// done (`./sessionsSidebarElapsed.ts`). Its session's own state's kind shows by
// the style, thickness, and colour of its left border, with the state's label,
// hidden from sight, for assistive technology. An unread report shows apart
// from that state, by a message mark before the elapsed time and a faint tint
// across the entry, its words hidden from sight for assistive technology. The
// state as a card entry shows it (`shownSession`), with any unread report's
// words, the project and workflow, the model asked for, and the launch or
// completion time are its tooltip. With coarse input, Session details reveals
// those same facts, the full title and story identity before opening. The
// entry's row control is named by its title; in the open list and Running
// Cursor sessions it opens, going to its story and session (`./PageFrame.tsx`).
// In Recently done sessions the row control selects instead
// (`./recentlyDoneSelection.ts`): pressed, and ringed inside, while chosen,
// with a status while its done story is checked or cannot be; a separate
// Open terminal or Read final report control, shown only where that access is
// available, opens as the row did. It is current, and outlined, while the
// Side panel shows its session.

import { useId } from "react";
import { ChevronRight, MessageSquareText } from "lucide-react";
import { Icon, IconButton } from "./Icon.tsx";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import { sessionAccessControl } from "./LaunchSession.tsx";
import { projectLabel, useProjects } from "./projectList.tsx";
import { shownSession } from "./ShownSession.tsx";
import { sessionShown } from "./sessionShown.ts";
import { elapsedWords } from "./sessionsSidebarElapsed.ts";
import { useTickingNow } from "./useTickingNow.ts";
import { usePageSessions, type SessionOperation } from "./pageSessions.ts";
import type {
  RecentlyDoneChoice,
  RecentlyDoneRowSelection,
} from "./recentlyDoneSelection.ts";
import "./sessions-sidebar-session-entry.css";
import "./frame-controls.css";

// Often enough that a shown minute is never more than half a minute stale.
const sessionsSidebarTickMs = 30_000;

// Goes to an entry's story and session, asked by the entry's control.
export type OpenSessionsSidebarSessionEntry = SessionOperation<
  void,
  LaunchWithState
>;

// What a chosen row says while its done story is not known.
function choiceWords(choice: RecentlyDoneChoice | undefined) {
  return choice?.kind === "checking"
    ? "Checking for its published done story…"
    : choice?.kind === "unknown"
      ? `Its published done story could not be checked. ${choice.problem} Select again to check again.`
      : undefined;
}

export function SessionsSidebarSessionEntry({
  record,
  onOpen,
  selection,
}: {
  readonly record: LaunchWithState;
  readonly onOpen: OpenSessionsSidebarSessionEntry;
  // Present in Recently done sessions, where the row selects.
  readonly selection?: RecentlyDoneRowSelection;
}) {
  const projects = useProjects();
  const { source } = record.request;
  const { title, identity, name, modelWords } = launchSubject(record.request);
  const { entryClass, label, tone, unreadReportWords } = shownSession(record);
  const { note } = sessionShown(record);
  const launchedAt = new Date(record.launchedAt);
  const completedAt =
    record.doneAt === undefined ? undefined : new Date(record.doneAt);
  const ageAt = completedAt ?? launchedAt;
  const now = useTickingNow(sessionsSidebarTickMs);
  const { shownSession: inSidePanel, hostOperations } = usePageSessions();
  const key = sessionKey(record.session);
  const current = inSidePanel?.key === key;
  const choice = selection?.choice?.key === key ? selection.choice : undefined;
  const chosenWords = choiceWords(choice);
  const access =
    selection === undefined ? undefined : sessionAccess(record, hostOperations);
  const limitation = workspaceLimitation(record);
  const titleId = useId();
  const choiceId = useId();
  const whenWords =
    completedAt !== undefined
      ? `Completed ${completedAt.toLocaleString()}`
      : `${record.firstInput !== undefined && record.firstInput.state !== "confirmed" ? "Conversation created" : "Launched"} ${launchedAt.toLocaleString()}`;
  const facts = [
    ...(limitation === undefined ? [] : [limitation]),
    note === undefined ? label : `${label}: ${note}`,
    ...(unreadReportWords === undefined ? [] : [unreadReportWords]),
    `${projectLabel(projects, source)} · ${name}`,
    ...(modelWords === undefined ? [] : [modelWords]),
    whenWords,
  ];
  return (
    <li
      className={`${entryClass} sessions-sidebar-session-entry tone-${tone}${unreadReportWords === undefined ? "" : " has-unread-report"}${current ? " in-side-panel" : ""}${choice === undefined ? "" : " chosen"}`}
    >
      <button
        type="button"
        className="sessions-sidebar-session-entry-open"
        aria-labelledby={titleId}
        aria-current={current || undefined}
        {...(selection === undefined
          ? {}
          : {
              "aria-pressed": choice !== undefined,
              ...(chosenWords === undefined
                ? {}
                : { "aria-describedby": choiceId }),
            })}
        title={facts.join("\n")}
        onClick={(event) => {
          if (selection === undefined)
            onOpen({ record, control: event.currentTarget });
          else selection.onSelect(record);
        }}
      />
      <h3 id={titleId} className="sessions-sidebar-session-entry-title">
        {title}
      </h3>
      {unreadReportWords !== undefined && (
        <span
          role="img"
          className="sessions-sidebar-session-entry-unread-report"
          aria-label={unreadReportWords}
        >
          <MessageSquareText aria-hidden="true" />
        </span>
      )}
      <time
        className="sessions-sidebar-session-entry-elapsed"
        dateTime={ageAt.toISOString()}
        {...(completedAt === undefined
          ? {}
          : {
              // Distinguish completion age from open-list launch age for
              // assistive technology; Session details repeats the Completed
              // moment for touch discovery.
              "aria-label": `Completed ${elapsedWords(now - ageAt.getTime())} ago`,
            })}
      >
        {elapsedWords(now - ageAt.getTime())}
      </time>
      {access !== undefined && (
        <IconButton
          {...sessionAccessControl[access]}
          align="end"
          className="sessions-sidebar-session-entry-access"
          groupClassName="sessions-sidebar-session-entry-access-group"
          aria-describedby={titleId}
          onClick={(event) => {
            onOpen({ record, control: event.currentTarget, access });
          }}
        />
      )}
      <span className="visually-hidden">{label}</span>
      {chosenWords !== undefined && (
        <p
          id={choiceId}
          role="status"
          className="sessions-sidebar-session-entry-choice"
        >
          {chosenWords}
        </p>
      )}
      <details className="sessions-sidebar-session-entry-details frame-disclosure">
        <summary>
          <Icon icon={ChevronRight} />
          Session details
        </summary>
        <div className="sessions-sidebar-session-entry-facts">
          <p>{title}</p>
          {identity !== undefined && <p>{identity}</p>}
          {facts.map((fact) => (
            <p key={fact}>{fact}</p>
          ))}
        </div>
      </details>
    </li>
  );
}
