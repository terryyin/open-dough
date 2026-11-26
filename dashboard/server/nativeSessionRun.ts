// An admitted attempt's native session (`./launchRun.ts` runs its workflow
// start first): its host opens the session, or recovers a recorded one whose
// first input is unconfirmed, and the launch record is kept with the
// workspace it shows.
import type {
  LaunchRecord,
  LaunchResult,
  RecordedLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { defaultLaunchStartFacts } from "./defaultLaunchStart.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";
import type { LaunchHost } from "./launchHosts.ts";
import { launchRecord } from "./launchRecord.ts";
import { launchRecording } from "./launchRecording.ts";
import { keepRecord } from "./launchRecordStore.ts";
import { establishedLaunch, type Started } from "./launchStart.ts";
import { shownLaunchWorkspace } from "./launchWorkspace.ts";
import type { LocalFolder } from "./localFolder.ts";
import { removeLaunchedStart } from "./startStore.ts";

// The native dispatch a session opens or recovers through: the delivered host
// registry (`./launchHosts.ts`) in production.
export type NativeDispatch = (
  host: RecordedLaunchRequest["host"],
) => Pick<LaunchHost, "launch" | "recover"> | undefined;

// What this server lends each native session: its done marks and dispatch.
export type NativeSessionServices = {
  readonly doneMarks: NativeDoneMarks;
  readonly native: NativeDispatch;
};

export async function nativeSessionRun(
  source: PublishedSource,
  recording: RecordedLaunchRequest,
  folder: LocalFolder,
  began: Date,
  start: Exclude<Started, { kind: "stopped" }>,
  controller: AbortController,
  { doneMarks, native }: NativeSessionServices,
  pending?: LaunchRecord,
): Promise<LaunchResult> {
  const host = native(recording.host);
  if (host === undefined) {
    throw new Error("An admitted launch has no available host.");
  }
  const facts =
    pending ??
    establishedLaunch(start)?.handoff.established ??
    (await defaultLaunchStartFacts(recording, folder));
  const evidence = launchRecording(recording, began, facts, pending, doneMarks);
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
    launchRecord(recording, launched.session, facts, new Date().toISOString());
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
