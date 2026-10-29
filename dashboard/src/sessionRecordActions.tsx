// Record actions shared by card and Recently done entries. Each says what
// it came to through the entry's one status line (`say`), which nothing clears
// but the next control asking.
import {
  hostName,
  marksLocalDone,
  offersMarkDone,
  offersSeparateStop,
  type HostOperations,
} from "./sessionCapabilities.ts";
import { recordDeletable, type LaunchWithState } from "./agentLaunch.ts";
import {
  doneAnswers,
  markDoneUnresolved,
  notDeleted,
  notMarkedDone,
  nowKnown,
  useDoneMark,
  usePageSessions,
} from "./pageSessions.ts";
import { sessionRecoverable } from "./sessionRecovery.ts";
import { AskInPlace } from "./AskInPlace.tsx";
import { useFrameDescription } from "./protectedFrame.ts";
import { useState } from "react";

// A card entry's Mark as done, whenever its session can be marked done, an
// unread report included. Once marked done, the entry leaves the card. On a
// session whose intended work is not known to be complete it asks first, in
// place, as Delete record… does (`useDoneMark`); a refused mark says so and
// puts the control back with the keyboard on it, and the next press asks
// again.
export function MarkDone({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
}) {
  const { markDone, hostOperations } = usePageSessions();
  const { asksFirst, marking, mark } = useDoneMark(record, hostOperations);
  if (!offersMarkDone(hostOperations, record)) return null;
  return (
    <AskInPlace
      label="Mark as done"
      disabled={marking === "marking"}
      question={asksFirst}
      {...doneAnswers}
      onPress={() => {
        say(undefined);
      }}
      act={(control) => {
        say(undefined);
        const asked = markDone({ record, control });
        void asked.then((outcome) => {
          if (outcome === "refused") say(notMarkedDone);
          if (outcome === "unresolved") say(markDoneUnresolved);
        });
        return mark(asked);
      }}
    />
  );
}

// A card or Recently done entry's Delete record…, offered only while its
// state is unknown or unavailable (`recordDeletable`); the Sessions sidebar's
// entries offer none. It asks in place, with the keyboard on Keep, before the
// record is deleted. Keep and Escape put the button back with the keyboard on
// it. A deleted record takes the entry off the page. A refused or failed
// delete says so in the entry's status line and leaves the buttons and the
// keyboard where they were; a state read as known meanwhile takes the
// question away and says so.
export function DeleteRecord({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
}) {
  const { deleteRecord } = usePageSessions();
  if (!recordDeletable(record)) return null;
  return (
    <AskInPlace
      label="Delete record…"
      question={`Delete this session's dashboard record? The conversation stays in ${hostName(record.session.host)}; a running session keeps running.`}
      confirm="Delete record"
      keep="Keep"
      onPress={() => {
        say(undefined);
      }}
      act={(control) => {
        say(undefined);
        return deleteRecord({ record, control }).then((outcome) => {
          if (outcome.kind === "deleted") return "settled";
          if (outcome.kind === "failed") {
            say(
              outcome.reason === undefined
                ? notDeleted
                : `${notDeleted} ${outcome.reason}`,
            );
            return "retry";
          }
          say(nowKnown);
          return "withdrawn";
        });
      }}
    />
  );
}

const notStopped = "The session could not be stopped.";
const stoppedWording = "Session stopped.";

// Shared by the action and its disclosure: capability and retained Done intent
// together decide whether a separate Stop is available on this entry.
export function offersStopSession(
  record: LaunchWithState,
  operations: HostOperations,
): boolean {
  return (
    (record.doneAt === undefined ||
      marksLocalDone(operations, record.session.host)) &&
    offersSeparateStop(operations, record.session.host)
  );
}

// Stop for an active (not done) session, offered only where a separate
// stop is needed (`offersSeparateStop`): its host supplies a stop that
// Mark as done does not already perform, so hosts whose Mark as done
// stops the session gain no duplicate control. It never writes the done
// mark. A confirmed stop says so; an
// unconfirmed one says why, with the remaining state named, and that
// explanation is also retained on the record.
export function StopSession({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
}) {
  const { stopSession, hostOperations } = usePageSessions();
  const described = useFrameDescription();
  const [stopping, setStopping] = useState(false);
  // A local-only Done did not stop the native session, so Stop stays
  // offered on its done entry; other hosts' done entries offer none.
  if (!offersStopSession(record, hostOperations)) return null;
  return (
    <p className="launch-open">
      <button
        type="button"
        disabled={stopping}
        aria-describedby={described}
        onClick={(event) => {
          say(undefined);
          setStopping(true);
          void stopSession({
            record,
            control: event.currentTarget,
          }).then((answer) => {
            setStopping(false);
            if (answer === undefined) {
              say(notStopped);
              return;
            }
            say(
              answer.kind === "stopped" ? stoppedWording : answer.explanation,
            );
          });
        }}
      >
        Stop
      </button>
    </p>
  );
}

const notRecovered = "The session could not be recovered.";

// Recover for an unfinished Cursor session the runner does not hold. It sits
// outside `.session-state` on the same entry surfaces as Delete record.
export function RecoverSession({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
}) {
  const { recoverSession } = usePageSessions();
  const described = useFrameDescription();
  const [recovering, setRecovering] = useState(false);
  if (!sessionRecoverable(record)) return null;
  return (
    <p className="launch-open">
      <button
        type="button"
        disabled={recovering}
        aria-describedby={described}
        onClick={(event) => {
          say(undefined);
          setRecovering(true);
          void recoverSession({
            record,
            control: event.currentTarget,
          }).then((answer) => {
            setRecovering(false);
            if (answer === undefined) {
              say(notRecovered);
              return;
            }
            if (answer.kind === "failed") say(answer.explanation);
          });
        }}
      >
        Recover
      </button>
    </p>
  );
}
