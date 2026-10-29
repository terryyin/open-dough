// An accepted launch attempt's run (`./launchAttemptOwner.ts`): its workflow
// start, then the common native launch/recovery lifetime, which preserves the
// original request and established facts while its host owns native input
// and reconciliation.
import {
  type PublicationReceipt,
  type LaunchAttemptRecord,
  type RecordedLaunchRequest,
  type LaunchRecord,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { projectFolder, type ProjectFolder } from "./projectFolders.ts";
import {
  establishedLaunch,
  publicationOf,
  started,
  type Started,
} from "./launchStart.ts";
import { launchHost } from "./launchHosts.ts";
import { launchRecording } from "./launchRecording.ts";
import { shownLaunchWorkspace } from "./launchWorkspace.ts";
import { launchRecord } from "./launchRecord.ts";
import { keepRecord, pendingInputOf } from "./launchRecordStore.ts";
import { removeLaunchedStart } from "./startStore.ts";
import { settleSessionResult } from "./sessionStartSettlement.ts";
import { recordedRequest, withStartPolicy } from "./hostLaunch.ts";
import type { OwnedAttempt } from "./ownedAttempts.ts";
import { attemptWorker } from "./launchAttemptWorker.ts";
import { establishedFacts } from "./startLaunch.ts";
import { publishedAssignment } from "./startWorkflows.ts";
import type { StartProgress } from "./startProgress.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";

import { keepAttempt } from "./launchAttemptStore.ts";
import {
  prepareAttemptReporting,
  refuseIncompleteKnownReporting,
} from "./launchReportingPreparation.ts";
import { takeTerminalHandoff, withTerminalHandoff } from "./terminalHandoff.ts";

const defaultLaunchWaitMs = 30_000;

// A bounded launch wait; test configuration may shorten it.
// Start and Recover share this rule (`DOUGH_LAUNCH_TIMEOUT_MS`, default 30s).
export function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

// Runs the attempt and settles its retained session establishment.
export async function attemptRun(
  source: PublishedSource,
  own: OwnedAttempt,
  notePublication: (publication: PublicationReceipt) => Promise<void>,
  noteSlow: (slowSince: string) => Promise<void>,
  noteWorker: (
    worker: NonNullable<LaunchAttemptRecord["worker"]>,
  ) => Promise<void>,
  progress: StartProgress,
  doneMarks: NativeDoneMarks,
): Promise<LaunchResult> {
  const result = await startedRun(
    source,
    own,
    notePublication,
    noteSlow,
    noteWorker,
    progress,
    doneMarks,
  );
  return settleSessionResult(source, own.request, own.attempt.id, result);
}

async function startedRun(
  source: PublishedSource,
  own: OwnedAttempt,
  notePublication: (publication: PublicationReceipt) => Promise<void>,
  noteSlow: (slowSince: string) => Promise<void>,
  noteWorker: (
    worker: NonNullable<LaunchAttemptRecord["worker"]>,
  ) => Promise<void>,
  progress: StartProgress,
  doneMarks: NativeDoneMarks,
): Promise<LaunchResult> {
  const owned = own;
  const { request, controller, attempt } = owned;
  const attachTerminal = takeTerminalHandoff(attempt.id);
  const folder = projectFolder(source);
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
          attempt.id,
          noteSlow,
          (pid) => noteWorker(attemptWorker("start", pid)),
        )
      : ({ kind: "none" } as const);
  let timer: NodeJS.Timeout | undefined;
  try {
    try {
      await notePublication(publicationOf(start, pending));
    } catch (error) {
      if (start.kind !== "established") throw error;
      return {
        kind: "failed",
        reason: "unrecorded",
        explanation: `Publication succeeded (${publishedAssignment(start)}, workspace ${start.workspace.shown}), but the receipt could not be recorded in ~/.open-dough/dashboard/launch-attempts.json: ${error instanceof Error ? error.message : String(error)}. Repair the file, then Continue; nothing more was started.`,
      };
    }
    if (start.kind === "stopped") return start.result;
    const baseRecording =
      pending?.request ??
      (start.kind === "established"
        ? withStartPolicy(requested, start.policy)
        : requested);
    const kept = pending?.request.reporting ?? attempt.reporting;
    const preparedReporting = await prepareAttemptReporting(
      attempt,
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
    await noteWorker(attemptWorker("launch"));
    timer = setTimeout(() => {
      controller.abort();
    }, launchTimeoutMs());
    return await withTerminalHandoff(attachTerminal, () =>
      launchRun(
        source,
        recording,
        folder,
        began,
        start,
        controller,
        doneMarks,
        pending,
      ),
    );
  } finally {
    clearTimeout(timer);
    if (start.kind === "established") {
      progress
        .for(start.workflow.workflow)
        .clear(source.id, establishedFacts(start.handoff.established).identity);
    }
  }
}

async function launchRun(
  source: PublishedSource,
  recording: RecordedLaunchRequest,
  folder: ProjectFolder,
  began: Date,
  start: Exclude<Started, { kind: "stopped" }>,
  controller: AbortController,
  doneMarks: NativeDoneMarks,
  pending?: LaunchRecord,
): Promise<LaunchResult> {
  const host = launchHost(recording.host);
  if (host === undefined) {
    throw new Error("An admitted launch has no available host.");
  }
  const evidence = launchRecording(
    recording,
    began,
    pending ?? establishedLaunch(start)?.handoff.established ?? {},
    pending,
    doneMarks,
  );
  const launched =
    pending === undefined
      ? await host.launch(
          source,
          recording,
          folder,
          controller.signal,
          establishedLaunch(start),
          evidence,
        )
      : host.recover === undefined
        ? ({
            kind: "uncertain",
            reason: "unconfirmed",
            explanation:
              "This launch's recorded conversation has a first input that is not confirmed, so no other conversation was started. Check the recorded conversation for that input.",
          } as const)
        : await host.recover(pending, controller.signal, evidence);
  if (launched.kind !== "launched") {
    return start.kind === "established" && launched.kind === "failed"
      ? {
          ...launched,
          explanation: `${launched.explanation} ${start.workflow.publishedWithoutSession(start)}`,
        }
      : launched;
  }
  const record =
    evidence.retained ??
    launchRecord(
      recording,
      launched.session,
      establishedLaunch(start)?.handoff.established ?? {},
      new Date().toISOString(),
    );
  if (evidence.retained === undefined)
    await keepRecord(source.id, record, doneMarks);
  await removeLaunchedStart(source.id, record);
  return {
    kind: "launched",
    record: {
      ...record,
      ...shownLaunchWorkspace(record, folder),
      sessionState: launched.sessionState,
    },
  };
}
