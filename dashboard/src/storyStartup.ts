// A story's startup on this machine, whichever page asked for it
// (`./launchAttempts.ts`): asked from this page and not yet answered,
// accepted and run by the server now, or settled and not yet reconciled with
// the published snapshot shown (`./startupReconciliation.ts`), it protects
// the story's whole frame wherever the story is listed; an accepted attempt
// the server no longer runs and that never settled needs reconciliation and
// is said statically (`./StartupStatus.tsx`).

import type {
  AgentLaunchRequest,
  AttemptObservation,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import { laterAttempt, type Reconciliation } from "./startupReconciliation.ts";

// A story's startup: its workflow and host, and whether it is asked from
// this page and not yet accepted (`submitting`), accepted and run by the
// server now (`progressing`), settled and waiting for the published snapshot
// to show its result (`reconciling`, with why the last check failed, if it
// did), or accepted, unsettled, and run by no server
// (`needs-reconciliation`). All but the last protect the story.
export type StoryStartup = {
  readonly workflow: LaunchWorkflow;
  readonly host: AgentLaunchRequest["host"];
  readonly state:
    "submitting" | "progressing" | "reconciling" | "needs-reconciliation";
  readonly problem?: string;
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
// (`known`), one the server runs before one no server runs, then its latest
// attempt once settled, as `reconciled` judges it.
export function storyStartup(
  submitting: readonly AgentLaunchRequest[],
  known: readonly AttemptObservation[],
  sourceId: string,
  identity: string,
  reconciled: (attempt: AttemptObservation) => Reconciliation,
): StoryStartup | undefined {
  const of = (request: AgentLaunchRequest) =>
    request.source === sourceId &&
    request.workflow !== "ad-hoc" &&
    request.identity === identity;
  const asked = submitting.find(of);
  if (asked !== undefined) return startupOf(asked, "submitting");
  const ofStory = known.filter((attempt) => of(attempt.request));
  const unsettled = ofStory.filter((attempt) => attempt.outcome === undefined);
  const running = unsettled.find((attempt) => attempt.owned);
  if (running !== undefined) return startupOf(running.request, "progressing");
  const unowned = unsettled[0];
  if (unowned !== undefined)
    return startupOf(unowned.request, "needs-reconciliation");
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  const judged = latest && reconciled(latest);
  if (latest === undefined || judged?.kind !== "waiting") return undefined;
  const startup = startupOf(latest.request, "reconciling");
  return startup && judged.problem !== undefined
    ? { ...startup, problem: judged.problem }
    : startup;
}
