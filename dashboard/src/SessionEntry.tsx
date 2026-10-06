import { hasCompletionMessage } from "./completionReport.ts";
import { sessionKey } from "./sessionReference.ts";
import { hostName, marksDone } from "./sessionCapabilities.ts";
// One kept session, shown consistently on cards and in Recently done.
// Its native observations and supported controls stay distinct from story facts.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  launchSubject,
  workspaceWords,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { doneSessionName } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import {
  sessionShown,
  unreadReportWording,
  type SessionTone,
} from "./sessionShown.ts";
import { LaunchSession } from "./LaunchSession.tsx";
import { SessionAttentionMessage } from "./SessionAttentionMessage.tsx";
import { showsSession, usePageSessions } from "./pageSessions.ts";
import { DeleteRecord, MarkDone } from "./sessionRecordActions.tsx";
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
  const {
    title,
    identity,
    name,
    startedWords,
    modelWords,
    optionsWords,
    policyWords,
  } = launchSubject(record.request);
  const workspace = workspaceWords(
    record.start ?? record.preparation,
    record.shownWorkspace,
  );
  const markedDone = record.doneAt !== undefined;
  const { entryClass, stateWords } = shownSession(record);
  const { shownSession: shown, hostOperations } = usePageSessions();
  // Supported native done operations use the same intended name for every Done.
  const nativelyNamed =
    record.completion === undefined ||
    marksDone(hostOperations, record.session.host);
  const current = shown?.key === sessionKey(record.session);
  const inResult = current && shown.kind === "result";
  const inTerminal = current && shown.kind === "terminal";
  // The entry's status line, which says what its last mark or delete came to;
  // nothing clears it but the next control asking.
  const [said, say] = useState<string | undefined>();

  useEffect(() => {
    if (takesFocus === true) entry.current?.focus();
  }, [takesFocus]);

  return (
    <article
      ref={entry}
      className={current ? `${entryClass} in-terminal` : entryClass}
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
      {hasCompletionMessage(record.completion) && (
        <SessionAttentionMessage
          record={record}
          report={record.completion}
          say={say}
        />
      )}
      {inTerminal && <p className="shown-in-terminal">Shown in terminal</p>}
      {inResult && <p className="shown-in-terminal">Shown in final report</p>}
      <p>
        {record.firstInput !== undefined &&
        record.firstInput.state !== "confirmed"
          ? `Conversation created in ${hostName(record.session.host)}`
          : startedWords}{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      {modelWords !== undefined && <p>{modelWords}</p>}
      {optionsWords !== undefined && <p>{optionsWords}</p>}
      {policyWords !== undefined && <p>{policyWords}</p>}
      {workspace !== undefined && <p>{workspace}</p>}
      <p className="launch-local">
        Local: launched from this dashboard on this machine.
      </p>
      {markedDone && nativelyNamed && (
        <p>
          {record.doneProblem === undefined ? "Named" : "Intended name"}{" "}
          <code>{doneSessionName(record.session)}</code>
        </p>
      )}
      {record.doneProblem !== undefined && (
        <p role="status" className="launch-problem">
          {record.doneProblem}
        </p>
      )}
      <LaunchSession record={record} />
      {(onCard || record.doneProblem !== undefined) && (
        <MarkDone record={record} say={say} />
      )}
      <DeleteRecord record={record} say={say} />
      <p role="status" className="launch-problem">
        {said}
      </p>
    </article>
  );
}

// How every entry shows its session's state, by the one reading
// (`sessionShown`): the class that gives an entry needing the developer its
// heavier edge, the state's words, with an unread report's words in a line of
// their own, and its label, tone, and unread report's words, for an entry
// that marks its state by its own edge and its unread report by its own mark.
export function shownSession(record: LaunchWithState): {
  readonly entryClass: string;
  readonly stateWords: ReactNode;
  readonly label: string;
  readonly tone: SessionTone;
  readonly unreadReportWords?: string;
} {
  const { label, note, needsAttention, tone, unreadReport } =
    sessionShown(record);
  const unreadReportWords =
    unreadReport === undefined ? undefined : unreadReportWording(unreadReport);
  return {
    label,
    tone,
    ...(unreadReportWords === undefined ? {} : { unreadReportWords }),
    entryClass: needsAttention
      ? "session-entry needs-attention"
      : "session-entry",
    stateWords: (
      <>
        <p className="session-state">
          {label}
          {note !== undefined && <span className="quiet">: {note}</span>}
        </p>
        {unreadReportWords !== undefined && (
          <p className="session-unread-report">{unreadReportWords}</p>
        )}
      </>
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

// A story's sessions inside its card, newest first, each the entry Recently
// done shows: on a work card (`./CardSessions.tsx`), without the story the
// card names, or on a done story's card (`./DoneStoryCard.tsx`). With none it
// shows nothing. The entry the developer's own launch from the card just
// listed takes the keyboard.
export function StorySessions({
  sessions,
  className,
  onCard,
  launchedHere,
}: {
  // The story's sessions, oldest first.
  readonly sessions: readonly LaunchWithState[];
  readonly className: string;
  readonly onCard: boolean;
  readonly launchedHere?: string | undefined;
}) {
  if (sessions.length === 0) return null;
  return (
    <ol className={className} aria-label="Sessions">
      {sessions.toReversed().map((record) => (
        <li key={sessionKey(record.session)}>
          <SessionEntry
            record={record}
            onCard={onCard}
            takesFocus={launchedHere === sessionKey(record.session)}
          />
        </li>
      ))}
    </ol>
  );
}
