// A developer-facing Stop, separate from Mark as done: it asks the
// session's host boundary to stop the session and trusts only the host's
// confirmation. A confirmed stop clears any retained unconfirmed-stop
// explanation; an unconfirmed one retains its explanation on the record,
// naming the remaining state. Stop never writes the done mark, and never
// deletes the conversation or workspace.
import type { LaunchRecord, LaunchWithState } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StopSessionAnswer } from "../src/sessionStop.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import { launchHost } from "./launchHosts.ts";
import { setRecordStopUnconfirmed } from "./launchRecordStore.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// The wait before Stop reports itself unconfirmed.
const stopWaitMs = 10_000;

export type StoppedSession = {
  readonly kind: StopSessionAnswer["kind"];
  readonly explanation?: string;
  readonly record: LaunchWithState;
};

export async function stopRecordedSession(
  source: PublishedSource,
  record: LaunchRecord,
  folder: ProjectFolder,
  launches: AgentLaunches,
): Promise<StoppedSession> {
  const host = launchHost(record.session.host);
  const stop = host?.stop?.bind(host);
  if (host === undefined || stop === undefined) {
    throw new Error("This host cannot stop a session.");
  }
  try {
    await stop(record.session, folder, AbortSignal.timeout(stopWaitMs));
  } catch (error) {
    const detail =
      error instanceof HostOperationFailure
        ? error.message
        : "The native operation could not be confirmed.";
    const explanation = detail.startsWith("Stop unconfirmed")
      ? detail
      : `Stop unconfirmed: ${host.name} stop failed: ${detail} Whether this session stopped could not be confirmed; it may still be held and working.`;
    const retained = (await setRecordStopUnconfirmed(
      source.id,
      record.session,
      explanation,
    )) ?? { ...record, stopUnconfirmed: explanation };
    return {
      kind: "unconfirmed",
      explanation,
      record: await launches.stateOf(source, retained),
    };
  }
  const cleared =
    (await setRecordStopUnconfirmed(source.id, record.session, undefined)) ??
    record;
  return {
    kind: "stopped",
    record: await launches.stateOf(source, cleared),
  };
}
