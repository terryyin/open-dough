import { hasCompletionMessage } from "./completionReport.ts";
import { sessionKey } from "./sessionReference.ts";
import { hostName, marksDone, marksLocalDone } from "./sessionCapabilities.ts";
// One kept session, shown consistently on cards and in either session column.
// Its native observations and supported controls stay distinct from story facts.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  establishedPlace,
  launchSubject,
  workspaceWords,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { doneSessionName, nativeDoneMarkPending } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import { shownSession } from "./ShownSession.tsx";
import { LaunchSession } from "./LaunchSession.tsx";
import { SessionAttentionMessage } from "./SessionAttentionMessage.tsx";
import { showsSession } from "./pageEntries.ts";
import { usePageSessions } from "./pageSessions.ts";
import {
  DeleteRecord,
  MarkDone,
  RecoverSession,
  StopSession,
} from "./sessionRecordActions.tsx";
import { SessionAssignment } from "./SessionAssignment.tsx";
import type { AgentAssignment } from "./agentAssignments.ts";
import "./agent-launch.css";

export function SessionEntry({
  record,
  onStoryCard,
  takesFocus,
  storyCardAssignments,
}: {
  readonly record: LaunchWithState;
  // Set where the entry is listed on its story's card, which names the story.
  readonly onStoryCard: boolean;
  // Given where the developer's own launch lists the entry, so the keyboard
  // can land on it; set, it takes the keyboard.
  readonly takesFocus?: boolean;
  readonly storyCardAssignments?: readonly AgentAssignment[] | undefined;
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
    establishedPlace(record),
    record.shownWorkspace,
  );
  const markedDone = record.doneAt !== undefined;
  const { entryClass, stateWords } = shownSession(record);
  const { shownSession: shown, hostOperations } = usePageSessions();
  // Supported native done operations use the same intended name for every Done.
  // A local-only Done attempts no native naming, so it claims none.
  const localDone = marksLocalDone(hostOperations, record.session.host);
  const nativelyNamed =
    !localDone &&
    (record.completion === undefined ||
      marksDone(hostOperations, record.session.host));
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
      aria-label={
        onStoryCard ? `${name} session` : `${name} session for ${title}`
      }
      tabIndex={-1}
      {...showsSession(sessionKey(record.session))}
    >
      {!onStoryCard && (
        <>
          <h3>{title}</h3>
          {identity !== undefined && (
            <p className="record-identity">{identity}</p>
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
      <SessionAssignment
        record={record}
        storyCardAssignments={storyCardAssignments}
      />
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
      {markedDone && localDone && (
        <p>
          Done is a dashboard-local name only; marking it done did not stop the
          native session.
        </p>
      )}
      {record.doneProblem !== undefined && (
        // A pending native mark is still to come, not a problem.
        <p
          role="status"
          className={
            record.doneProblem === nativeDoneMarkPending
              ? undefined
              : "launch-problem"
          }
        >
          {record.doneProblem}
        </p>
      )}
      {record.stopUnconfirmed !== undefined && (
        <p role="status" className="launch-problem">
          {record.stopUnconfirmed}
        </p>
      )}
      <LaunchSession record={record} />
      <StopSession record={record} say={say} />
      <RecoverSession record={record} say={say} />
      <MarkDone record={record} say={say} />
      <DeleteRecord record={record} say={say} />
      <p role="status" className="launch-problem">
        {said}
      </p>
    </article>
  );
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
// done shows: on a Story card (`./StoryCardSessions.tsx`), without the story the
// card names, or on a done story's card (`./DoneStoryCard.tsx`). With none it
// shows nothing. The entry the developer's own launch from the card just
// listed takes the keyboard.
export function StorySessions({
  sessions,
  className,
  onStoryCard,
  launchedHere,
  storyCardAssignments,
}: {
  // The story's sessions, oldest first.
  readonly sessions: readonly LaunchWithState[];
  readonly className: string;
  readonly onStoryCard: boolean;
  readonly launchedHere?: string | undefined;
  readonly storyCardAssignments?: readonly AgentAssignment[] | undefined;
}) {
  if (sessions.length === 0) return null;
  return (
    <ol className={className} aria-label="Sessions">
      {sessions.toReversed().map((record) => (
        <li key={sessionKey(record.session)}>
          <SessionEntry
            record={record}
            onStoryCard={onStoryCard}
            takesFocus={launchedHere === sessionKey(record.session)}
            storyCardAssignments={storyCardAssignments}
          />
        </li>
      ))}
    </ol>
  );
}
