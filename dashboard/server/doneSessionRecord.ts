// Durable Done intent and the query for its pending native continuation.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import { nativeDoneMarkPending } from "../src/doneMark.ts";
import { startRecordDone } from "./recordDoneAt.ts";
import { doneCapturePending } from "./doneCapture.ts";
import { prepareDoneStory } from "./doneStoryAtMark.ts";

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

// Prepare the story lookup before writing the reported mark and its story together.
export async function prepareReportedDone(candidate: LaunchRecord | undefined) {
  const attachStory = await prepareDoneStory(candidate);
  return (record: LaunchRecord, doneAt: string) =>
    attachStory(doneSessionRecord(record, doneAt));
}

// A local acknowledgement: only the durable mark is written, so no native
// stop, rename, or removal runs and no native failure can be claimed.
export async function acknowledgeDoneLocally(
  sourceId: string,
  record: LaunchRecord,
): Promise<LaunchRecord> {
  const { record: marked } = await startRecordDone(sourceId, record.session);
  if (marked === undefined)
    throw new Error(
      record.completion !== undefined
        ? "The reporting session was deleted."
        : "The session was deleted.",
    );
  return marked;
}

function reportedDone(
  record: LaunchRecord | undefined,
  receipt: CompletionReport,
): record is LaunchRecord {
  return (
    record !== undefined &&
    record.completion?.receipt === receipt.receipt &&
    doneAutomatically(record)
  );
}

export function reportedNativeDonePending(
  record: LaunchRecord | undefined,
  receipt: CompletionReport,
): record is LaunchRecord {
  return reportedDone(record, receipt) && record.doneProblem !== undefined;
}

// A receipt with both a settled capture and confirmed native Done can be
// acknowledged without a write. The capture is independent of native Done.
export function reportedDoneNeedsContinuation(
  record: LaunchRecord | undefined,
  receipt: CompletionReport,
): record is LaunchRecord {
  return (
    reportedDone(record, receipt) &&
    (record.doneProblem !== undefined || doneCapturePending(record))
  );
}
