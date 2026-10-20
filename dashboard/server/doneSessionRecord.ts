// Durable Done intent and the query for its pending native continuation.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import { nativeDoneMarkPending } from "../src/doneMark.ts";
import { setRecordDoneAt } from "./launchRecordStore.ts";

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

// A local acknowledgement: only the durable mark is written, so no native
// stop, rename, or removal runs and no native failure can be claimed.
export async function acknowledgeDoneLocally(
  sourceId: string,
  record: LaunchRecord,
): Promise<LaunchRecord> {
  const marked = await setRecordDoneAt(
    sourceId,
    record.session,
    new Date().toISOString(),
  );
  if (marked === undefined)
    throw new Error(
      record.completion !== undefined
        ? "The reporting session was deleted."
        : "The session was deleted.",
    );
  return marked;
}

// A read-only query lets confirmed Done receipts be acknowledged without a
// write lock. Pending native work is continued by `NativeDoneMarks`.
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
