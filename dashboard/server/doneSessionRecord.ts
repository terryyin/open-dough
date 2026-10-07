// Durable Done intent and the query for its pending native continuation.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import { nativeDoneMarkPending } from "../src/doneMark.ts";

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
