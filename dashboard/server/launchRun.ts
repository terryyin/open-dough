// The common native launch/recovery lifetime preserves the original request
// and established facts while its host owns native input and reconciliation.
import type {
  RecordedLaunchRequest,
  LaunchRecord,
  LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { Started } from "./launchStart.ts";
import { launchHost } from "./launchHosts.ts";
import { launchRecording } from "./launchRecording.ts";
import { keepRecord } from "./launchRecordStore.ts";
import { removeStart } from "./startStore.ts";
export async function launchRun(
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
              "This conversation's first input is not confirmed. Continue the recorded conversation before starting again.",
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
