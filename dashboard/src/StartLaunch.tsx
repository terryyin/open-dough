// A Backlog card's action to start one launch workflow: the developer asks
// Claude Code to start a background session on this machine that runs the
// workflow on the story, with an optional instruction of their own. Every word
// comes from the workflow (`launchWorkflows`). A card the workflow notes
// (execution: not marked Ready for execution; refinement: being prepared)
// offers the same action, described by that note; the session is asked anyway,
// and the instruction can say what to do first. A failed or uncertain answer
// stays on the card with the action. The dialog's mechanics, including the
// keyboard's return to the action, belong to `LaunchDialog`.

import { useId } from "react";
import {
  launchWorkflows,
  type LaunchChoices,
  type LaunchWorkflow,
} from "./agentLaunch.ts";
import type { LaunchAttempt, LaunchWorkItem } from "./agentLaunches.ts";
import { LaunchDialog, useLaunchDialogLauncher } from "./LaunchDialog.tsx";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import "./agent-launch.css";

export function StartLaunch({
  work,
  workflow,
  establishesStart,
  note,
  attempt,
  onStart,
}: {
  readonly work: LaunchWorkItem;
  readonly workflow: LaunchWorkflow;
  // Whether the project's installed skill establishes a start for this
  // workflow's Start; without it the words are those of a plain session start.
  readonly establishesStart: boolean;
  // The workflow's note on this card, if any.
  readonly note: string | undefined;
  readonly attempt: LaunchAttempt | undefined;
  // Answers whether a session was launched, which then takes the keyboard.
  readonly onStart: (choices: LaunchChoices) => Promise<boolean>;
}) {
  const spec = launchWorkflows[workflow];
  const { name, verb, skill } = spec;
  const establishes = establishesStart ? spec.establishes : undefined;
  const pending = establishes?.pending ?? spec.pending;
  const named = name.toLowerCase();
  const id = useId();
  const starting = attempt?.kind === "starting";
  const { launcher, open, openDialog, closeDialog } =
    useLaunchDialogLauncher(starting);
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
          onClick={openDialog}
        >
          Start {named}
        </button>
        {note !== undefined && (
          <span id={noteId} className="start-launch-note">
            {note}
          </span>
        )}
      </p>
      {attempt?.kind === "starting" && (
        <p id={answerId} className="launch-answer quiet">
          {pending}
        </p>
      )}
      {attempt !== undefined && attempt.kind !== "starting" && (
        <LaunchProblemAnswer id={answerId} problem={attempt} />
      )}
      {open && (
        <LaunchDialog
          heading={`Start ${named} in Claude Code`}
          description={
            <>
              Claude Code starts a background session on this machine, in this
              project's folder, to {verb} <strong>{work.title}</strong> (
              <span className="card-identity">{work.identity}</span>).
              {establishes !== undefined && ` ${establishes.sentence}`}
            </>
          }
          note={
            note !== undefined && (
              <p className="start-launch-note">
                This story is {note.charAt(0).toLowerCase()}
                {note.slice(1)}.
              </p>
            )
          }
          fieldLabel="Instruction (optional)"
          fieldHint={
            <>
              Sent after{" "}
              <code>
                /{skill} {work.identity}
              </code>
              .
            </>
          }
          starting={starting}
          onStart={onStart}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}
