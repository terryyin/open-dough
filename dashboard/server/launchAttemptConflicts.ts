// What the launch attempt owner (`./launchAttemptOwner.ts`) answers instead
// of accepting or continuing a launch, with nothing started: the launch
// would duplicate an unsettled attempt of the same story or launch,
// this machine's kept attempts cannot be read, or the attempt to continue is
// not one this machine keeps as needing reconciliation.

import {
  needsReconciliation,
  storyOf,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchAttemptRecord,
} from "../src/agentLaunch.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { alreadyStarting } from "./startLaunch.ts";

// What was answered before anything was accepted or started.
export type Unaccepted = Exclude<Acceptance, { kind: "accepted" }>;

const sameStory = (one: AgentLaunchRequest, other: AgentLaunchRequest) => {
  const story = storyOf(one);
  return (
    story !== undefined &&
    other.source === one.source &&
    storyOf(other) === story
  );
};

export const unreadableEvidence: Unaccepted = {
  kind: "failed",
  reason: "unrecorded",
  explanation:
    "This machine's launch evidence (~/.open-dough/dashboard/launch-attempts.json) could not be read, so an earlier start may still need reconciliation. Repair or move that file aside before starting; nothing was started.",
};

export const unrecordedAcceptance: Unaccepted = {
  kind: "failed",
  reason: "unrecorded",
  explanation:
    "This machine's launch evidence could not be written, so the launch was not accepted. Nothing was started or launched.",
};

export const unknownAttempt: Unaccepted = {
  kind: "failed",
  reason: "refused",
  explanation:
    "This machine keeps no such launch attempt for this project, so nothing was continued.",
};

const runningAttempt: Unaccepted = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This start is already running on this machine. Wait for its result; nothing new was started.",
};

export const startStillRunning: Unaccepted = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This story's earlier start is still running on this machine, so it was not continued. Recheck once it ends; nothing new was started.",
};

const settledAttempt: Unaccepted = {
  kind: "failed",
  reason: "refused",
  explanation:
    "This start no longer needs reconciliation, so nothing was continued.",
};

// Why an attempt is not continued, when it is not: it runs now, or it needs
// no reconciliation.
export function notContinued(
  attempt: AttemptObservation,
): Unaccepted | undefined {
  if (attempt.owned) return runningAttempt;
  return needsReconciliation(attempt) ? undefined : settledAttempt;
}

// The answer to a launch matching, on any host, one this server still runs
// (`running`), answered ahead of any other pre-launch check.
export function alreadySubmitted(
  request: AgentLaunchRequest,
  running: readonly AgentLaunchRequest[],
): Unaccepted | undefined {
  return running.some((other) => sameLaunch(other, request))
    ? {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
      }
    : undefined;
}

const interruptedStart =
  "An earlier start of this story on this machine was interrupted and needs reconciliation, so a second start was not made. Recheck or continue it from Startup recovery. Nothing was launched.";

// An unsettled attempt the request would duplicate: the same launch on any
// host or any workflow's launch of the same story that this server runs (`running`),
// or a launch of the same story that no server runs any more
// (`interrupted`), which only its own continuation resumes.
export function conflicting(
  request: AgentLaunchRequest,
  running: readonly AgentLaunchRequest[],
  interrupted: readonly LaunchAttemptRecord[],
): Unaccepted | undefined {
  const submitted = alreadySubmitted(request, running);
  if (submitted !== undefined) return submitted;
  if (running.some((other) => sameStory(request, other)))
    return {
      kind: "failed",
      reason: "already-starting",
      explanation: alreadyStarting,
    };
  if (interrupted.some((other) => sameStory(request, other.request)))
    return {
      kind: "failed",
      reason: "already-starting",
      explanation: interruptedStart,
    };
  return undefined;
}
