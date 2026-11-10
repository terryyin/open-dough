// Published completion selects the record; the ledger supplies its frozen facts.
import type {
  CiFollowUpAttempt,
  CiFollowUpReading,
} from "../src/ciFollowUpReading.ts";
import { exactAttemptUrl } from "../src/ciRunAttemptUrl.ts";
import { historyWallTimeMs } from "../src/landedCiHistory.ts";
import { wallTimeReadingOf } from "./ciWallTimeReference.ts";
import type { RepeatRequest } from "./ciFollowUpStore.ts";
import type { SelectedLanding } from "./completedCiFollowUps.ts";
import type { KeptBuild } from "./landedCiObservation.ts";

function attemptOf(
  request: RepeatRequest,
  build: KeptBuild,
): CiFollowUpAttempt {
  const reading = wallTimeReadingOf(build);
  const ms = historyWallTimeMs(build.startedAt, build.completedAt);
  const runUrl = exactAttemptUrl(
    request.repository,
    build.runId,
    build.runAttempt,
    build.runUrl,
  );
  return {
    revision: build.revision,
    workflowId: request.workflowId,
    ...(build.runId === undefined ? {} : { runId: build.runId }),
    ...(build.runAttempt === undefined ? {} : { runAttempt: build.runAttempt }),
    ...(runUrl === undefined ? {} : { runUrl }),
    ...(build.startedAt === undefined ? {} : { startedAt: build.startedAt }),
    ...(build.completedAt === undefined
      ? {}
      : { completedAt: build.completedAt }),
    ...(ms === undefined ? {} : { ms }),
    ...(reading.ms === undefined ? {} : { comparableMs: reading.ms }),
    completeness: reading.reason ?? "Complete comparable proof",
    verdict: build.state === "pass" ? "success" : "failed",
    ...(build.proof === undefined ? {} : { proof: build.proof }),
  };
}

function repeatOf(request: RepeatRequest): CiFollowUpAttempt | undefined {
  if (request.outcome.repeat !== undefined)
    return attemptOf(request, request.outcome.repeat);
  const observed = request.outcome.observed;
  if (observed === undefined) return undefined;
  const ms = historyWallTimeMs(observed.startedAt, observed.completedAt);
  const runUrl = exactAttemptUrl(
    request.repository,
    observed.runId,
    observed.runAttempt,
    observed.runUrl,
  );
  return {
    revision: observed.revision,
    workflowId: observed.workflowId,
    runId: observed.runId,
    runAttempt: observed.runAttempt,
    ...(runUrl === undefined ? {} : { runUrl }),
    ...(observed.startedAt === undefined
      ? {}
      : { startedAt: observed.startedAt }),
    ...(observed.completedAt === undefined
      ? {}
      : { completedAt: observed.completedAt }),
    ...(ms === undefined ? {} : { ms }),
    verdict: observed.conclusion ?? "unverified",
    ...(observed.status === undefined ? {} : { status: observed.status }),
    completeness: request.outcome.explanation,
  };
}

export function retainedFollowUpOf(
  landing: SelectedLanding,
): CiFollowUpReading | undefined {
  const request = landing.request;
  if (request === undefined || landing.identity === undefined) return undefined;
  const repeat = repeatOf(request);
  return {
    identity: landing.identity,
    at: landing.at,
    revision: landing.revision,
    repository: request.repository,
    workflow: request.workflow,
    workflowId: request.workflowId,
    requestedAt: request.requestedAt,
    kind: request.outcome.kind,
    explanation: request.outcome.explanation,
    submission: request.submission.explanation ?? request.submission.kind,
    reference: request.reference,
    rule: request.rule,
    original: attemptOf(request, request.original),
    ...(repeat === undefined ? {} : { repeat }),
  };
}
