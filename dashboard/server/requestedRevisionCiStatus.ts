// Requested-revision CI status for a story comparison endpoint: Skipped,
// Cancelled, or No build with the reason absence could not be confirmed —
// named beside the build whose proof the endpoint uses (ADR 0008). Path
// confirmation reuses `classifyPathChanges` from the execution classifier,
// fed by workflow text and changed paths from the comparison history reader.
// Production acquires them with `git show` / `git diff --name-status -M`. Proof selection stays elsewhere
// (`./baseCiRevisionLookup.ts`).
import { classifyPathChanges } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-path-applicability.mjs";
import { readCiPathIgnorePolicy } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.mjs";
import { shortSha } from "../src/baseCiWording.ts";
import type { RequestedRevisionCiStatus } from "../src/storyCiComparison.ts";
import { newestRunFor, type ListedRun } from "./baseCiNearest.ts";
import type { ComparisonHistory } from "./comparisonBuildSource.ts";

const pushEvent = "push";

export function workflowFilePath(workflow: string): string | undefined {
  if (/^\d+$/.test(workflow.trim())) return undefined;
  const name = workflow.trim();
  if (name === "") return undefined;
  return `.github/workflows/${name}`;
}

export function noBuildReasonPhrase(reason: string): string {
  switch (reason) {
    case "unreadable-revision":
      return "the workflow at that revision could not be read";
    case "numeric-workflow":
      return "the configured workflow is a numeric ID, so a skip cannot be confirmed";
    case "unsupported-workflow-policy":
      return "the workflow's path rule could not be confirmed";
    case "no-ancestor-basis":
      return "no ancestor build was found to compare against";
    case "unreadable-diff":
      return "the diff from the nearest build could not be read";
    case "required":
      return "changes CI does not ignore";
    case "mixed-paths":
      return "changes mix ignored and non-ignored paths";
    case "non-ignored-delete":
      return "a delete touches a path CI does not ignore";
    case "non-ignored-rename":
      return "a rename touches a path CI does not ignore";
    case "unsupported-diff-status":
      return "the diff includes an unsupported change status";
    default:
      return reason;
  }
}

function skippedExplanation(requested: string, basis: string): string {
  return `Skipped at ${shortSha(requested)} because CI ignores every change since its nearest built ancestor ${shortSha(basis)}.`;
}

function providerSkippedExplanation(requested: string): string {
  return `Skipped at ${shortSha(requested)} (CI reported the run as skipped).`;
}

function cancelledExplanation(requested: string, timedOut: boolean): string {
  return timedOut
    ? `Timed out at ${shortSha(requested)}.`
    : `Cancelled at ${shortSha(requested)}.`;
}

function noBuildExplanation(requested: string, reason: string): string {
  return `No build at ${shortSha(requested)}: ${noBuildReasonPhrase(reason)}.`;
}

// Classifies path changes from `basisSha` to `requestedSha` using the
// workflow file at the requested revision. Shares the classifier and policy
// parser with `classifyRevisionApplicability`; history acquisition stays outside.
export async function classifyComparisonPathChanges(
  history: ComparisonHistory,
  requestedSha: string,
  basisSha: string,
  workflowPath: string,
  event: string = pushEvent,
): Promise<
  | { readonly verdict: "not_required" }
  | { readonly verdict: "required" }
  | { readonly verdict: "indeterminate"; readonly reason: string }
> {
  const content = await history.workflowAt(requestedSha, workflowPath);
  if (content === null)
    return { verdict: "indeterminate", reason: "unreadable-revision" };

  const policy = readCiPathIgnorePolicy(content) as {
    readonly supported: boolean;
    readonly events?: Readonly<
      Record<string, { readonly pathsIgnore: readonly string[] }>
    >;
  };
  if (!policy.supported || policy.events === undefined)
    return { verdict: "indeterminate", reason: "unsupported-workflow-policy" };

  const eventPolicy = policy.events[event];
  if (eventPolicy === undefined)
    return { verdict: "indeterminate", reason: "unsupported-workflow-policy" };

  if (eventPolicy.pathsIgnore.length === 0) return { verdict: "required" };

  const entries = await history.changesBetween(basisSha, requestedSha);
  const classified = classifyPathChanges(entries, eventPolicy.pathsIgnore) as
    | { readonly verdict: "not_required" }
    | { readonly verdict: "required" }
    | { readonly verdict: "indeterminate"; readonly reason: string };
  return classified;
}

function newestCompletedConclusion(
  runs: readonly ListedRun[],
  sha: string,
): string | null | undefined {
  const newest = newestRunFor(runs, sha);
  if (newest === undefined || newest.status !== "completed") return undefined;
  return newest.conclusion;
}

// Status of `requestedSha` itself when it does not supply the timed build the
// endpoint shows. `basisSha` is the nearest built ancestor used for path
// confirmation (the selected build when it is an ancestor, else undefined).
export async function requestedRevisionCiStatus(
  requestedSha: string,
  runsAtRequested: readonly ListedRun[],
  basisSha: string | undefined,
  history: ComparisonHistory,
  workflow: string,
): Promise<RequestedRevisionCiStatus> {
  const conclusion = newestCompletedConclusion(runsAtRequested, requestedSha);
  if (conclusion === "skipped") {
    return {
      kind: "skipped",
      explanation: providerSkippedExplanation(requestedSha),
    };
  }
  if (conclusion === "cancelled" || conclusion === "timed_out") {
    return {
      kind: "cancelled",
      explanation: cancelledExplanation(
        requestedSha,
        conclusion === "timed_out",
      ),
    };
  }

  const path = workflowFilePath(workflow);
  if (path === undefined) {
    return {
      kind: "no-build",
      explanation: noBuildExplanation(requestedSha, "numeric-workflow"),
    };
  }
  if (basisSha === undefined) {
    return {
      kind: "no-build",
      explanation: noBuildExplanation(requestedSha, "no-ancestor-basis"),
    };
  }

  const classified = await classifyComparisonPathChanges(
    history,
    requestedSha,
    basisSha,
    path,
    pushEvent,
  );
  if (classified.verdict === "not_required") {
    return {
      kind: "skipped",
      explanation: skippedExplanation(requestedSha, basisSha),
    };
  }
  if (classified.verdict === "required") {
    return {
      kind: "no-build",
      explanation: noBuildExplanation(requestedSha, "required"),
    };
  }
  return {
    kind: "no-build",
    explanation: noBuildExplanation(requestedSha, classified.reason),
  };
}
