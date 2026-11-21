// Carries out one Done mark's native rename, stop or removal, then records its outcome.
// Each host owns its native operations; closing attachments only detaches clients.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { AgentTerminals } from "./agentTerminals.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import type { LaunchHost } from "./launchHosts.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// The wait before Done reports a native stop or removal unconfirmed.
const nativeWaitMs = 10_000;

export type DoneLaunches = Pick<AgentLaunches, "stateOf">;
export type DoneTerminals = Pick<
  AgentTerminals,
  "withAttachment" | "endAttachments"
>;
export type DoneHost = Pick<
  LaunchHost,
  "name" | "rename" | "doneStop" | "localDone" | "remove"
>;

// The native Done of one mark: the developer's, which also stops the session,
// or a quiet report's, which a closing server abandons.
export type NativeDone = { readonly stopped: AbortSignal } & (
  | {
      readonly intent: "manual";
      readonly launches: DoneLaunches;
      readonly source: PublishedSource;
    }
  | { readonly intent: "reporting" }
);

export async function finishNativeDone(
  sourceId: string,
  record: LaunchRecord,
  folder: ProjectFolder,
  terminals: DoneTerminals,
  host: DoneHost | undefined,
  done: NativeDone,
): Promise<LaunchRecord> {
  const { intent } = done;
  const problems: string[] = [];
  const attempt = async (operation: string, run: () => Promise<void>) => {
    try {
      await run();
    } catch (error) {
      problems.push(
        `${host?.name ?? record.session.host} ${operation} failed: ${error instanceof HostOperationFailure ? error.message : "The native operation could not be confirmed."}`,
      );
    }
  };
  const sessionState =
    done.intent === "manual"
      ? (await done.launches.stateOf(done.source, record)).sessionState
      : undefined;
  // An exited session has no process to stop, and its removed job no name left
  // to show, so neither rename nor stop runs.
  const removal =
    sessionState?.kind === "available" &&
    sessionState.availability === "retained"
      ? host?.remove?.bind(host)
      : undefined;
  if (removal === undefined && host?.rename !== undefined) {
    await attempt("rename", async () => {
      await host.rename?.(
        record,
        folder,
        (session, at, use, signal, ready) =>
          terminals.withAttachment(session, at, use, signal, ready),
        intent,
        done.stopped,
      );
    });
  }
  // An abandoned wait leaves the mark as it was.
  if (done.intent === "reporting" && done.stopped.aborted) return record;
  if (done.intent === "manual") {
    terminals.endAttachments(record.session);
    const stop = host?.doneStop?.bind(host);
    if (removal !== undefined)
      await attempt("removal", () =>
        removal(record.session, folder, AbortSignal.timeout(nativeWaitMs)),
      );
    else if (sessionState?.kind !== "unavailable" && stop !== undefined)
      await attempt("stop", () =>
        stop(record.session, folder, AbortSignal.timeout(nativeWaitMs)),
      );
  }
  const doneProblem =
    problems.length === 0
      ? undefined
      : `Local done mark retained. ${problems.join(" ")}`;
  return (
    (await setRecordDoneAt(sourceId, record.session, record.doneAt, {
      ...(doneProblem === undefined ? {} : { doneProblem }),
      ...(record.doneAt === undefined ? {} : { expectedDoneAt: record.doneAt }),
      automatic: intent === "reporting",
    })) ?? record
  );
}
