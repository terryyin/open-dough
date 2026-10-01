// Local done intent is durable independently of native rename/interruption.
// Each host owns its native operations; closing attachments only detaches clients.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { AgentTerminals } from "./agentTerminals.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import { launchHost } from "./launchHosts.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { ProjectFolder } from "./projectFolders.ts";

const stopWaitMs = 10_000;

export async function markSessionDone(
  source: PublishedSource,
  record: LaunchRecord,
  folder: ProjectFolder,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<LaunchRecord> {
  const host = launchHost(record.session.host);
  const stop = host?.stop?.bind(host);
  if (host === undefined || stop === undefined)
    throw new Error("This host cannot mark a session done.");
  const doneAt = new Date().toISOString();
  let marked =
    (await setRecordDoneAt(source.id, record.session, doneAt)) ??
    ({ ...record, doneAt } satisfies LaunchRecord);
  const problems: string[] = [];
  const attempt = async (operation: string, run: () => Promise<void>) => {
    try {
      await run();
    } catch (error) {
      problems.push(
        `${host.name} ${operation} failed: ${error instanceof HostOperationFailure ? error.message : "The native operation could not be confirmed."}`,
      );
    }
  };
  // Claude's native rename needs its current attachment before detachment.
  await attempt(
    "rename",
    () =>
      host.rename?.(record, folder, (session, input) =>
        terminals.type(session, input),
      ) ?? Promise.resolve(),
  );
  terminals.endAttachments(record.session);
  const { sessionState } = await launches.stateOf(source, record);
  if (sessionState.kind !== "unavailable") {
    await attempt("stop", () =>
      stop(record.session, folder, AbortSignal.timeout(stopWaitMs)),
    );
  }
  if (problems.length > 0) {
    const doneProblem = `Local done mark retained. ${problems.join(" ")}`;
    marked = (await setRecordDoneAt(source.id, record.session, doneAt, {
      doneProblem,
      expectedDoneAt: doneAt,
    })) ?? { ...marked, doneProblem };
  }
  return marked;
}
