// A story's startup on this machine, whichever page asked for it
// (`./launchAttempts.ts`): asked from this page and not yet answered,
// accepted and run by the server now, settled and not yet reconciled with
// the published snapshot shown (`./startupReconciliation.ts`), or in need of
// reconciliation, it protects the story's whole frame wherever the story is
// listed. Only a startup the server runs now is said to progress; one in
// need of reconciliation is said statically (`./StartupStatus.tsx`) and
// recovered outside the frame (`./StartupRecovery.tsx`).

import {
  laterAttempt,
  storyOf,
  unresolvedAttempt,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchWorkflow,
  type StoryLaunchRequest,
} from "./agentLaunch.ts";
import type { AskedRequests } from "./pageAttempt.ts";
import type { Reconciliation } from "./startupReconciliation.ts";

// Why a startup needs reconciliation: the page's answer was lost before any
// read showed whether it was accepted (`unacknowledged`), no server runs an
// accepted attempt that never settled (`interrupted`), or it settled while
// its session or publication may or may not exist (`uncertain`).
export type ReconciliationCause =
  "unacknowledged" | "interrupted" | "uncertain";

// Why an accepted attempt that needs reconciliation needs it.
export const attemptCause = (
  attempt: AttemptObservation,
): ReconciliationCause =>
  attempt.outcome === undefined ? "interrupted" : "uncertain";

// A story's startup: its workflow and host, and whether it is asked from
// this page and not yet accepted (`submitting`), accepted and run by the
// server now (`progressing`), settled and waiting for the published snapshot
// to show its result (`reconciling`, with why the last check failed, if it
// did), or in need of reconciliation (`needs-reconciliation`, with its
// cause and, for a lost answer, that answer). Every state protects the
// story.
export type StoryStartup = {
  readonly request: StoryLaunchRequest;
  readonly workflow: LaunchWorkflow;
  readonly host: AgentLaunchRequest["host"];
  readonly state:
    "submitting" | "progressing" | "reconciling" | "needs-reconciliation";
  readonly problem?: string;
  readonly cause?: ReconciliationCause;
  // The accepted attempt it is told from, if any.
  readonly attempt?: AttemptObservation;
};

// The project's stories, each once, whose startup `requests` may tell.
export function storiesAsked(
  requests: readonly AgentLaunchRequest[],
  sourceId: string,
): readonly string[] {
  return [
    ...new Set(
      requests.flatMap((request) =>
        request.source === sourceId ? (storyOf(request) ?? []) : [],
      ),
    ),
  ];
}

function startupOf(
  request: AgentLaunchRequest,
  state: StoryStartup["state"],
  facts: Pick<StoryStartup, "cause" | "attempt" | "problem"> = {},
): StoryStartup | undefined {
  return request.workflow === "ad-hoc"
    ? undefined
    : {
        request,
        workflow: request.workflow,
        host: request.host,
        state,
        ...facts,
      };
}

// The startup of the project's story `identity`: a request this page
// submitted (`submitting`) or whose answer it lost (`unacknowledged`)
// first, then its unresolved attempt (`unresolvedAttempt`): one the server
// runs before a lost answer, then one no server runs or whose session or
// publication is uncertain; otherwise its latest attempt once settled, as
// `reconciled` judges it.
export function storyStartup(
  asked: AskedRequests,
  known: readonly AttemptObservation[],
  sourceId: string,
  identity: string,
  reconciled: (attempt: AttemptObservation) => Reconciliation,
): StoryStartup | undefined {
  const of = (request: AgentLaunchRequest) =>
    request.source === sourceId && storyOf(request) === identity;
  const submitting = asked.submitting.find(of);
  if (submitting !== undefined) return startupOf(submitting, "submitting");
  const ofStory = known.filter((attempt) => of(attempt.request));
  const unresolved = unresolvedAttempt(ofStory);
  if (unresolved?.owned === true)
    return startupOf(unresolved.request, "progressing", {
      attempt: unresolved,
    });
  const lost = asked.unacknowledged.find(({ request }) => of(request));
  if (lost !== undefined)
    return startupOf(lost.request, "needs-reconciliation", {
      cause: "unacknowledged",
      problem: lost.problem.explanation,
    });
  if (unresolved !== undefined)
    return startupOf(unresolved.request, "needs-reconciliation", {
      cause: attemptCause(unresolved),
      attempt: unresolved,
    });
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  if (latest === undefined) return undefined;
  const judged = reconciled(latest);
  if (judged.kind !== "waiting") return undefined;
  return startupOf(latest.request, "reconciling", {
    attempt: latest,
    ...(judged.problem === undefined ? {} : { problem: judged.problem }),
  });
}
