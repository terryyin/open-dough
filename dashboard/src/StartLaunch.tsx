// A Backlog card's action to start one launch workflow: the developer asks
// the selected host to start a background session on this machine that runs the
// workflow on the story, with an optional instruction of their own. Every word
// comes from the workflow (`launchWorkflows`). A card the workflow notes
// (execution: not marked Ready for execution; refinement: being prepared)
// offers the same action, described by that note; the session is asked anyway,
// and the instruction can say what to do first. A failed or uncertain answer
// stays on the card with the action. The dialog's mechanics, including the
// keyboard's return to the action, belong to `LaunchDialog`. On a card whose
// story this machine started without a session (`resumes`), the dialog names
// the published claim's host/model and the session opens in its kept workspace.
// A story's Session choices (`LaunchSessionPolicy`) decide its tracking,
// workspace and landing; the line beside Start (`StartEffects`) says what
// follows from them. A kept start shows the policy it was started with.

import { hostName } from "./sessionCapabilities.ts";
import { hostDescription } from "./hostDescription.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { useId, useRef, useState } from "react";
import {
  defaultSessionPolicy,
  launchArguments,
  launchWorkflows,
  policyOf,
  startPhaseWords,
  type KeptStart,
  type LaunchChoices,
  type SessionPolicy,
  type StartPhase,
  type LaunchWorkflow,
} from "./agentLaunch.ts";
import type { SessionPolicyOffer } from "./launchOffers.ts";
import { StartDetails, StartEffects } from "./StartEffects.tsx";
import type { LaunchAttempt, LaunchWorkItem } from "./launchAttempts.ts";
import {
  notOfferedLine,
  optionsLine,
  type OptionsOffer,
} from "./optionsOffer.ts";
import { LaunchDialog } from "./LaunchDialog.tsx";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import { useLaunchDialogLauncher } from "./launchDialogLauncher.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import "./agent-launch.css";

export function StartLaunch({
  work,
  workflow,
  establishesStart: establishesForHost,
  options: optionsForHost,
  sessionPolicy: sessionPolicyForHost,
  onHostChanged,
  resumes,
  note,
  attempt,
  phase,
  onStart,
}: {
  readonly onHostChanged?: () => void;
  readonly work: LaunchWorkItem;
  readonly workflow: LaunchWorkflow;
  // Whether the project's installed skill establishes a start for this
  // workflow's Start; without it the words are those of a plain session start.
  readonly establishesStart:
    boolean | ((host: AgentLaunchRequest["host"]) => boolean);
  // What the project's installed skill offers this workflow's launch, if the
  // workflow defines options.
  readonly options:
    | OptionsOffer
    | undefined
    | ((host: AgentLaunchRequest["host"]) => OptionsOffer | undefined);
  // Whether the selected host's installed skills take a session policy at
  // this workflow's start; none offers only standard tracking.
  readonly sessionPolicy?: (
    host: AgentLaunchRequest["host"],
  ) => SessionPolicyOffer;
  // The kept claim's host/model and shown workspace when this Start resumes
  // a start whose claim or announcement is already published.
  readonly resumes?: KeptStart;
  // The workflow's note on this card, if any.
  readonly note: string | undefined;
  readonly attempt: LaunchAttempt | undefined;
  // The phase of this story's start the server runs now, whichever page
  // asked for it; its words say it on this card, and Start waits for it.
  readonly phase: StartPhase | undefined;
  // Answers whether a session was launched, which then takes the keyboard.
  readonly onStart: (choices: LaunchChoices) => Promise<StartAnswer>;
}) {
  const [selectedHost, setHost] =
    useState<AgentLaunchRequest["host"]>("claude");
  const host = resumes?.host ?? selectedHost;
  const options =
    typeof optionsForHost === "function"
      ? optionsForHost(host)
      : optionsForHost;
  const spec = launchWorkflows[workflow];
  const { name, verb, skill } = spec;
  const establishesStart =
    typeof establishesForHost === "function"
      ? establishesForHost(host)
      : establishesForHost;
  const establishes = establishesStart ? spec.establishes : undefined;
  const pending =
    phase === undefined
      ? (establishes?.pending ??
        spec.pending.replace("Claude Code", hostName(host)))
      : startPhaseWords(workflow, phase).replace("Claude Code", hostName(host));
  const named = name.toLowerCase();
  const id = useId();
  const starting = attempt?.kind === "starting";
  const running = starting || phase !== undefined;
  const { launcher, open, openDialog, closeDialog } =
    useLaunchDialogLauncher(starting);
  // The selection of the launch that failed, which the next opening keeps.
  const [kept, setKept] = useState<ReadonlySet<string>>();
  // The session policy chosen; a failed launch's stays for the next opening.
  const [chosenPolicy, setPolicy] =
    useState<SessionPolicy>(defaultSessionPolicy);
  const policy = resumes === undefined ? chosenPolicy : policyOf(resumes);
  const words = { workflow, policy, establishesStart, resumes };
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
          host={host}
          onHost={
            resumes === undefined
              ? (next) => {
                  setHost(next);
                  onHostChanged?.();
                }
              : undefined
          }
          heading={`Start ${named} in ${hostName(host)}`}
          subject={
            <>
              <strong>{work.title}</strong>{" "}
              <span className="card-identity">{work.identity}</span>
            </>
          }
          description={`${hostName(host)} starts a background session on this machine to ${verb} this story.`}
          effects={<StartEffects {...words} />}
          details={<StartDetails {...words} />}
          note={
            note !== undefined && (
              <p className="start-launch-note">
                This story is {note.charAt(0).toLowerCase()}
                {note.slice(1)}.
              </p>
            )
          }
          fieldLabel="Instruction (optional)"
          command={[
            `${hostDescription(host).skillSigil}${skill}`,
            ...launchArguments({ identity: work.identity, policy }),
          ].join(" ")}
          session={{
            policy,
            onPolicy: setPolicy,
            offer: sessionPolicyForHost?.(host) ?? "unavailable",
            kept: resumes !== undefined,
            workflowName: named,
          }}
          optionsReading={options?.kind === "reading"}
          options={options?.kind === "offered" ? options : undefined}
          optionsLabel={`${name} options`}
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
            if (!refused.current) {
              setKept(undefined);
              setPolicy(defaultSessionPolicy);
            }
            refused.current = false;
            closeDialog(launched);
          }}
        />
      )}
    </div>
  );
}
