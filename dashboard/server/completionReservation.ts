// Receipt history is write-ahead evidence in the existing launch-attempt document.
import { randomUUID } from "node:crypto";
import type {
  CompletionReceipt,
  CompletionReport,
} from "../src/completionReport.ts";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import { keptAttempts, replaceAttempts } from "./launchAttemptStore.ts";
import { keptRecords } from "./launchRecordStore.ts";
import {
  isReportingRecord,
  reportingAttempt,
  sameCompletionContent,
  type CompletionSubmission,
} from "./completionAdmission.ts";
import { RefusedRequest } from "./localOrigin.ts";

// Both acknowledgment recovery and the locked disposition write respect
// the same durable ordering, including newer reservations not yet applied.
export function completionNeedsRecordWrite(
  attempt: LaunchAttemptRecord,
  current: CompletionReport | undefined,
  submitted: CompletionReceipt,
): boolean {
  const receipts = attempt.completionReceipts ?? [];
  const submittedIndex = receipts.findIndex(
    (entry) => entry.receipt === submitted.receipt,
  );
  return (
    current?.receipt !== submitted.receipt &&
    receipts.findIndex((entry) => entry.receipt === current?.receipt) <=
      submittedIndex &&
    receipts.findIndex(
      (entry) => entry.receipt === attempt.completion?.receipt,
    ) <= submittedIndex
  );
}

export async function previousCompletion(
  report: CompletionSubmission,
  origin: string,
  delivery: string,
): Promise<{ receipt: CompletionReceipt; applied: boolean } | undefined> {
  const retained = reportingAttempt(await keptAttempts(), report, origin);
  const duplicate = retained.completionReceipts?.find(
    (entry) => entry.delivery === delivery,
  );
  if (duplicate === undefined) return undefined;
  sameCompletionContent(duplicate, report);
  const record = (await keptRecords(report.source)).find((entry) =>
    isReportingRecord(entry, report),
  );
  if (
    report.session !== undefined &&
    report.session !== record?.session.sessionId
  )
    throw new RefusedRequest(
      409,
      "The report does not name this launch's recorded session.",
    );
  if (
    duplicate.session !== undefined &&
    duplicate.session.sessionId !== record?.session.sessionId
  )
    throw new RefusedRequest(
      409,
      "This launch has no retained reporting session.",
    );
  const applied =
    record !== undefined
      ? !completionNeedsRecordWrite(retained, record.completion, duplicate)
      : retained.outcome === undefined &&
        duplicate.state === "pending-native-session";
  return { receipt: duplicate, applied };
}

export async function reserveCompletion(
  report: CompletionSubmission,
  origin: string,
  delivery: string,
): Promise<CompletionReceipt> {
  let receipt: CompletionReceipt | undefined;
  await replaceAttempts(async (kept) => {
    const attempt = reportingAttempt(
      Object.values(kept).flat(),
      report,
      origin,
    );
    const record = (await keptRecords(report.source)).find((entry) =>
      isReportingRecord(entry, report),
    );
    if (
      report.session !== undefined &&
      report.session !== record?.session.sessionId
    )
      throw new RefusedRequest(
        409,
        "The report does not name this launch's recorded session.",
      );
    if (record === undefined && attempt.outcome !== undefined)
      throw new RefusedRequest(
        409,
        "This launch has no retained reporting session.",
      );
    const previous = attempt.completionReceipts?.find(
      (entry) => entry.delivery === delivery,
    );
    if (previous !== undefined) {
      sameCompletionContent(previous, report);
      receipt = previous;
      return kept;
    }
    const completion: CompletionReceipt = {
      delivery,
      receipt: randomUUID(),
      reference: report.reference,
      outcome: report.outcome,
      message: report.message,
      receivedAt: new Date().toISOString(),
      state: record === undefined ? "pending-native-session" : "recorded",
      ...(record === undefined
        ? {}
        : {
            session: {
              host: record.session.host,
              sessionId: record.session.sessionId,
            },
          }),
    };
    receipt = completion;
    return {
      ...kept,
      [report.source]: (kept[report.source] ?? []).map((entry) =>
        entry.id === report.reference
          ? {
              ...entry,
              completion,
              completionReceipts: [
                ...(entry.completionReceipts ?? []),
                completion,
              ],
            }
          : entry,
      ),
    };
  });
  if (receipt === undefined) throw new Error("No stored receipt.");
  return receipt;
}
