// One Claude Code session this dashboard's server launched, shown the same
// way wherever the page lists it: on its story's card (`./CardLaunches.tsx`)
// and in Recent sessions (`./RecentSessions.tsx`); the Sessions sidebar
// (`./SessionSidebar.tsx`) shows its state the same way (`shownSession`) and
// says the same while the sessions are unread or none are kept
// (`SessionList`). An entry gives its
// session's state as Claude Code last listed it, read once by `sessionShown`,
// marked, when the developer is needed there, by a solid edge beside that
// text; its workflow, when it was launched, its session, and Open terminal
// (`./LaunchSession.tsx`); a session the developer marked done is Done, under
// its `done-` name. An entry names its story's title and identity unless it
// is listed on the story's own card, where it offers Mark as done through the
// page's one operation (`./TerminalSplit.tsx`), and, while its session shows
// State unknown, "Delete record…", which asks before it deletes. While the
// page's terminal shows its session, an entry says "Shown in terminal",
// outlined in Recent sessions, and the card listing it is outlined. Every
// entry names its session, so a Recent sessions entry can take the keyboard
// when the control that last had it is gone. Entries are local evidence of
// launches, not story facts.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { launchWorkflows, type LaunchWithState } from "./agentLaunch.ts";
import { doneSessionName } from "./doneMark.ts";
import { Moment } from "./Moment.tsx";
import { sessionShown } from "./sessionShown.ts";
import { LaunchSession } from "./LaunchSession.tsx";
import {
  notMarkedDone,
  showsSession,
  useMarking,
  usePageSessions,
} from "./pageSessions.ts";
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
  const { title, identity, workflow } = record.request;
  const { name } = launchWorkflows[workflow];
  const markedDone = record.doneAt !== undefined;
  const { entryClass, stateWords } = shownSession(record);
  const inTerminal =
    usePageSessions().shownInTerminal === record.session.sessionId;

  useEffect(() => {
    if (takesFocus === true) entry.current?.focus();
  }, [takesFocus]);

  return (
    <article
      ref={entry}
      className={inTerminal ? `${entryClass} in-terminal` : entryClass}
      aria-label={onCard ? `${name} session` : `${name} session for ${title}`}
      tabIndex={-1}
      {...showsSession(record.session.sessionId)}
    >
      {!onCard && (
        <>
          <h3>{title}</h3>
          <p className="card-identity">{identity}</p>
        </>
      )}
      {stateWords}
      {inTerminal && <p className="shown-in-terminal">Shown in terminal</p>}
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
      {onCard && record.sessionState.kind === "unknown" && (
        <DeleteRecord record={record} />
      )}
    </article>
  );
}

// How every entry shows its session's state, by the one reading
// (`sessionShown`): the class that gives an entry needing the developer its
// heavier edge, and the state's words.
export function shownSession(record: LaunchWithState): {
  readonly entryClass: string;
  readonly stateWords: ReactNode;
} {
  const { label, note, needsAttention } = sessionShown(record);
  return {
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
            follow(markDone({ record, control: event.currentTarget }));
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

// A card entry's Delete record…, offered while its state is unknown: it asks
// in place, with the keyboard on Keep, before the record is deleted. Keep and
// Escape put the button back with the keyboard on it. A deleted record takes
// the entry off the page.
function DeleteRecord({ record }: { readonly record: LaunchWithState }) {
  const { deleteRecord } = usePageSessions();
  const [step, setStep] = useState<"idle" | "asking" | "deleting">("idle");
  const button = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const restoring = useRef(false);

  useEffect(() => {
    if (step === "asking") keep.current?.focus();
    if (step === "idle" && restoring.current) {
      restoring.current = false;
      button.current?.focus();
    }
  }, [step]);

  const keepRecord = () => {
    restoring.current = true;
    setStep("idle");
  };

  if (step === "idle") {
    return (
      <p className="launch-open">
        <button
          ref={button}
          type="button"
          onClick={() => {
            setStep("asking");
          }}
        >
          Delete record…
        </button>
      </p>
    );
  }
  return (
    <div
      className="launch-open delete-question"
      onKeyDown={(event) => {
        if (event.key === "Escape" && step === "asking") {
          event.stopPropagation();
          keepRecord();
        }
      }}
    >
      <p>
        Delete this session&apos;s dashboard record? The conversation stays in
        Claude Code; a running session keeps running.
      </p>
      <p className="delete-question-actions">
        <button
          type="button"
          disabled={step === "deleting"}
          onClick={(event) => {
            setStep("deleting");
            void deleteRecord({
              record,
              control: event.currentTarget,
            }).then((deleted) => {
              if (!deleted) setStep("asking");
            });
          }}
        >
          Delete record
        </button>
        <button
          ref={keep}
          type="button"
          disabled={step === "deleting"}
          onClick={keepRecord}
        >
          Keep
        </button>
      </p>
    </div>
  );
}
