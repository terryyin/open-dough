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
import { localFolder, machineFolder } from "./projectFolders.ts";
import { configuredProject } from "./projectConfiguration.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { nativeDoneMarkPending } from "../src/doneMark.ts";
import { sessionKey } from "../src/sessionReference.ts";

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
        : nativeDoneMarkPending,
  };
}

// A read-only query lets confirmed Done receipts be acknowledged without a
// write lock. Pending native work is continued by `NativeDoneMarks` below.
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

// The native Done of one mark: the developer's, which also stops the session,
// or a quiet report's, which a closing server abandons.
type NativeDone =
  | {
      readonly intent: "manual";
      readonly launches: AgentLaunches;
      readonly source: PublishedSource;
    }
  | { readonly intent: "reporting"; readonly stopped: AbortSignal };

// Runs the native Done each quiet report asks for once its receipt is sent,
// outside the reporting locks, one at a time per session. The developer's
// Done takes over a session's running one. Closing abandons their waits and
// writes nothing, so the pending mark stays for Mark as done or a delivery
// retry; no wait outlives its one bounded rename attempt.
export class NativeDoneMarks {
  private readonly running = new Map<
    string,
    { readonly stop: AbortController; readonly settled: Promise<unknown> }
  >();
  private closed = false;

  constructor(private readonly terminals: AgentTerminals) {}

  // Starts the native Done `receipt` asked for, unless the record no longer
  // waits for it or its session's Done already runs. Failures stay in the
  // record for the developer's Done action.
  reported(sourceId: string, receipt: CompletionReport): void {
    if (this.closed || !completedWithoutAttention(receipt)) return;
    void this.continueReported(sourceId, receipt).catch(() => undefined);
  }

  private async continueReported(
    sourceId: string,
    receipt: CompletionReport,
  ): Promise<void> {
    const current = (await keptRecords(sourceId)).find(
      (entry) => entry.completion?.receipt === receipt.receipt,
    );
    if (this.closed || !reportedNativeDonePending(current, receipt)) return;
    const key = sessionKey(current.session);
    if (this.running.has(key)) return;
    const stop = new AbortController();
    await this.track(key, stop, () =>
      finishNativeDone(
        sourceId,
        current,
        reportingFolder(sourceId),
        this.terminals,
        { intent: "reporting", stopped: stop.signal },
      ),
    );
  }

  // The developer's Done: ends the session's reported Done first, so one
  // rename runs and that Done's late write stays dropped.
  async markDone(
    source: PublishedSource,
    record: LaunchRecord,
    folder: ProjectFolder,
    launches: AgentLaunches,
  ): Promise<LaunchRecord> {
    const key = sessionKey(record.session);
    const running = this.running.get(key);
    running?.stop.abort();
    await running?.settled;
    return this.track(key, new AbortController(), () =>
      markSessionDone(source, record, folder, launches, this.terminals),
    );
  }

  close(): void {
    this.closed = true;
    for (const { stop } of this.running.values()) stop.abort();
  }

  // Runs one Done of the session `key` as the one its next Done waits for.
  private async track<T>(
    key: string,
    stop: AbortController,
    done: () => Promise<T>,
  ): Promise<T> {
    const settled = done();
    this.running.set(key, { stop, settled: settled.catch(() => undefined) });
    try {
      return await settled;
    } finally {
      if (this.running.get(key)?.stop === stop) this.running.delete(key);
    }
  }
}

// A reported Done renames from the reporting project's folder, as the
// developer's would.
function reportingFolder(sourceId: string): ProjectFolder {
  const project = configuredProject(sourceId);
  return project === undefined
    ? machineFolder()
    : localFolder(project.localPath);
}

async function finishNativeDone(
  sourceId: string,
  record: LaunchRecord,
  folder: ProjectFolder,
  terminals: AgentTerminals,
  done: NativeDone,
): Promise<LaunchRecord> {
  const { intent } = done;
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
        (session, at, use, signal) =>
          terminals.withAttachment(session, at, use, signal),
        intent,
        done.intent === "reporting" ? done.stopped : undefined,
      );
    });
  }
  // An abandoned wait leaves the mark as it was.
  if (done.intent === "reporting" && done.stopped.aborted) return record;
  if (done.intent === "manual") {
    terminals.endAttachments(record.session);
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

async function markSessionDone(
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
  return finishNativeDone(source.id, marked, folder, terminals, {
    intent: "manual",
    launches,
    source,
  });
}
