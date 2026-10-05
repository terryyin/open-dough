// Native binding and reporting take the attempt lock before the records lock.
import { randomUUID } from "node:crypto";
import {
  completedWithoutAttention,
  doneAutomatically,
  type CompletionReceipt,
} from "../src/completionReport.ts";
import { withKeptAttempts } from "./launchAttemptStore.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import {
  completionNeedsRecordWrite,
  previousCompletion,
  reserveCompletion,
} from "./completionReservation.ts";
import {
  isReportingRecord,
  reportingAttempt,
  type CompletionSubmission,
} from "./completionAdmission.ts";
import { doneSessionRecord, markReportedSessionDone } from "./doneMarks.ts";
import { RefusedRequest } from "./localOrigin.ts";

export async function deliverCompletion(
  report: CompletionSubmission,
  origin: string,
): Promise<CompletionReceipt> {
  const delivery = report.delivery ?? randomUUID();
  try {
    // An applied immutable receipt can recover its acknowledgment without a write.
    const previous = await previousCompletion(report, origin, delivery);
    if (previous?.applied) {
      await withKeptAttempts(async (attempts) => {
        const attempt = reportingAttempt(attempts, report, origin);
        if (attempt.completion?.receipt === previous.receipt.receipt)
          await markReportedSessionDone(report.source, previous.receipt);
      });
      return previous.receipt;
    }
    const saved =
      previous?.receipt ?? (await reserveCompletion(report, origin, delivery));
    // No second attempt write follows disposition; failed writes cannot follow
    // successful disposition and turn it into a failed delivery.
    return await withKeptAttempts(async (attempts) => {
      const attempt = reportingAttempt(attempts, report, origin);
      const bound = (await keptRecords(report.source)).find((entry) =>
        isReportingRecord(entry, report),
      );
      if (bound === undefined) {
        if (
          attempt.outcome === undefined &&
          saved.state === "pending-native-session"
        )
          return saved;
        throw new RefusedRequest(
          409,
          "This launch has no retained reporting session.",
        );
      }
      const binding = { found: false };
      await replaceRecords((kept) => ({
        ...kept,
        [report.source]: (kept[report.source] ?? []).map((entry) => {
          if (!isReportingRecord(entry, report)) return entry;
          if (
            saved.session !== undefined &&
            saved.session.sessionId !== entry.session.sessionId
          )
            throw new RefusedRequest(
              409,
              "The reporting launch now names a different session.",
            );
          binding.found = true;
          // Even an unapplied newer submission prevents an older retry from closing it.
          if (!completionNeedsRecordWrite(attempt, entry.completion, saved))
            return entry;
          const automaticDone = doneAutomatically(entry);
          const quiet =
            completedWithoutAttention(saved) &&
            (entry.doneAt === undefined || automaticDone) &&
            (entry.dispositionChangedAt === undefined ||
              entry.dispositionChangedAt < saved.receivedAt);
          const next = {
            ...(quiet ? doneSessionRecord(entry, saved.receivedAt) : entry),
            completion: saved,
          };
          // A newer qualification replaces previous automatic success, while
          // explicit local Done/reopen remains independent of reported outcome.
          if (!completedWithoutAttention(saved) && automaticDone) {
            delete next.doneAt;
            delete next.doneProblem;
          }
          return next;
        }),
      }));
      if (!binding.found)
        throw new RefusedRequest(409, "The reporting session was deleted.");
      if (attempt.completion?.receipt === saved.receipt)
        await markReportedSessionDone(report.source, saved);
      return saved;
    });
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      500,
      "Completion delivery was not acknowledged. Keep the message and retry without repeating the work.",
    );
  }
}
