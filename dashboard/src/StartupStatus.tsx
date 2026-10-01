// What a card says while its story starts on this machine (`StoryStartup`):
// the workflow's local startup words -- its running start's phase when the
// server names one (`startPhaseWords`) -- marked as local progress that
// keeps the story's actions unavailable, with an indicator that moves only
// while the startup is known to progress. A settled start waiting for the
// published snapshot to show its result says so, with why the last check of
// it failed, if it did. An accepted start no server runs and that never
// settled is said statically, with the existing recovery direction.
// Published facts stay as origin shows them; nothing here places the story.

import {
  launchWorkflows,
  startPhaseWords,
  type StartPhase,
} from "./agentLaunch.ts";
import type { StoryStartup } from "./storyStartup.ts";
import { hostName } from "./sessionCapabilities.ts";
import "./agent-launch.css";

// Where the host's own sessions are checked.
function NativeCheck({ host }: { readonly host: StoryStartup["host"] }) {
  return host === "claude" ? (
    <>
      check <code>claude agents</code>
    </>
  ) : (
    <>check the dashboard history and native {hostName(host)} conversations</>
  );
}

export function StartupStatus({
  startup,
  phase,
  establishesStart,
}: {
  readonly startup: StoryStartup;
  readonly phase: StartPhase | undefined;
  // Whether the project's installed skill establishes the workflow's start.
  readonly establishesStart: boolean;
}) {
  const { workflow, host, state, problem } = startup;
  const spec = launchWorkflows[workflow];
  const named = spec.name.toLowerCase();
  if (state === "reconciling") {
    return (
      <>
        <p className="launch-answer quiet card-startup card-startup-static">
          Waiting for published story state: this {named} start settled on this
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
        Startup needs reconciliation: this machine accepted a {named} start of
        this story that no running dashboard server owns, so its session may or
        may not have started. Press Refresh, and <NativeCheck host={host} />{" "}
        before starting again.
      </p>
    );
  }
  const words = (
    phase === undefined
      ? establishesStart
        ? spec.establishes.pending
        : spec.pending
      : startPhaseWords(workflow, phase)
  ).replace("Claude Code", hostName(host));
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
