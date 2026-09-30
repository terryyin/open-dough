// A Backlog card's action to start one launch workflow: the developer asks
// Claude Code to start a background session on this machine that runs the
// workflow on the story, with an optional instruction of their own. Every word
// comes from the workflow (`launchWorkflows`). A card the workflow notes
// (execution: not marked Ready for execution; refinement: being prepared)
// offers the same action, described by that note; the session is asked anyway,
// and the instruction can say what to do first. A failed or uncertain answer
// stays on the card with the action. The dialog's mechanics, including the
// keyboard's return to the action, belong to `LaunchDialog`. On a Taken card
// whose story this machine started without a session (`resumesIn`), the dialog
// says the Take is already published and the session opens in the kept
// workspace.

import { useId, useRef, useState } from "react";
import {
  launchWorkflows,
  startPhaseWords,
  type LaunchChoices,
  type StartPhase,
  type LaunchWorkflow,
} from "./agentLaunch.ts";
import type { LaunchAttempt, LaunchWorkItem } from "./launchAttempts.ts";
import type { OptionsOffer } from "./optionsOffer.ts";
import { LaunchDialog, useLaunchDialogLauncher } from "./LaunchDialog.tsx";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import "./agent-launch.css";

// What the dialog says where the options would be, when it cannot offer any:
// the boundary's words for why, so a refusal and the dialog agree.
function optionsLine(
  offer: OptionsOffer | undefined,
  skill: string,
  named: string,
): string | undefined {
  const starts = `${named.charAt(0).toUpperCase()}${named.slice(1)} starts straightforwardly.`;
  switch (offer?.kind) {
    case undefined:
      return undefined;
    case "reading":
      return "Reading options…";
    case "unavailable":
      return `Options are not offered: the installed ${skill} skill in this project ${offer.why}. ${starts}`;
    case "offered":
      return offer.options.length === 0
        ? `The installed ${skill} skill in this project offers no options. ${starts}`
        : undefined;
  }
}

// What the dialog says under the options when a kept selection names flags
// the offer, once read, no longer has: those flags, in the kept order, are
// not sent.
function notOfferedLine(
  offer: OptionsOffer | undefined,
  kept: ReadonlySet<string> | undefined,
): string | undefined {
  if (offer === undefined || offer.kind === "reading") return undefined;
  const offered = new Set(
    offer.kind === "offered" ? offer.options.map(({ flag }) => flag) : [],
  );
  const absent = [...(kept ?? [])].filter((flag) => !offered.has(flag));
  return absent.length === 0
    ? undefined
    : `Not offered any more, so not sent: ${absent.join(", ")}.`;
}

export function StartLaunch({
  work,
  workflow,
  establishesStart,
  options,
  resumesIn,
  note,
  attempt,
  phase,
  onStart,
}: {
  readonly work: LaunchWorkItem;
  readonly workflow: LaunchWorkflow;
  // Whether the project's installed skill establishes a start for this
  // workflow's Start; without it the words are those of a plain session start.
  readonly establishesStart: boolean;
  // What the project's installed skill offers this workflow's launch, if the
  // workflow defines options.
  readonly options: OptionsOffer | undefined;
  // The kept start's workspace, as the page shows it, when this Start resumes
  // a start whose Take is already published.
  readonly resumesIn?: string;
  // The workflow's note on this card, if any.
  readonly note: string | undefined;
  readonly attempt: LaunchAttempt | undefined;
  // The phase of this story's start the server runs now, whichever page
  // asked for it; its words say it on this card, and Start waits for it.
  readonly phase: StartPhase | undefined;
  // Answers whether a session was launched, which then takes the keyboard.
  readonly onStart: (choices: LaunchChoices) => Promise<boolean>;
}) {
  const spec = launchWorkflows[workflow];
  const { name, verb, skill } = spec;
  const establishes = establishesStart ? spec.establishes : undefined;
  const pending =
    phase === undefined
      ? (establishes?.pending ?? spec.pending)
      : startPhaseWords[phase];
  const named = name.toLowerCase();
  const id = useId();
  const starting = attempt?.kind === "starting";
  const running = starting || phase !== undefined;
  const { launcher, open, openDialog, closeDialog } =
    useLaunchDialogLauncher(starting);
  // The selection of the launch that failed, which the next opening keeps.
  const [kept, setKept] = useState<ReadonlySet<string>>();
  const refused = useRef(false);
  const noteId = `${id}-note`;
  const answerId = `${id}-answer`;
  const described = [
    note !== undefined ? noteId : undefined,
    attempt !== undefined || phase !== undefined ? answerId : undefined,
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
          disabled={running}
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
      {running && (
        <p id={answerId} className="launch-answer quiet">
          {pending}
        </p>
      )}
      {attempt !== undefined && attempt.kind !== "starting" && !running && (
        <LaunchProblemAnswer id={answerId} problem={attempt} />
      )}
      {open && (
        <LaunchDialog
          heading={`Start ${named} in Claude Code`}
          description={
            <>
              Claude Code starts a background session on this machine,{" "}
              {resumesIn === undefined
                ? "in this project's folder"
                : `in workspace ${resumesIn}`}
              , to {verb} <strong>{work.title}</strong> (
              <span className="card-identity">{work.identity}</span>).
              {resumesIn !== undefined
                ? " This story's Take is already published on origin, so Start publishes no second Take."
                : establishes !== undefined && ` ${establishes.sentence}`}
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
          command={`/${skill} ${work.identity}`}
          options={options?.kind === "offered" ? options : undefined}
          optionsHint="Choose any combination; they apply together. None means straightforward refinement."
          optionsLine={optionsLine(options, skill, named)}
          kept={kept}
          notOfferedLine={notOfferedLine(options, kept)}
          starting={starting}
          onStart={onStart}
          onRefused={(selected) => {
            refused.current = true;
            setKept(selected);
          }}
          onClose={(launched) => {
            if (!refused.current) setKept(undefined);
            refused.current = false;
            closeDialog(launched);
          }}
        />
      )}
    </div>
  );
}
