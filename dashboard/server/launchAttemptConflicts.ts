// What the launch attempt owner (`./launchAttemptOwner.ts`) answers instead
// of accepting or continuing a launch, with nothing started: the launch
// would duplicate an unsettled attempt of the same launch or its story's
// unresolved attempt, the story already has an open session on this machine,
// this machine's kept attempts or launch records cannot be read, or the
// attempt to continue is not one this machine keeps as needing
// reconciliation.

import {
  isOpen,
  needsReconciliation,
  sessionOpenExplanation,
  storyOf,
  unreadableLaunchRecordsExplanation,
  unresolvedAttempt,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchRecord,
  type RecordedLaunchRequest,
} from "../src/agentLaunch.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { alreadyStarting } from "./startLaunch.ts";

// What was answered before anything was accepted or started.
export type Unaccepted = Exclude<Acceptance, { kind: "accepted" }>;

const sameStory = (
  one: AgentLaunchRequest | RecordedLaunchRequest,
  other: AgentLaunchRequest | RecordedLaunchRequest,
) => {
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

export const unreadableLaunchRecords: Unaccepted = {
  kind: "failed",
  reason: "unrecorded",
  explanation: unreadableLaunchRecordsExplanation,
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

export const recheckRunning: Unaccepted = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This start is being rechecked on this machine, so it was not continued. Wait for that recheck's result; nothing new was started.",
};

const settledAttempt: Unaccepted = {
  kind: "failed",
  reason: "refused",
  explanation:
    "This start no longer needs reconciliation, so nothing was continued.",
};

export const sessionOpen: Unaccepted = {
  kind: "failed",
  reason: "session-open",
  explanation: sessionOpenExplanation,
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

// Why a start of a story whose unresolved attempt no server runs is refused:
// the attempt never settled, or settled while its session or publication may
// or may not exist.
const unresolvedStart = (attempt: AttemptObservation) =>
  `An earlier start of this story on this machine ${attempt.outcome === undefined ? "was interrupted and needs" : "needs"} reconciliation, so a second start was not made. Recheck or continue it from Startup recovery. Nothing was launched.`;

// The session the continued attempt already launched, when its outcome names
// one, or any open record of that attempt's exact launch (`sameLaunch`): a
// continuation may proceed while those alone stay open, including when the
// launch settled uncertain after creating its conversation.
const ownOpenSession = (
  record: LaunchRecord,
  known: readonly AttemptObservation[],
  continued?: string,
) => {
  if (continued === undefined) return false;
  const attempt = known.find((entry) => entry.id === continued);
  if (attempt === undefined) return false;
  if (sameLaunch(attempt.request, record.request)) return true;
  return (
    attempt.outcome?.kind === "launched" &&
    sessionKey(record.session) === sessionKey(attempt.outcome.session)
  );
};

// What the request would duplicate: the same launch on any host that this
// server runs (`running`), the unresolved attempt of its story among the
// attempts this machine knows (`known`, `unresolvedAttempt`) -- one this
// server runs, or one only its own continuation resumes -- or an open
// launch record of its story among `records` (undefined when that file
// could not be read). A continuation of the attempt `continued` conflicts
// only with a different unresolved attempt, and with an open session that
// is not that attempt's own launch record or launched session.
export function conflicting(
  request: AgentLaunchRequest,
  running: readonly AgentLaunchRequest[],
  known: readonly AttemptObservation[],
  records: ReadonlyMap<string, readonly LaunchRecord[]> | undefined,
  continued?: string,
): Unaccepted | undefined {
  const submitted = alreadySubmitted(request, running);
  if (submitted !== undefined) return submitted;
  const unresolved = unresolvedAttempt(
    known.filter((attempt) => sameStory(request, attempt.request)),
  );
  if (unresolved !== undefined && unresolved.id !== continued) {
    return {
      kind: "failed",
      reason: "already-starting",
      explanation: unresolved.owned
        ? alreadyStarting
        : unresolvedStart(unresolved),
    };
  }
  if (storyOf(request) === undefined) return undefined;
  if (records === undefined) return unreadableLaunchRecords;
  const open = (records.get(request.source) ?? []).filter(
    (record) => sameStory(request, record.request) && isOpen(record),
  );
  if (open.some((record) => !ownOpenSession(record, known, continued))) {
    return sessionOpen;
  }
  return undefined;
}
