// An accepted launch attempt's run (`./launchAttemptOwner.ts`): its workflow
// start, then the common native launch/recovery lifetime, which preserves the
// original request and established facts while its host owns native input
// and reconciliation.
import type {
  PublicationReceipt,
  RecordedLaunchRequest,
  LaunchRecord,
  LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { projectFolder, type ProjectFolder } from "./projectFolders.ts";
import { publicationOf, started, type Started } from "./launchStart.ts";
import { launchHost } from "./launchHosts.ts";
import { launchRecording } from "./launchRecording.ts";
import { keepRecord, pendingInputOf } from "./launchRecordStore.ts";
import { removeStart } from "./startStore.ts";
import { recordedRequest, withStartPolicy } from "./hostLaunch.ts";
import type { OwnedAttempt } from "./ownedAttempts.ts";
import { establishedFacts } from "./startLaunch.ts";
import type { StartProgress } from "./startProgress.ts";

const defaultLaunchWaitMs = 30_000;

// A bounded launch wait; test configuration may shorten it.
function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

export async function attemptRun(
  source: PublishedSource,
  { request, controller, attempt }: OwnedAttempt,
  notePublication: (publication: PublicationReceipt) => Promise<void>,
  progress: StartProgress,
): Promise<LaunchResult> {
  const folder = projectFolder(source);
  const began = new Date(attempt.acceptedAt);
  const requested = recordedRequest(request, began);
  const pending = await pendingInputOf(source.id, request);
  const start =
    pending === undefined
      ? await started(source, request, folder, progress)
      : ({ kind: "none" } as const);
  await notePublication(publicationOf(start, pending));
  if (start.kind === "stopped") return start.result;
  const recording =
    pending?.request ??
    (start.kind === "established"
      ? withStartPolicy(requested, start.policy)
      : requested);
  const timer = setTimeout(() => {
    controller.abort();
  }, launchTimeoutMs());
  try {
    return await launchRun(
      source,
      recording,
      folder,
      began,
      start,
      controller,
      pending,
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
  pending?: LaunchRecord,
): Promise<LaunchResult> {
  const host = launchHost(recording.host);
  if (host === undefined) {
    throw new Error("An admitted launch has no available host.");
  }
  const evidence = launchRecording(
    recording,
    began,
    pending ?? (start.kind === "established" ? start.handoff.established : {}),
    pending,
  );
  const launched =
    pending === undefined
      ? await host.launch(
          source,
          recording,
          folder,
          controller.signal,
          start.kind === "established" ? start : undefined,
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
  const record: LaunchRecord = evidence.retained ?? {
    request: recording,
    session: launched.session,
    ...(start.kind === "established" ? start.handoff.established : {}),
    launchedAt: new Date().toISOString(),
  };
  if (evidence.retained === undefined) await keepRecord(source.id, record);
  const facts = record.start ?? record.preparation;
  if (facts !== undefined && recording.workflow !== "ad-hoc") {
    await removeStart(source.id, facts.identity, recording.workflow);
  }
  return {
    kind: "launched",
    record: { ...record, sessionState: launched.sessionState },
  };
}
