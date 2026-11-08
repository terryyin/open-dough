import { hasCompletionMessage } from "./completionReport.ts";
import { sessionKey } from "./sessionReference.ts";
import {
  hostName,
  marksLocalDone,
  offersMarkDone,
} from "./sessionCapabilities.ts";
// One kept session, shown consistently on cards and in either session column.
// Its native observations and supported controls stay distinct from story facts.
// A retained (done) session shows its listing facts; any of its controls asks
// the page's history read for its full entry (`./retainedHistory.ts`).
// The session chosen as a standalone Recently done sessions row is marked
// selected (`./recentlyDoneSelection.ts`), apart from the Side panel's mark.

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronRight, Ellipsis } from "lucide-react";
import { Icon, IconButton } from "./Icon.tsx";
import {
  launchSubject,
  recordDeletable,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { nativeDoneMarkPending } from "./doneMark.ts";
import { shownSession } from "./ShownSession.tsx";
import { LaunchSession, LaunchSessionNotice } from "./LaunchSession.tsx";
import { SessionAttentionMessage } from "./SessionAttentionMessage.tsx";
import { showsSession } from "./pageEntries.ts";
import { usePageSessions } from "./pageSessions.ts";
import {
  DeleteRecord,
  MarkDone,
  RecoverSession,
  StopSession,
  offersStopSession,
} from "./sessionRecordActions.tsx";
import { SessionDetails } from "./SessionDetails.tsx";
import type { AgentAssignment } from "./agentAssignments.ts";
import { assignedAgent } from "./launchRecord.ts";
import { useFrameDescription } from "./protectedFrame.ts";
import { useReadRetainedHistory } from "./retainedHistory.ts";
import { useChosenSession } from "./recentlyDoneSelection.ts";
import "./agent-launch.css";

export function SessionEntry({
  record,
  onStoryCard,
  takesFocus,
  storyCardAssignments,
  followUp,
}: {
  readonly record: LaunchWithState;
  // Set where the entry is listed on its story's card, which names the story.
  readonly onStoryCard: boolean;
  // Given where the developer's own launch lists the entry, so the keyboard
  // can land on it; set, it takes the keyboard.
  readonly takesFocus?: boolean;
  readonly storyCardAssignments?: readonly AgentAssignment[] | undefined;
  // Given where the entry offers Follow up beside its primary action
  // (`./FollowUp.tsx`).
  readonly followUp?: ReactNode;
}) {
  const entry = useRef<HTMLElement>(null);
  const { title, identity, name, modelWords } = launchSubject(record.request);
  const assignment =
    onStoryCard && storyCardAssignments?.length === 1
      ? storyCardAssignments[0]
      : undefined;
  const repeatedHost =
    assignment !== undefined &&
    assignment.agent === assignedAgent(record.start ?? record.preparation) &&
    assignment.host === record.session.host;
  const repeatedModel =
    repeatedHost &&
    record.request.model !== undefined &&
    assignment.model === record.request.model;
  const markedDone = record.doneAt !== undefined;
  const { entryClass, stateWords } = shownSession(record);
  const { shownSession: shown, hostOperations } = usePageSessions();
  const localDone = marksLocalDone(hostOperations, record.session.host);
  const key = sessionKey(record.session);
  const current = shown?.key === key;
  const chosen = useChosenSession(key);
  const inFinalReport = current && shown.kind === "final-report";
  const inTerminal = current && shown.kind === "terminal";
  // The entry's status line, which says what its last mark or delete came to;
  // nothing clears it but the next control asking.
  const [said, say] = useState<string | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsControl = useRef<HTMLButtonElement>(null);
  const detailsId = useId();
  const actionsId = useId();
  const described = useFrameDescription();
  const readHistory = useReadRetainedHistory();
  const hasActions =
    offersStopSession(record, hostOperations) ||
    offersMarkDone(hostOperations, record) ||
    recordDeletable(record);

  useEffect(() => {
    if (takesFocus === true) entry.current?.focus();
  }, [takesFocus]);

  return (
    <article
      ref={entry}
      className={[
        entryClass,
        current && "in-side-panel",
        chosen && "selected-session",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        onStoryCard ? `${name} session` : `${name} session for ${title}`
      }
      tabIndex={-1}
      {...showsSession(key)}
      {...(markedDone ? { onClickCapture: readHistory } : {})}
    >
      {!onStoryCard && (
        <>
          <h3>{title}</h3>
          {identity !== undefined && (
            <p className="record-identity">{identity}</p>
          )}
        </>
      )}
      <div className="session-entry-summary">
        <div className="session-entry-summary-facts">
          {stateWords}
          {!repeatedHost && (
            <p className="session-entry-host">
              {hostName(record.session.host)}
            </p>
          )}
          {!repeatedModel && modelWords !== undefined && (
            <p className="session-entry-model">{modelWords}</p>
          )}
        </div>
        {hasActions && (
          <IconButton
            ref={actionsControl}
            label="More session actions"
            icon={Ellipsis}
            align="end"
            aria-expanded={actionsOpen}
            aria-controls={actionsId}
            aria-describedby={described}
            onClick={() => {
              setActionsOpen(!actionsOpen);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && actionsOpen) {
                event.stopPropagation();
                setActionsOpen(false);
              }
            }}
          />
        )}
      </div>
      {hasCompletionMessage(record.completion) && (
        <SessionAttentionMessage
          record={record}
          report={record.completion}
          say={say}
        />
      )}
      {chosen && <p className="selected-session-content">Selected session</p>}
      {inTerminal && <p className="shown-session-content">Shown in terminal</p>}
      {inFinalReport && (
        <p className="shown-session-content">Shown in final report</p>
      )}
      <LaunchSessionNotice record={record} />
      <div className="session-entry-controls">
        <LaunchSession record={record} />
        {followUp}
        <RecoverSession record={record} say={say} />
        <button
          type="button"
          className="session-details-toggle frame-disclosure-button"
          aria-expanded={detailsOpen}
          aria-controls={detailsId}
          aria-describedby={described}
          onClick={() => {
            setDetailsOpen(!detailsOpen);
          }}
        >
          <Icon icon={ChevronRight} />
          Session details
        </button>
      </div>
      <div
        className="session-entry-details"
        id={detailsId}
        hidden={!detailsOpen}
      >
        <SessionDetails
          record={record}
          say={say}
          open={detailsOpen}
          storyCardAssignments={storyCardAssignments}
          modelInDetails={repeatedModel}
        />
      </div>
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
      <div
        id={actionsId}
        className="session-entry-actions"
        hidden={!actionsOpen || !hasActions}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.stopPropagation();
          setActionsOpen(false);
          actionsControl.current?.focus();
        }}
      >
        <StopSession record={record} say={say} />
        <MarkDone record={record} say={say} />
        <DeleteRecord record={record} say={say} />
      </div>
      <p role="status" className="launch-problem">
        {said}
      </p>
    </article>
  );
}
