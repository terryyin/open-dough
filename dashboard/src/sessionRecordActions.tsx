// Record actions shared by card and Recently done entries. Each says what
// it came to through the entry's one status line (`say`), which nothing clears
// but the next control asking.
import { hostName, marksRecordDone } from "./sessionCapabilities.ts";
import { recordDeletable, type LaunchWithState } from "./agentLaunch.ts";
import {
  doneAnswers,
  notDeleted,
  notMarkedDone,
  nowKnown,
  useDoneMark,
  usePageSessions,
} from "./pageSessions.ts";
import { AskInPlace } from "./AskInPlace.tsx";

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
  const { asksFirst, marking, mark } = useDoneMark(record);
  if (!marksRecordDone(hostOperations, record)) return null;
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
        return mark(markDone({ record, control }), (marked) => {
          if (!marked) say(notMarkedDone);
        });
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
