// What this page keeps of a launch it asked for (`./launchAttempts.ts`),
// under the work item's workflow or the project's ad hoc key, and what the
// asking action shows of it: still starting, or a settled problem. A
// launched outcome shows nothing here; its record is presented instead.

import type {
  AgentLaunchRequest,
  AttemptObservation,
  AttemptOutcome,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import type { LaunchProblem } from "./agentLaunchClient.ts";

// A launch the developer asked for from this page that has no record:
// still starting (asked and unanswered, or accepted and unsettled), or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// Presents the record of a launch this page asked for, once its session is
// listed.
export type OnLaunched = (record: LaunchWithState) => void;

export type PageAttempt =
  | { readonly kind: "submitting"; readonly request: AgentLaunchRequest }
  | {
      readonly kind: "accepted";
      readonly attempt: AttemptObservation;
      readonly onLaunched: OnLaunched;
    }
  | LaunchProblem;

export const attemptKey = (
  sourceId: string,
  identity: string,
  workflow: LaunchWorkflow | "ad-hoc",
) => JSON.stringify([sourceId, identity, workflow]);

// An ad hoc launch has no work item, so its attempt is the project's alone.
export const adHocKey = (sourceId: string) =>
  attemptKey(sourceId, "", "ad-hoc");

// The problem an accepted attempt settled to without a session.
export function problemOf(
  outcome: Exclude<AttemptOutcome, { kind: "launched" }>,
): LaunchProblem {
  return outcome.kind === "existing-changes"
    ? {
        kind: "failed",
        explanation:
          "The default checkout holds changes this start did not confirm, so nothing was started. Start again to review them.",
      }
    : outcome;
}

// What the asking action shows of `page`, an accepted one as its latest
// observation (`latest`) says.
export function shownAttempt(
  page: PageAttempt | undefined,
  latest: (attempt: AttemptObservation) => AttemptObservation,
): LaunchAttempt | undefined {
  if (page === undefined) return undefined;
  if (page.kind === "submitting") return { kind: "starting" };
  if (page.kind !== "accepted") return page;
  const { outcome } = latest(page.attempt);
  if (outcome === undefined) return { kind: "starting" };
  return outcome.kind === "launched" ? undefined : problemOf(outcome);
}
