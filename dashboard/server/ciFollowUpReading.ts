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
    ...(request.provider === "github"
      ? { workflowId: request.workflowId }
      : {
          ...(build.adapterAttempt === undefined
            ? {}
            : { adapterAttempt: build.adapterAttempt }),
          ...(request.check === undefined ? {} : { check: request.check }),
          ...(request.context === undefined
            ? {}
            : { context: request.context }),
        }),
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
    ...(observed.workflowId === undefined
      ? {}
      : { workflowId: observed.workflowId }),
    ...(observed.runId === undefined ? {} : { runId: observed.runId }),
    ...(observed.runAttempt === undefined
      ? {}
      : { runAttempt: observed.runAttempt }),
    ...(observed.adapterAttempt === undefined
      ? {}
      : { adapterAttempt: observed.adapterAttempt }),
    ...(observed.check === undefined ? {} : { check: observed.check }),
    ...(observed.context === undefined ? {} : { context: observed.context }),
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
    ...(request.provider === "github"
      ? { workflow: request.workflow, workflowId: request.workflowId }
      : {}),
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
