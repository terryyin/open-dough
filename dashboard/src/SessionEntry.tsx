// One Claude Code session this dashboard's server launched, shown the same
// way wherever the page lists it: on its story's card (`./CardLaunches.tsx`)
// and in Recent sessions (`./RecentSessions.tsx`). An entry gives its
// session's state as Claude Code last listed it, its workflow, when it was
// launched, its session, and Open terminal (`./LaunchSession.tsx`); a session
// the developer marked done is Done, under its `done-` name. An entry names
// its story's title and identity unless it is listed on the story's own card,
// where it offers Mark as done through the page's one operation
// (`./TerminalSplit.tsx`). A Recent sessions entry can take the keyboard when
// the control that last had it is gone. Entries are local evidence of
// launches, not story facts.

import { useEffect, useRef } from "react";
import {
  launchWorkflows,
  sessionRuns,
  type LaunchWithState,
  type SessionState,
} from "./agentLaunch.ts";
import { doneSessionName } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import { LaunchSession } from "./LaunchSession.tsx";
import {
  notMarkedDone,
  showsSession,
  useMarking,
  usePageSessions,
} from "./terminalOpening.ts";
import "./agent-launch.css";

// How an entry names its session's state as Claude Code last listed it. A
// running session is Working while busy and Idle otherwise, whatever its
// state, even once marked done, since opening a done session wakes it; one no
// longer running, or no longer listed, is Done once marked done; otherwise one
// not running is Finished once Claude Code calls it done, and Stopped.
function sessionStateWords(
  sessionState: SessionState,
  markedDone: boolean,
): {
  readonly label: string;
  readonly note?: string;
} {
  switch (sessionState.kind) {
    case "unknown":
      return {
        label: "State unknown",
        note: "Claude Code's session list could not be read",
      };
    case "unlisted":
      return { label: markedDone ? "Done" : "Session unavailable" };
    case "listed":
      if (sessionRuns(sessionState)) {
        return { label: sessionState.status === "busy" ? "Working" : "Idle" };
      }
      if (markedDone) {
        return { label: "Done" };
      }
      return { label: sessionState.state === "done" ? "Finished" : "Stopped" };
  }
}

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
  const { title, identity, workflow } = record.request;
  const { name } = launchWorkflows[workflow];
  const markedDone = record.doneAt !== undefined;
  const { label: state, note } = sessionStateWords(
    record.sessionState,
    markedDone,
  );

  useEffect(() => {
    if (takesFocus === true) entry.current?.focus();
  }, [takesFocus]);

  return (
    <article
      ref={entry}
      className="session-entry"
      aria-label={onCard ? `${name} session` : `${name} session for ${title}`}
      tabIndex={-1}
      {...(onCard ? {} : showsSession(record.session.sessionId))}
    >
      {!onCard && (
        <>
          <h3>{title}</h3>
          <p className="card-identity">{identity}</p>
        </>
      )}
      <p className="session-state">
        {state}
        {note !== undefined && <span className="quiet">: {note}</span>}
      </p>
      <p>
        {name} started in Claude Code{" "}
        <Moment at={new Date(record.launchedAt)} />
      </p>
      <p className="launch-local">
        Local: launched from this dashboard on this machine.
      </p>
      {markedDone && (
        <p>
          Named <code>{doneSessionName(record.session)}</code>
        </p>
      )}
      <LaunchSession record={record} />
      {onCard && <MarkDone record={record} />}
    </article>
  );
}

// A card entry's Mark as done; once marked, the entry leaves the card.
function MarkDone({ record }: { readonly record: LaunchWithState }) {
  const { markDone } = usePageSessions();
  const { marking, follow } = useMarking();
  return (
    <>
      <p className="launch-open">
        <button
          type="button"
          disabled={marking === "marking"}
          onClick={(event) => {
            follow(markDone({ record, opener: event.currentTarget }));
          }}
        >
          Mark as done
        </button>
      </p>
      <p role="status" className="launch-problem">
        {marking === "not-marked" && notMarkedDone}
      </p>
    </>
  );
}
