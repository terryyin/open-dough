// A story's startup on this machine, whichever page asked for it
// (`./launchAttempts.ts`): asked from this page and not yet answered, or
// accepted and run by the server now, it protects the story's whole frame;
// an accepted attempt the server no longer runs and that never settled needs
// reconciliation and is said statically (`./StartupStatus.tsx`).

import type {
  AgentLaunchRequest,
  AttemptObservation,
  LaunchWorkflow,
} from "./agentLaunch.ts";

// A story's startup: its workflow and host, and whether it is asked from
// this page and not yet accepted (`submitting`), accepted and run by the
// server now (`progressing`), or accepted, unsettled, and run by no server
// (`needs-reconciliation`). The first two protect the story.
export type StoryStartup = {
  readonly workflow: LaunchWorkflow;
  readonly host: AgentLaunchRequest["host"];
  readonly state: "submitting" | "progressing" | "needs-reconciliation";
};

export const startupProtects = (startup: StoryStartup | undefined) =>
  startup !== undefined && startup.state !== "needs-reconciliation";

function startupOf(
  request: AgentLaunchRequest,
  state: StoryStartup["state"],
): StoryStartup | undefined {
  return request.workflow === "ad-hoc"
    ? undefined
    : { workflow: request.workflow, host: request.host, state };
}

// The startup of the project's story `identity`: a request this page
// submitted (`submitting`) first, then the unsettled attempts known
// (`known`), one the server runs before one no server runs.
export function storyStartup(
  submitting: readonly AgentLaunchRequest[],
  known: readonly AttemptObservation[],
  sourceId: string,
  identity: string,
): StoryStartup | undefined {
  const of = (request: AgentLaunchRequest) =>
    request.source === sourceId &&
    request.workflow !== "ad-hoc" &&
    request.identity === identity;
  const asked = submitting.find(of);
  if (asked !== undefined) return startupOf(asked, "submitting");
  const unsettled = known.filter(
    (attempt) => of(attempt.request) && attempt.outcome === undefined,
  );
  const running = unsettled.find((attempt) => attempt.owned);
  if (running !== undefined) return startupOf(running.request, "progressing");
  const unowned = unsettled[0];
  return unowned && startupOf(unowned.request, "needs-reconciliation");
}
