// Local done intent is durable independently of native rename/interruption.
// Each host owns its native operations; closing attachments only detaches clients.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import type { AgentTerminals } from "./agentTerminals.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import { launchHost } from "./launchHosts.ts";
import { keptRecords, setRecordDoneAt } from "./launchRecordStore.ts";
import {
  completedWithoutAttention,
  doneAutomatically,
} from "../src/completionReport.ts";
import { machineFolder } from "./projectFolders.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// The wait before Done reports a native stop or removal unconfirmed.
const nativeWaitMs = 10_000;

// Both reporting and explicit Done use this durable intent. Reporting keeps
// the receipt's time and leaves later explicit Done/reopen intent independent.
export function doneSessionRecord(
  record: LaunchRecord,
  doneAt: string,
): LaunchRecord {
  return {
    ...record,
    doneAt,
    doneProblem:
      record.doneAt !== undefined && record.doneProblem === undefined
        ? undefined
        : "Local done mark retained. Native done mark is pending.",
  };
}

// A read-only query lets confirmed Done receipts be acknowledged without a
// write lock. Pending native work still needs the locked recovery below.
export function reportedNativeDonePending(
  record: LaunchRecord | undefined,
  receipt: CompletionReport,
): record is LaunchRecord {
  return (
    record !== undefined &&
    record.completion?.receipt === receipt.receipt &&
    doneAutomatically(record) &&
    record.doneProblem !== undefined
  );
}

// Runs only the current automatic intent, under the caller's attempt lock.
// Native failures are retained for receipt retry or the developer's Done action.
export async function markReportedSessionDone(
  sourceId: string,
  receipt: CompletionReport,
): Promise<void> {
  if (!completedWithoutAttention(receipt)) return;
  const current = (await keptRecords(sourceId)).find(
    (entry) => entry.completion?.receipt === receipt.receipt,
  );
  if (!reportedNativeDonePending(current, receipt)) return;
  await finishNativeDone(sourceId, current, machineFolder(), "reporting");
}

async function finishNativeDone(
  sourceId: string,
  record: LaunchRecord,
  folder: ProjectFolder,
  intent: "manual" | "reporting",
  launches?: AgentLaunches,
  terminals?: AgentTerminals,
  source?: PublishedSource,
): Promise<LaunchRecord> {
  const host = launchHost(record.session.host);
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
  const manual =
    intent === "manual" &&
    terminals !== undefined &&
    launches !== undefined &&
    source !== undefined
      ? { terminals, launches, source }
      : undefined;
  const sessionState =
    manual === undefined
      ? undefined
      : (await manual.launches.stateOf(manual.source, record)).sessionState;
  // An exited session has no process to stop, and its removed job no name left
  // to show, so neither rename nor stop runs.
  const removal =
    sessionState?.kind === "available" &&
    sessionState.availability === "retained"
      ? host?.remove?.bind(host)
      : undefined;
  if (removal === undefined && host?.rename !== undefined) {
    await attempt("rename", async () => {
      if (intent === "reporting" && host.renameWhileReporting !== true)
        throw new HostOperationFailure(
          "Native rename requires terminal input while the reporting sender is still working. Use Mark as done after reporting finishes.",
        );
      await host.rename?.(
        record,
        folder,
        (session, input) => terminals?.type(session, input) ?? false,
      );
    });
  }
  if (manual !== undefined) {
    manual.terminals.endAttachments(record.session);
    const stop = host?.stop?.bind(host);
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

export async function markSessionDone(
  source: PublishedSource,
  record: LaunchRecord,
  folder: ProjectFolder,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<LaunchRecord> {
  const host = launchHost(record.session.host);
  const stop = host?.stop?.bind(host);
  // A reported session on a host without native stop is acknowledged locally.
  if (record.completion !== undefined && stop === undefined) {
    const marked = await setRecordDoneAt(
      source.id,
      record.session,
      new Date().toISOString(),
    );
    if (marked === undefined)
      throw new Error("The reporting session was deleted.");
    return marked;
  }
  if (host === undefined || stop === undefined)
    throw new Error("This host cannot mark a session done.");
  const doneAt = new Date().toISOString();
  const marked =
    (await setRecordDoneAt(source.id, record.session, doneAt)) ??
    doneSessionRecord(record, doneAt);
  return finishNativeDone(
    source.id,
    marked,
    folder,
    "manual",
    launches,
    terminals,
    source,
  );
}
