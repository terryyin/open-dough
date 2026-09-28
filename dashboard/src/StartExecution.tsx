// A Backlog card's Start execution action and its dialog: the developer asks
// Claude Code to start a background session on this machine that executes
// the story, with an optional instruction of their own. A card not marked
// Ready for execution offers the same action, described as not ready; the
// session is asked anyway, and the instruction can say what to do first.
// A failed or uncertain answer stays on the card with the action.

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { launchInstructionLimit } from "./agentLaunch.ts";
import type { LaunchAttempt, LaunchWorkItem } from "./agentLaunches.ts";
import "./agent-launch.css";

// An explanation's `command` spans, shown as code.
function LaunchExplanation({ text }: { readonly text: string }) {
  const parts: ReactNode[] = text
    .split("`")
    .map((part, index) =>
      index % 2 === 1 ? <code key={index}>{part}</code> : part,
    );
  return <>{parts}</>;
}

// Mounted only while open, so a card carries no hidden dialog text and each
// opening starts without an earlier instruction.
function StartExecutionDialog({
  work,
  ready,
  starting,
  onStart,
  onClose,
}: {
  readonly work: LaunchWorkItem;
  readonly ready: boolean | undefined;
  readonly starting: boolean;
  readonly onStart: (instruction: string) => Promise<void>;
  readonly onClose: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const instruction = useRef<HTMLTextAreaElement>(null);
  const headingId = `${id}-heading`;

  useEffect(() => {
    dialog.current?.showModal();
    instruction.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="start-execution-dialog"
      aria-labelledby={headingId}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onStart(instruction.current?.value ?? "").then(() => {
            dialog.current?.close();
          });
        }}
      >
        <h2 id={headingId}>Start execution in Claude Code</h2>
        <p>
          Claude Code starts a background session on this machine, in this
          project's folder, to execute <strong>{work.title}</strong> (
          <span className="card-identity">{work.identity}</span>).
        </p>
        {ready === false && (
          <p className="start-execution-note">
            This story is not marked Ready for execution.
          </p>
        )}
        <label htmlFor={`${id}-instruction`}>Instruction (optional)</label>
        <p id={`${id}-instruction-hint`} className="quiet">
          Sent after <code>/dough-execute-plan {work.identity}</code>.
        </p>
        <textarea
          ref={instruction}
          id={`${id}-instruction`}
          aria-describedby={`${id}-instruction-hint`}
          maxLength={launchInstructionLimit}
          rows={4}
        />
        <div className="start-execution-dialog-actions">
          <button type="submit" disabled={starting}>
            {starting ? "Starting…" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.current?.close();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function StartExecution({
  work,
  ready,
  attempt,
  onStart,
}: {
  readonly work: LaunchWorkItem;
  // Undefined while readiness is still being read.
  readonly ready: boolean | undefined;
  readonly attempt: LaunchAttempt | undefined;
  readonly onStart: (instruction: string) => Promise<void>;
}) {
  const id = useId();
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const returnsFocus = useRef(false);
  const starting = attempt?.kind === "starting";
  // A closed dialog returns the keyboard to the action once it can take it
  // again: at once, or when a launch still in flight has answered.
  useEffect(() => {
    if (!open && !starting && returnsFocus.current) {
      returnsFocus.current = false;
      launcher.current?.focus();
    }
  }, [open, starting]);
  const notReadyId = `${id}-not-ready`;
  const answerId = `${id}-answer`;
  const described = [
    ready === false ? notReadyId : undefined,
    attempt !== undefined ? answerId : undefined,
  ].filter((part) => part !== undefined);

  return (
    <div className="start-execution">
      <p className="start-execution-action">
        <button
          ref={launcher}
          type="button"
          className={
            ready === false
              ? "start-execution-button start-execution-not-ready"
              : "start-execution-button"
          }
          aria-haspopup="dialog"
          aria-describedby={described.length ? described.join(" ") : undefined}
          disabled={starting}
          onClick={() => {
            setOpen(true);
          }}
        >
          Start execution
        </button>
        {ready === false && (
          <span id={notReadyId} className="start-execution-note">
            Not marked Ready for execution
          </span>
        )}
      </p>
      {attempt !== undefined && (
        <p
          id={answerId}
          className={
            attempt.kind === "starting"
              ? "launch-answer quiet"
              : "launch-answer launch-problem"
          }
        >
          {attempt.kind === "starting" ? (
            "Starting execution in Claude Code…"
          ) : (
            <>
              {attempt.kind === "failed"
                ? "Launch failed: "
                : "Launch uncertain: "}
              <LaunchExplanation text={attempt.explanation} />
            </>
          )}
        </p>
      )}
      {open && (
        <StartExecutionDialog
          work={work}
          ready={ready}
          starting={starting}
          onStart={onStart}
          onClose={() => {
            returnsFocus.current = true;
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
