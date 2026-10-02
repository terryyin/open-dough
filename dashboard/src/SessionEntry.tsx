import { completionLabel } from "./completionReport.ts";
import { sessionKey } from "./sessionReference.ts";
import { hostName } from "./sessionCapabilities.ts";
// One kept session, shown consistently on cards and in Recent sessions.
// Its native observations and supported controls stay distinct from story facts.

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
    record.request,
    record.start ?? record.preparation,
  );
  const markedDone = record.doneAt !== undefined;
  const { entryClass, stateWords } = shownSession(record);
  const { shownSession: shown } = usePageSessions();
  const current = shown?.key === sessionKey(record.session);
  const inResult = current && shown.kind === "result";
  const inTerminal = current && shown.kind === "terminal";

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
      {record.completion !== undefined && (
        <div className="session-attention-message">
          <p>{completionLabel(record.completion)}</p>
          <pre>{record.completion.message}</pre>
        </div>
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
      {markedDone && record.completion === undefined && (
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
