import { sessionKey } from "./sessionReference.ts";
// One Claude Code session this dashboard's server launched, shown the same
// way wherever the page lists it: on its story's card (`./CardLaunches.tsx`)
// and in Recent sessions (`./RecentSessions.tsx`); the Sessions sidebar
// (`./SessionSidebar.tsx`) shows its state the same way (`shownSession`) and
// says the same while the sessions are unread or none are kept
// (`SessionList`). An entry gives its
// session's state as Claude Code last listed it, read once by `sessionShown`,
// marked, when the developer is needed there, by a solid edge beside that
// text; its workflow and the model it asked for, if any, when it was
// launched, the workspace its start established, if any, its session, and Open terminal (`./LaunchSession.tsx`); a
// session the developer marked done is Done, under its `done-` name. An entry names its story's title and identity unless it
// is listed on the story's own card or is an ad hoc session (no story), where it offers Mark as done through the
// page's one operation (`./TerminalSplit.tsx`); on a card or in Recent
// sessions, while its session shows State unknown or Session unavailable, it
// offers "Delete record…", which asks before it deletes. While the page's terminal shows its session,
// an entry says "Shown in terminal", outlined in Recent sessions, and the
// card listing it is outlined. Every entry names its session, so the Sessions
// sidebar can find and reveal it when no card lists it. Entries are local
// evidence of launches, not story facts.

import { useEffect, useRef, type ReactNode } from "react";
import {
  launchSubject,
  workspaceWords,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { doneSessionName } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import { sessionShown, type SessionTone } from "./sessionShown.ts";
import { LaunchSession } from "./LaunchSession.tsx";
import { showsSession, usePageSessions } from "./pageSessions.ts";
import { CardActions, RecentActions } from "./sessionRecordActions.tsx";
import "./agent-launch.css";

export function SessionEntry({
  record,
  onCard,
  takesFocus,
}: {
  readonly record: LaunchWithState;
  // Set where the entry is listed on its story's card, which names the story.
  readonly onCard: boolean;
  // Given where the developer's own launch lists the entry, so the keyboard
  // can land on it; set, it takes the keyboard.
  readonly takesFocus?: boolean;
}) {
  const entry = useRef<HTMLElement>(null);
  const { title, identity, name, startedWords, modelWords, optionsWords } =
    launchSubject(record.request);
  const workspace = workspaceWords(
    record.request,
    record.start ?? record.preparation,
  );
  const markedDone = record.doneAt !== undefined;
  const { entryClass, stateWords } = shownSession(record);
  const inTerminal =
    usePageSessions().shownInTerminal === sessionKey(record.session);

  useEffect(() => {
    if (takesFocus === true) entry.current?.focus();
  }, [takesFocus]);

  return (
    <article
      ref={entry}
      className={inTerminal ? `${entryClass} in-terminal` : entryClass}
      aria-label={onCard ? `${name} session` : `${name} session for ${title}`}
      tabIndex={-1}
      {...showsSession(sessionKey(record.session))}
    >
      {!onCard && (
        <>
          <h3>{title}</h3>
          {identity !== undefined && (
            <p className="card-identity">{identity}</p>
          )}
        </>
      )}
      {stateWords}
      {inTerminal && <p className="shown-in-terminal">Shown in terminal</p>}
      <p>
        {startedWords} <Moment at={new Date(record.launchedAt)} />
      </p>
      {modelWords !== undefined && <p>{modelWords}</p>}
      {optionsWords !== undefined && <p>{optionsWords}</p>}
      {workspace !== undefined && <p>{workspace}</p>}
      <p className="launch-local">
        Local: launched from this dashboard on this machine.
      </p>
      {markedDone && (
        <p>
          Named <code>{doneSessionName(record.session)}</code>
        </p>
      )}
      <LaunchSession record={record} />
      {onCard ? (
        <CardActions record={record} />
      ) : (
        <RecentActions record={record} />
      )}
    </article>
  );
}

// How every entry shows its session's state, by the one reading
// (`sessionShown`): the class that gives an entry needing the developer its
// heavier edge, the state's words, and its label and tone, for an entry that
// marks its state by its own edge.
export function shownSession(record: LaunchWithState): {
  readonly entryClass: string;
  readonly stateWords: ReactNode;
  readonly label: string;
  readonly tone: SessionTone;
} {
  const { label, note, needsAttention, tone } = sessionShown(record);
  return {
    label,
    tone,
    entryClass: needsAttention
      ? "session-entry needs-attention"
      : "session-entry",
    stateWords: (
      <p className="session-state">
        {label}
        {note !== undefined && <span className="quiet">: {note}</span>}
      </p>
    ),
  };
}

// A list of the machine's sessions: until they are first read it says it is
// reading them rather than claiming none, and with none it says none are
// kept; otherwise it lists them.
export function SessionList({
  sessions,
  none = "No sessions launched from this dashboard are kept.",
  children,
}: {
  // Undefined until the machine's sessions are first read.
  readonly sessions: readonly LaunchWithState[] | undefined;
  // What the list says once read with no sessions to list.
  readonly none?: string;
  readonly children: (sessions: readonly LaunchWithState[]) => ReactNode;
}) {
  if (sessions === undefined) {
    return <p className="quiet">Reading sessions…</p>;
  }
  if (sessions.length === 0) {
    return <p className="quiet">{none}</p>;
  }
  return children(sessions);
}
