// Record actions shared by card and Recent sessions entries.
import { hostName, marksRecordDone } from "./sessionCapabilities.ts";
import { useState } from "react";
import { recordDeletable, type LaunchWithState } from "./agentLaunch.ts";
import {
  doneAnswers,
  notDeleted,
  nowKnown,
  usePageSessions,
  useReportOrDoneMark,
} from "./pageSessions.ts";
import { AskInPlace } from "./AskInPlace.tsx";

// A card entry's Mark as read while its report is unread, else its Mark as
// done, and its Delete record… while its state is unknown or unavailable,
// with the one status line that says what any could not do or found. Once
// read, the entry stays and offers Mark as done in the same place; once
// marked done or deleted, the entry leaves the card. Mark as done on a session
// whose intended work is not known to be complete asks first, in place, as
// Delete record… does; a refused mark puts the control back with the keyboard
// on it, and the next press asks again.
export function CardActions({ record }: { readonly record: LaunchWithState }) {
  const { markDone, markRead, hostOperations } = usePageSessions();
  const { label, asksFirst, marking, notMarkedSaid, mark } =
    useReportOrDoneMark(record);
  const [deleteSaid, setDeleteSaid] = useState<string | undefined>();
  return (
    <>
      {marksRecordDone(hostOperations, record) && (
        <AskInPlace
          label={label}
          disabled={marking === "marking"}
          question={asksFirst}
          {...doneAnswers}
          onPress={() => {
            setDeleteSaid(undefined);
          }}
          act={(control) => {
            const request = { record, control };
            return mark(
              () => markRead(request),
              () => markDone(request),
            );
          }}
        />
      )}
      <DeleteRecord record={record} say={setDeleteSaid} />
      <p role="status" className="launch-problem">
        {deleteSaid ?? (marking === "not-marked" && notMarkedSaid)}
      </p>
    </>
  );
}

// A Recent sessions entry's Delete record… while its state is unknown or
// unavailable, with its status line; the Sessions sidebar's entries offer none.
export function RecentActions({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const [deleteSaid, setDeleteSaid] = useState<string | undefined>();
  return (
    <>
      <DeleteRecord record={record} say={setDeleteSaid} />
      <p role="status" className="launch-problem">
        {deleteSaid}
      </p>
    </>
  );
}

// An entry's Delete record…, offered only while its state is unknown or
// unavailable (`recordDeletable`): it asks in place, with the keyboard on
// Keep, before the record is deleted. A deleted record takes the entry off
// the page. A refused or failed delete says so in the entry's status line and
// leaves the buttons and the keyboard where they were; a state read as known
// meanwhile takes the question away and says so.
function DeleteRecord({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  // Says in the entry's status line what the delete came to; nothing clears it.
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
