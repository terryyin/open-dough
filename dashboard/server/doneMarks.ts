// Mark the local record done, end its dashboard attachments and ask its host
// to rename/stop the native session. Native typing/polling details belong to the
// host; the mark remains machine-local evidence and never changes a story fact.

import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { AgentTerminals } from "./agentTerminals.ts";
import { launchHost } from "./launchHosts.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const stopWaitMs = 10_000;

// Marks the recorded session done and stops it unless Claude Code no longer
// lists it, answering the marked record.
export async function markSessionDone(
  source: PublishedSource,
  record: LaunchRecord,
  folder: ProjectFolder,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<LaunchRecord> {
  const host = launchHost(record.session.host);
  if (host?.stop === undefined)
    throw new Error("This host cannot mark a session done.");
  await host.rename?.(record, folder, (session, input) =>
    terminals.type(session, input),
  );
  const doneAt = new Date().toISOString();
  const marked =
    (await setRecordDoneAt(source.id, record.session, doneAt)) ??
    ({ ...record, doneAt } satisfies LaunchRecord);
  terminals.endAttachments(record.session);
  const { sessionState } = await launches.stateOf(source, record);
  if (sessionState.kind !== "unlisted") {
    await host.stop(record.session, folder, AbortSignal.timeout(stopWaitMs));
  }
  return marked;
}
