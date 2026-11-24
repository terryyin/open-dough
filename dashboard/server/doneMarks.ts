// Local done intent is durable independently of native rename/interruption.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  completedWithoutAttention,
  type CompletionReport,
} from "../src/completionReport.ts";
import type { HostIdentity } from "../src/hostDescription.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { sessionKey } from "../src/sessionReference.ts";
import {
  acknowledgeDoneLocally,
  doneSessionRecord,
  reportedNativeDonePending,
} from "./doneSessionRecord.ts";
import {
  finishNativeDone,
  type DoneHost,
  type DoneLaunches,
  type DoneTerminals,
} from "./finishNativeDone.ts";
import { keptRecords, setRecordDoneAt } from "./launchRecordStore.ts";
import type { LocalFolder } from "./localFolder.ts";
import type { BranchCapture } from "./sessionBranchCapture.ts";

export { doneSessionRecord } from "./doneSessionRecord.ts";
export type {
  DoneHost,
  DoneLaunches,
  DoneTerminals,
} from "./finishNativeDone.ts";

export type DoneCollaborators = {
  readonly terminals: DoneTerminals;
  readonly hostFor: (host: HostIdentity) => DoneHost | undefined;
  readonly reportingFolder: (sourceId: string) => LocalFolder;
  // Reads the branch result before a manual mark's record write;
  // production's Git-only capture by default.
  readonly capture?: BranchCapture;
};

// Quiet reports continue native Done outside reporting locks.
// The developer's Done takes over a reported rename.
export class NativeDoneMarks {
  private readonly running = new Map<
    string,
    { readonly stop: AbortController; readonly settled: Promise<unknown> }
  >();
  private readonly reporting = new Set<Promise<void>>();
  private closed = false;

  constructor(private readonly collaborators: DoneCollaborators) {}

  // Continue pending native Done for the latest receipt.
  reported(sourceId: string, receipt: CompletionReport) {
    if (this.closed || !completedWithoutAttention(receipt)) return;
    const continued = this.continueReported(sourceId, receipt).catch(() => {});
    this.reporting.add(continued);
    void continued.then(() => this.reporting.delete(continued));
    return continued;
  }

  private async continueReported(
    sourceId: string,
    receipt: CompletionReport,
  ): Promise<void> {
    const marked = (await keptRecords(sourceId)).find(
      (entry) => entry.completion?.receipt === receipt.receipt,
    );
    if (this.closed || !reportedNativeDonePending(marked, receipt)) return;
    const key = sessionKey(marked.session);
    // A running Done of the session may still leave native Done pending, so
    // this report resumes from the record that Done leaves.
    const running = this.running.get(key);
    if (running !== undefined) {
      void running.settled.then(() => this.reported(sourceId, receipt));
      return;
    }
    await this.track(key, (stopped) =>
      finishNativeDone(
        sourceId,
        marked,
        this.collaborators.reportingFolder(sourceId),
        this.collaborators.terminals,
        this.collaborators.hostFor(marked.session.host),
        { intent: "reporting", stopped },
      ),
    );
  }

  // The developer's Done: ends the session's reported Done first, so one
  // rename runs and that Done's late write stays dropped.
  async markDone(
    source: PublishedSource,
    record: LaunchRecord,
    folder: LocalFolder,
    launches: DoneLaunches,
  ): Promise<LaunchRecord> {
    const key = sessionKey(record.session);
    const running = this.running.get(key);
    running?.stop.abort();
    await running?.settled;
    return this.track(key, (stopped) =>
      markSessionDone(
        source,
        record,
        folder,
        launches,
        this.collaborators,
        stopped,
      ),
    );
  }

  close(): Promise<void> {
    this.closed = true;
    for (const { stop } of this.running.values()) stop.abort();
    return Promise.all([
      ...this.reporting,
      ...Array.from(this.running.values(), ({ settled }) => settled),
    ]).then(() => {});
  }

  // Runs one Done of the session `key` as the one its next Done waits for.
  private async track<T>(
    key: string,
    done: (stopped: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const stop = new AbortController();
    const settled = done(stop.signal);
    this.running.set(key, { stop, settled: settled.catch(() => undefined) });
    try {
      return await settled;
    } finally {
      if (this.running.get(key)?.stop === stop) this.running.delete(key);
    }
  }
}

async function markSessionDone(
  source: PublishedSource,
  record: LaunchRecord,
  folder: LocalFolder,
  launches: DoneLaunches,
  { terminals, hostFor, capture }: DoneCollaborators,
  stopped: AbortSignal,
): Promise<LaunchRecord> {
  const host = hostFor(record.session.host);
  const stop = host?.doneStop?.bind(host);
  // A local-Done host's mark, like a reported mark on a host without a
  // Done stop, is acknowledged locally only.
  if (
    host?.localDone === true ||
    (record.completion !== undefined && stop === undefined)
  )
    return acknowledgeDoneLocally(source.id, record);
  if (host === undefined || stop === undefined)
    throw new Error("This host cannot mark a session done.");
  const doneAt = new Date().toISOString();
  const marked = await setRecordDoneAt(
    source.id,
    record.session,
    doneAt,
    capture === undefined ? undefined : { capture },
  );
  if (marked?.doneAt !== doneAt)
    return marked ?? doneSessionRecord(record, doneAt);
  return finishNativeDone(source.id, marked, folder, terminals, host, {
    intent: "manual",
    launches,
    source,
    stopped,
  });
}
