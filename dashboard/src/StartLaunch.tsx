// A Backlog card's action to start one launch workflow, and its dialog: the
// developer asks Claude Code to start a background session on this machine
// that runs the workflow on the story, with an optional instruction of their
// own. Every word comes from the workflow (`launchWorkflows`). A card the
// workflow notes (execution: not marked Ready for execution; refinement:
// being prepared) offers the same action, described by that note; the session
// is asked anyway, and the instruction can say what to do first. A failed or
// uncertain answer stays on the card with the action.

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  launchInstructionLimit,
  launchWorkflows,
  type LaunchWorkflow,
} from "./agentLaunch.ts";
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
function StartLaunchDialog({
  work,
  workflow,
  note,
  starting,
  onStart,
  onClose,
}: {
  readonly work: LaunchWorkItem;
  readonly workflow: LaunchWorkflow;
  readonly note: string | undefined;
  readonly starting: boolean;
  readonly onStart: (instruction: string) => Promise<void>;
  readonly onClose: () => void;
}) {
  const { name, verb, skill } = launchWorkflows[workflow];
  const named = name.toLowerCase();
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
      className="start-launch-dialog"
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
        <h2 id={headingId}>Start {named} in Claude Code</h2>
        <p>
          Claude Code starts a background session on this machine, in this
          project's folder, to {verb} <strong>{work.title}</strong> (
          <span className="card-identity">{work.identity}</span>).
        </p>
        {note !== undefined && (
          <p className="start-launch-note">
            This story is {note.charAt(0).toLowerCase()}
            {note.slice(1)}.
          </p>
        )}
        <label htmlFor={`${id}-instruction`}>Instruction (optional)</label>
        <p id={`${id}-instruction-hint`} className="quiet">
          Sent after{" "}
          <code>
            /{skill} {work.identity}
          </code>
          .
        </p>
        <textarea
          ref={instruction}
          id={`${id}-instruction`}
          aria-describedby={`${id}-instruction-hint`}
          maxLength={launchInstructionLimit}
          rows={4}
        />
        <div className="start-launch-dialog-actions">
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

export function StartLaunch({
  work,
  workflow,
  note,
  attempt,
  onStart,
}: {
  readonly work: LaunchWorkItem;
  readonly workflow: LaunchWorkflow;
  // The workflow's note on this card, if any.
  readonly note: string | undefined;
  readonly attempt: LaunchAttempt | undefined;
  readonly onStart: (instruction: string) => Promise<void>;
}) {
  const named = launchWorkflows[workflow].name.toLowerCase();
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
  const noteId = `${id}-note`;
  const answerId = `${id}-answer`;
  const described = [
    note !== undefined ? noteId : undefined,
    attempt !== undefined ? answerId : undefined,
  ].filter((part) => part !== undefined);

  return (
    <div className="start-launch">
      <p className="start-launch-action">
        <button
          ref={launcher}
          type="button"
          className={
            note !== undefined
              ? "start-launch-button start-launch-noted"
              : "start-launch-button"
          }
          aria-haspopup="dialog"
          aria-describedby={described.length ? described.join(" ") : undefined}
          disabled={starting}
          onClick={() => {
            setOpen(true);
          }}
        >
          Start {named}
        </button>
        {note !== undefined && (
          <span id={noteId} className="start-launch-note">
            {note}
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
            `Starting ${named} in Claude Code…`
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
        <StartLaunchDialog
          work={work}
          workflow={workflow}
          note={note}
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
