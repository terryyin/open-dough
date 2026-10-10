// Binding takes the attempt lock before the record lock, like completion delivery.
import { doneSessionRecord, type NativeDoneMarks } from "./doneMarks.ts";
import {
  completedWithoutAttention,
  type CompletionReport,
} from "../src/completionReport.ts";
import { withKeptAttempts } from "./launchAttemptStore.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { sessionKey } from "../src/sessionReference.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { boundLandingReporting } from "./oneShotLandingRecord.ts";

// Binds one known conversation, then starts any early reported Done after
// releasing the persistence locks.
export async function keepRecord(
  sourceId: string,
  record: LaunchRecord,
  doneMarks: NativeDoneMarks,
): Promise<void> {
  const earlyReport = await bindRecord(sourceId, record);
  if (earlyReport !== undefined) doneMarks.reported(sourceId, earlyReport);
}

// Keeps one known conversation and its first-input evidence, replacing any
// unresolved creation of that launch. Answers the report kept before binding
// so its owner can continue native Done once the locks are released.
export async function bindRecord(
  sourceId: string,
  record: LaunchRecord,
): Promise<CompletionReport | undefined> {
  return withKeptAttempts(async (attempts) => {
    const attempt =
      record.request.reporting === undefined
        ? undefined
        : attempts?.find(
            (entry) => entry.id === record.request.reporting?.reference,
          );
    if (record.request.reporting !== undefined && attempt === undefined) {
      throw new Error(
        "The reporting launch's attempt evidence is unreadable or no longer retained; native binding was not saved.",
      );
    }
    if (attempt?.reportingDeletedAt !== undefined) {
      throw new Error(
        "The reporting session was deleted; a late native binding was not saved.",
      );
    }
    const completion = attempt?.completion;
    await replaceRecords((kept) => {
      const existing = (kept[sourceId] ?? []).find(
        (entry): entry is LaunchRecord =>
          "session" in entry &&
          sessionKey(entry.session) === sessionKey(record.session),
      );
      // A settled native launch cannot be recreated by a late writer after deletion.
      if (existing === undefined && attempt?.outcome?.kind === "launched") {
        throw new Error(
          "The reporting session was deleted; a late native binding was not saved.",
        );
      }
      // A bound record imports only its durable completion. Reserved deliveries
      // belong to the sender's record commit; a late native writer cannot apply them.
      const reported =
        existing === undefined
          ? (completion ?? record.completion)
          : (existing.completion ?? record.completion);
      const bound =
        existing === undefined
          ? reported !== undefined && completedWithoutAttention(reported)
            ? doneSessionRecord(record, reported.receivedAt)
            : record
          : {
              ...record,
              doneAt: existing.doneAt,
              doneProblem: existing.doneProblem,
            };
      return {
        ...kept,
        [sourceId]: [
          ...(kept[sourceId] ?? []).filter((entry) =>
            !("session" in entry)
              ? !sameLaunch(entry.request, record.request)
              : sessionKey(entry.session) !== sessionKey(record.session),
          ),
          {
            ...bound,
            completion: reported,
            landing: existing?.landing ?? attempt?.landing ?? record.landing,
            landingReporting: boundLandingReporting(attempt, existing),
            dispositionChangedAt:
              existing?.dispositionChangedAt ?? record.dispositionChangedAt,
            reportRead: existing?.reportRead ?? record.reportRead,
          },
        ],
      };
    });
    return completion;
  });
}
