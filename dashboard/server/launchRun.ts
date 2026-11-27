// An accepted launch attempt's run (`./launchAttemptOwner.ts`): its workflow
// start, then the common native launch/recovery lifetime
// (`./nativeSessionRun.ts`), which preserves the original request and
// established facts while its host owns native input and reconciliation.
import { homedir } from "node:os";
import type { LaunchResult } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { publicationOf, started, startTimeoutMs } from "./launchStart.ts";
import { pendingInputOf } from "./launchRecordStore.ts";
import { startStore } from "./startStore.ts";
import {
  publicationRecordingFailure,
  settleSessionResult,
} from "./sessionStartSettlement.ts";
import { recordedRequest, withStartPolicy } from "./hostLaunch.ts";
import type { OwnedAttempt } from "./ownedAttempts.ts";
import type { AttemptRunNotes } from "./launchAttemptSettlement.ts";
import { attemptWorker } from "./launchAttemptWorker.ts";
import { establishedFacts } from "./startLaunch.ts";
import type { StartProgress } from "./startProgress.ts";
import { keepAttempt } from "./launchAttemptStore.ts";
import {
  prepareAttemptReporting,
  refuseIncompleteKnownReporting,
} from "./launchReportingPreparation.ts";
import { takeTerminalHandoff, withTerminalHandoff } from "./terminalHandoff.ts";
import { launchWait } from "./launchWait.ts";
import { storyOf } from "../src/launchWorkflow.ts";
import {
  nativeSessionRun,
  type NativeSessionServices,
} from "./nativeSessionRun.ts";

// What the server lends each attempt's run, including the owner that notes
// its changing state when the run belongs to a settlement.
export type AttemptRunServices = NativeSessionServices & {
  readonly progress: StartProgress;
  readonly notes?: Partial<AttemptRunNotes>;
};

// Runs the attempt and settles its retained session establishment.
export async function attemptRun(
  source: PublishedSource,
  own: OwnedAttempt,
  services: AttemptRunServices,
): Promise<LaunchResult> {
  const result = await startedRun(source, own, services);
  return settleSessionResult(source, own.request, own.attempt.id, result);
}

function refusedUnboundStart(subject: string): LaunchResult {
  const explanation = `${subject} has no verified story. Nothing was launched.`;
  return { kind: "failed", reason: "start-refused", explanation };
}

async function startedRun(
  source: PublishedSource,
  own: OwnedAttempt,
  services: AttemptRunServices,
): Promise<LaunchResult> {
  const owned = own;
  const { controller, attempt } = owned;
  const { progress, notes } = services;
  const noteWorker = notes?.worker;
  const { request } = owned;
  if (
    request.workflow === "ad-hoc" &&
    request.followUp !== undefined &&
    request.followUp.storyIdentity === undefined
  )
    return refusedUnboundStart("The retained follow-up");
  const attachTerminal = takeTerminalHandoff(attempt.id);
  const folder = executionCheckout(source);
  const began = new Date(attempt.acceptedAt);
  const requested = recordedRequest(request, began);
  const pending = await pendingInputOf(source.id, request);
  const refused = await refuseIncompleteKnownReporting(
    source,
    request,
    folder,
    attempt,
    pending,
  );
  if (refused !== undefined) return refused;
  const start =
    pending === undefined
      ? await started(
          source,
          request,
          folder,
          progress,
          {
            store: (workflow) => startStore(workflow, homedir()),
            env: process.env,
            warningMs: startTimeoutMs(),
          },
          attempt.id,
          notes?.slow,
          noteWorker === undefined
            ? undefined
            : (pid) => noteWorker(attemptWorker("start", pid)),
          began,
        )
      : ({ kind: "none" } as const);
  let endWait: (() => void) | undefined;
  try {
    const publication =
      pending !== undefined && attempt.publication.kind === "published"
        ? attempt.publication
        : publicationOf(start, pending);
    try {
      await notes?.publication?.(publication);
    } catch (error) {
      return publicationRecordingFailure(start, publication, error);
    }
    if (start.kind === "stopped") return start.result;
    const baseRecording =
      pending?.request ??
      (start.kind === "established"
        ? withStartPolicy(requested, start.policy)
        : start.kind === "session" &&
            start.publication.kind === "published" &&
            requested.workflow === "ad-hoc"
          ? {
              ...requested,
              storyIdentity: start.publication.identity,
              title: start.storyTitle ?? requested.title,
            }
          : requested);
    if (storyOf(baseRecording) === undefined)
      return refusedUnboundStart("This start");
    const kept = pending?.request.reporting ?? attempt.reporting;
    const preparedReporting = await prepareAttemptReporting(
      owned.attempt,
      start,
      folder,
      pending,
      kept,
    );
    if (preparedReporting.kind === "failed") return preparedReporting.result;
    const prepared = preparedReporting.prepared;
    const reporting = prepared?.reporting;
    if (prepared !== undefined) {
      // Kept before this server answers it.
      const withReporting = { ...owned.attempt, ...prepared };
      await keepAttempt(withReporting);
      owned.attempt = withReporting;
    }
    const recording =
      reporting === undefined ? baseRecording : { ...baseRecording, reporting };
    await noteWorker?.(attemptWorker("launch"));
    endWait = launchWait(() => {
      controller.abort();
    });
    return await withTerminalHandoff(attachTerminal, () =>
      nativeSessionRun(
        source,
        recording,
        folder,
        began,
        start,
        controller,
        services,
        pending,
      ),
    );
  } finally {
    endWait?.();
    if (start.kind === "established") {
      progress
        .for(start.workflow.workflow)
        .clear(source.id, establishedFacts(start.handoff.established).identity);
    }
  }
}
