// What a card says while its story starts on this machine (`StoryStartup`):
// the workflow's local startup words -- its running start's phase when the
// server names one (`startPhaseWords`) -- marked as local progress that
// keeps the story's actions unavailable, with an indicator that moves only
// while the startup is known to progress. A settled start waiting for the
// published snapshot to show its result says so, with why the last check of
// it failed, if it did. A start in need of reconciliation is said
// statically with what is known, and recovered under Startup recovery
// (`./StartupRecovery.tsx`), outside the protected frame.
// Published facts stay as origin shows them; nothing here places the story.

import {
  startName,
  startPhaseWords,
  type RunningStart,
} from "./agentLaunch.ts";
import type { StoryStartup } from "./storyStartup.ts";
import "./agent-launch.css";

// What is known of a startup in need of reconciliation, by its cause.
// `start` names it, such as "execution start".
export function reconciliationCause(
  { cause }: Pick<StoryStartup, "cause">,
  start: string,
): string {
  switch (cause) {
    case "unacknowledged":
      return `the answer to this ${start} was lost, so it may or may not have been accepted.`;
    case "interrupted":
      return `this machine accepted this ${start}, but no running dashboard server owns it and it never settled, so its session may or may not have started.`;
    default:
      return `this ${start} settled without confirming whether its session or published assignment exists.`;
  }
}

export function StartupStatus({
  startup,
  running,
  establishesStart,
}: {
  readonly startup: StoryStartup;
  readonly running: RunningStart | undefined;
  // Whether the project's installed skill establishes the workflow's start.
  readonly establishesStart: boolean;
}) {
  const { workflow, host, state, problem } = startup;
  const named = startName(workflow);
  if (state === "reconciling") {
    return (
      <>
        <p className="launch-answer quiet card-startup card-startup-static">
          Waiting for published story state: this {named} settled on this
          machine, and this story's actions return once origin shows its result.
        </p>
        {problem !== undefined && (
          <p className="card-startup-note quiet">{problem}</p>
        )}
      </>
    );
  }
  if (state === "needs-reconciliation") {
    return (
      <p className="launch-answer card-startup card-startup-static">
        Startup needs reconciliation: {reconciliationCause(startup, named)}{" "}
        {/* A lost answer has no accepted attempt to continue. */}
        {startup.cause === "unacknowledged"
          ? "Recheck it"
          : "Recheck or continue it"}{" "}
        under Startup recovery; this story's actions stay unavailable until
        then.
      </p>
    );
  }
  const words = startPhaseWords(
    workflow,
    running?.phase ?? (establishesStart ? "preparing" : "launching"),
    running?.host ?? host,
  );
  return (
    <>
      <p className="launch-answer quiet card-startup card-startup-progressing">
        {words}
      </p>
      <p className="card-startup-note quiet">
        Local startup in progress; this story's actions are unavailable until it
        settles.
      </p>
    </>
  );
}
