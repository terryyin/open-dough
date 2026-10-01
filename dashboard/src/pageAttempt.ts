// What this page keeps of a launch it asked for (`./launchAttempts.ts`),
// under the work item's workflow or the project's ad hoc key, and what the
// asking action shows of it: still starting, or a settled problem (an
// unacknowledged one included). A launched outcome shows nothing here; its
// record is presented instead.

import type {
  AgentLaunchRequest,
  AttemptObservation,
  AttemptOutcome,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import type { AcceptanceAnswer, LaunchProblem } from "./agentLaunchClient.ts";

// A launch the developer asked for from this page that has no record:
// still starting (asked and unanswered, or accepted and unsettled), or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// Presents the record of a launch this page asked for, once its session is
// listed.
export type OnLaunched = (record: LaunchWithState) => void;

export type PageAttempt =
  | { readonly kind: "submitting"; readonly request: AgentLaunchRequest }
  // Answered with no answer this page can trust: until a read of the
  // machine's attempts asked after the first `lostAfter` reads answers,
  // whether the service accepted it is unknown.
  | {
      readonly kind: "unacknowledged";
      readonly request: AgentLaunchRequest;
      readonly problem: LaunchProblem;
      readonly lostAfter: number;
    }
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
  if (page.kind === "unacknowledged") return page.problem;
  if (page.kind !== "accepted") return page;
  const { outcome } = latest(page.attempt);
  if (outcome === undefined) return { kind: "starting" };
  return outcome.kind === "launched" ? undefined : problemOf(outcome);
}

// What this page keeps of a launch once its acceptance was answered (but
// for existing changes, which the dialog asks about): the accepted attempt
// it follows, a lost answer still to check against a read asked after the
// first `lostAfter` reads, or the problem answered.
export function answeredAttempt(
  answer: Exclude<AcceptanceAnswer, { kind: "existing-changes" }>,
  request: AgentLaunchRequest,
  onLaunched: OnLaunched,
  lostAfter: number,
): PageAttempt {
  if (answer.kind === "accepted")
    return { kind: "accepted", attempt: answer.attempt, onLaunched };
  const problem = { kind: answer.kind, explanation: answer.explanation };
  return answer.kind === "uncertain" && answer.unacknowledged === true
    ? { kind: "unacknowledged", request, problem, lostAfter }
    : problem;
}

// A launch whose answer this page lost, not yet checked against a read.
export type Unacknowledged = Extract<PageAttempt, { kind: "unacknowledged" }>;

// The requests this page submitted and has no answer to yet, and the
// launches whose answer it lost.
export type AskedRequests = {
  readonly submitting: readonly AgentLaunchRequest[];
  readonly unacknowledged: readonly Unacknowledged[];
};

export function askedRequests(pages: readonly PageAttempt[]): AskedRequests {
  return {
    submitting: pages.flatMap((page) =>
      page.kind === "submitting" ? [page.request] : [],
    ),
    unacknowledged: pages.flatMap((page) =>
      page.kind === "unacknowledged" ? [page] : [],
    ),
  };
}
