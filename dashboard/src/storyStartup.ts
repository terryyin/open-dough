// A story's startup on this machine, whichever page asked for it
// (`./launchAttempts.ts`): asked from this page and not yet answered,
// accepted and run by the server now, settled and not yet reconciled with
// the published snapshot shown (`./startupReconciliation.ts`), or in need of
// reconciliation, it protects the story's whole frame wherever the story is
// listed. Only a startup the server runs now is said to progress; one in
// need of reconciliation is said statically (`./StartupStatus.tsx`) and
// recovered outside the frame (`./StartupRecovery.tsx`).

import {
  needsReconciliation,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchWorkflow,
} from "./agentLaunch.ts";
import type { AskedRequests } from "./pageAttempt.ts";
import { laterAttempt, type Reconciliation } from "./startupReconciliation.ts";

// Why a startup needs reconciliation: the page's answer was lost before any
// read showed whether it was accepted (`unacknowledged`), no server runs an
// accepted attempt that never settled (`interrupted`), or it settled while
// its session or publication may or may not exist (`uncertain`).
export type ReconciliationCause =
  "unacknowledged" | "interrupted" | "uncertain";

// A story's startup: its workflow and host, and whether it is asked from
// this page and not yet accepted (`submitting`), accepted and run by the
// server now (`progressing`), settled and waiting for the published snapshot
// to show its result (`reconciling`, with why the last check failed, if it
// did), or in need of reconciliation (`needs-reconciliation`, with its
// cause and, for a lost answer, that answer). Every state protects the
// story.
export type StoryStartup = {
  readonly request: AgentLaunchRequest;
  readonly workflow: LaunchWorkflow;
  readonly host: AgentLaunchRequest["host"];
  readonly state:
    "submitting" | "progressing" | "reconciling" | "needs-reconciliation";
  readonly problem?: string;
  readonly cause?: ReconciliationCause;
  // The accepted attempt it is told from, if any.
  readonly attempt?: AttemptObservation;
};

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
// first, then the unsettled attempts known (`known`), one the server runs
// before one no server runs, then its latest attempt once settled: in need
// of reconciliation when its session or publication is uncertain, otherwise
// as `reconciled` judges it.
export function storyStartup(
  asked: AskedRequests,
  known: readonly AttemptObservation[],
  sourceId: string,
  identity: string,
  reconciled: (attempt: AttemptObservation) => Reconciliation,
): StoryStartup | undefined {
  const of = (request: AgentLaunchRequest) =>
    request.source === sourceId &&
    request.workflow !== "ad-hoc" &&
    request.identity === identity;
  const submitting = asked.submitting.find(of);
  if (submitting !== undefined) return startupOf(submitting, "submitting");
  const ofStory = known.filter((attempt) => of(attempt.request));
  const unsettled = ofStory.filter((attempt) => attempt.outcome === undefined);
  const running = unsettled.find((attempt) => attempt.owned);
  if (running !== undefined)
    return startupOf(running.request, "progressing", { attempt: running });
  const lost = asked.unacknowledged.find(({ request }) => of(request));
  if (lost !== undefined)
    return startupOf(lost.request, "needs-reconciliation", {
      cause: "unacknowledged",
      problem: lost.problem.explanation,
    });
  const interrupted = unsettled[0];
  if (interrupted !== undefined)
    return startupOf(interrupted.request, "needs-reconciliation", {
      cause: "interrupted",
      attempt: interrupted,
    });
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  if (latest === undefined) return undefined;
  if (needsReconciliation(latest))
    return startupOf(latest.request, "needs-reconciliation", {
      cause: "uncertain",
      attempt: latest,
    });
  const judged = reconciled(latest);
  if (judged.kind !== "waiting") return undefined;
  return startupOf(latest.request, "reconciling", {
    attempt: latest,
    ...(judged.problem === undefined ? {} : { problem: judged.problem }),
  });
}
