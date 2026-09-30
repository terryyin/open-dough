// Record actions shared by card and Recent sessions entries.
import { hostName, marksDone } from "./sessionCapabilities.ts";
import { useEffect, useRef, useState } from "react";
import { recordDeletable, type LaunchWithState } from "./agentLaunch.ts";
import {
  notDeleted,
  notMarkedDone,
  nowKnown,
  useMarking,
  usePageSessions,
} from "./pageSessions.ts";

// A card entry's Mark as done, and its Delete record… while its state is
// unknown or unavailable, with the one status line that says what either could
// not do or found; once marked or deleted, the entry leaves the card.
export function CardActions({ record }: { readonly record: LaunchWithState }) {
  const { markDone } = usePageSessions();
  const { marking, follow } = useMarking();
  const [deleteSaid, setDeleteSaid] = useState<string | undefined>();
  return (
    <>
      {marksDone(record.session.host) && (
        <p className="launch-open">
          <button
            type="button"
            disabled={marking === "marking"}
            onClick={(event) => {
              setDeleteSaid(undefined);
              follow(markDone({ record, control: event.currentTarget }));
            }}
          >
            Mark as done
          </button>
        </p>
      )}
      <DeleteRecord record={record} say={setDeleteSaid} />
      <p role="status" className="launch-problem">
        {deleteSaid ?? (marking === "not-marked" && notMarkedDone)}
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
// Keep, before the record is deleted. Keep and Escape put the button back with
// the keyboard on it. A deleted record takes the entry off the page. A refused
// or failed delete says so in the entry's status line and leaves the buttons
// and the keyboard where they were; a state read as known meanwhile takes the
// question away and says so.
function DeleteRecord({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  // Says in the entry's status line what the delete came to; nothing clears it.
  readonly say: (words: string | undefined) => void;
}) {
  const { deleteRecord } = usePageSessions();
  const deletable = recordDeletable(record);
  const [step, setStep] = useState<"idle" | "asking" | "deleting">("idle");
  const button = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const restoring = useRef(false);
  const retrying = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (step === "asking") {
      // After a failed delete the keyboard stays on the button it was on.
      (retrying.current ?? keep.current)?.focus();
      retrying.current = null;
    }
    if (step === "idle" && restoring.current) {
      restoring.current = false;
      button.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!deletable)
      setStep((current) => (current === "deleting" ? current : "idle"));
  }, [deletable]);

  const keepRecord = () => {
    restoring.current = true;
    setStep("idle");
  };

  if (!deletable) return null;
  if (step === "idle") {
    return (
      <p className="launch-open">
        <button
          ref={button}
          type="button"
          onClick={() => {
            say(undefined);
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
        {hostName(record.session.host)}; a running session keeps running.
      </p>
      <p className="delete-question-actions">
        <button
          type="button"
          disabled={step === "deleting"}
          onClick={(event) => {
            const control = event.currentTarget;
            say(undefined);
            setStep("deleting");
            void deleteRecord({ record, control }).then((outcome) => {
              if (outcome.kind === "deleted") return;
              setStep(outcome.kind === "failed" ? "asking" : "idle");
              if (outcome.kind === "failed") {
                say(
                  outcome.reason === undefined
                    ? notDeleted
                    : `${notDeleted} ${outcome.reason}`,
                );
                retrying.current = control;
              } else {
                say(nowKnown);
              }
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
