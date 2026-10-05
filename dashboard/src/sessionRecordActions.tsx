// Record actions shared by card and Recent sessions entries. Each says what
// it came to through the entry's one status line (`say`), which nothing clears
// but the next control asking.
import { hostName, marksRecordDone } from "./sessionCapabilities.ts";
import { useEffect, useRef, useState } from "react";
import { recordDeletable, type LaunchWithState } from "./agentLaunch.ts";
import {
  notDeleted,
  notMarkedDone,
  nowKnown,
  useMarking,
  usePageSessions,
} from "./pageSessions.ts";
import { useFrameDescription } from "./protectedFrame.ts";

// A card entry's Mark as done, whenever its session can be marked done, an
// unread report included. Once marked done, the entry leaves the card.
export function MarkDone({
  record,
  say,
}: {
  readonly record: LaunchWithState;
  readonly say: (words: string | undefined) => void;
}) {
  const { markDone, hostOperations } = usePageSessions();
  const { marking, follow } = useMarking();
  const described = useFrameDescription();
  if (!marksRecordDone(hostOperations, record)) return null;
  return (
    <p className="launch-open">
      <button
        type="button"
        aria-describedby={described}
        disabled={marking === "marking"}
        onClick={(event) => {
          say(undefined);
          follow(
            markDone({ record, control: event.currentTarget }),
            (marked) => {
              if (!marked) say(notMarkedDone);
            },
          );
        }}
      >
        Mark as done
      </button>
    </p>
  );
}

// A card or Recent sessions entry's Delete record…, offered only while its
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
  const deletable = recordDeletable(record);
  const [step, setStep] = useState<"idle" | "asking" | "deleting">("idle");
  const button = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const restoring = useRef(false);
  const retrying = useRef<HTMLElement | null>(null);
  const described = useFrameDescription();

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
          aria-describedby={described}
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
        Delete this session&apos;s dashboard record? The conversation stays in{" "}
        {hostName(record.session.host)}; a running session keeps running.
      </p>
      <p className="delete-question-actions">
        <button
          type="button"
          aria-describedby={described}
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
          aria-describedby={described}
          disabled={step === "deleting"}
          onClick={keepRecord}
        >
          Keep
        </button>
      </p>
    </div>
  );
}
