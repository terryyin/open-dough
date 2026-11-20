// One launch, write-ahead acceptance, then its record, under the shared lock order.
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import {
  landingReportingReference,
  type LandingReceipt,
} from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  type LandingSubmission,
  landingSubmissionSchema,
} from "./launchLandingAdmission.ts";
import {
  decideLanding,
  declaredLandingRecord,
  expiredAttemptRecord,
  landingDecisionReceipt,
  type LandingDecision,
} from "./launchLandingDecision.ts";
import { registerFollowUpReceipt } from "./ciFollowUpAdmission.ts";
import { pinLanding } from "./launchLandingGit.ts";
import { replaceAttempts, withKeptAttempts } from "./launchAttemptStore.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { knownSource } from "./sessionAdmission.ts";
export const landingEndpoint = "/__agent-launch/landing";
export const landingPrepareEndpoint = `${landingEndpoint}/prepare`;
// Preparing retains a pair before publication; recording accepts it.
export type LandingOperation = "prepare" | "record";
export async function submitLanding(
  req: IncomingMessage,
  operation: LandingOperation,
): Promise<LandingReceipt> {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = landingSubmissionSchema.safeParse(
    await jsonBody(req, undefined, 128 * 1024),
  );
  if (!parsed.success)
    throw new RefusedRequest(400, "The landing request is malformed.");
  knownSource(parsed.data.source);
  return handleLanding(parsed.data, `http://${req.headers.host}`, operation);
}

async function pinNewLanding(
  report: LandingSubmission,
  attempts: readonly LaunchAttemptRecord[],
  records: readonly LaunchRecord[],
  answered: LandingDecision,
): Promise<void> {
  if (!answered.isNew) return;
  await pinLanding(answered.landing);
  const preparations =
    attempts.find((entry) => entry.id === report.reference)
      ?.landingPreparations ??
    records.find(
      (entry) => landingReportingReference(entry) === report.reference,
    )?.landingReporting?.preparations ??
    [];
  if (!preparations.some((entry) => entry.delivery === report.delivery))
    await registerFollowUpReceipt(report.source, answered.landing);
}

// Prepares or records one admitted submission for the dashboard at `origin`.
export async function handleLanding(
  report: LandingSubmission,
  origin: string,
  operation: LandingOperation,
): Promise<LandingReceipt> {
  try {
    const receiptId = randomUUID();
    const receivedAt = new Date().toISOString();
    // Retained landings keep the attempt store untouched (including an
    // unreadable attempts file) under the shared read lock, as before.
    const retained = await withKeptAttempts(async (kept) => {
      const attempts = (kept ?? []).filter(
        (entry) => entry.request.source === report.source,
      );
      const records = await keptRecords(report.source);
      const record =
        declaredLandingRecord(records, report, origin) ??
        expiredAttemptRecord(attempts, records, report, origin);
      if (record === undefined) return undefined;
      const answered = await decideLanding(
        report,
        origin,
        operation,
        attempts,
        records,
        receiptId,
        receivedAt,
      );
      await pinNewLanding(report, attempts, records, answered);
      if (answered.nextRecords !== records) {
        await replaceRecords((document) => ({
          ...document,
          [report.source]: [...answered.nextRecords],
        }));
      }
      return answered;
    });
    if (retained !== undefined) return landingDecisionReceipt(retained);

    let decided: LandingDecision | undefined;
    let startingRecords: readonly LaunchRecord[] | undefined;
    await replaceAttempts(async (kept) => {
      const attempts = kept[report.source] ?? [];
      const records = await keptRecords(report.source);
      startingRecords = records;
      const answered = await decideLanding(
        report,
        origin,
        operation,
        attempts,
        records,
        receiptId,
        receivedAt,
      );
      await pinNewLanding(report, attempts, records, answered);
      decided = answered;
      if (!answered.isNew) return kept;
      return {
        ...kept,
        [report.source]: [...answered.nextAttempts],
      };
    });
    if (decided === undefined || startingRecords === undefined)
      throw new Error("No stored landing receipt.");
    const answered = decided;
    if (answered.nextRecords !== startingRecords) {
      await withKeptAttempts(async () => {
        await replaceRecords((document) => ({
          ...document,
          [report.source]: [...answered.nextRecords],
        }));
      });
    }
    return landingDecisionReceipt(answered);
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      500,
      "Landing capture was not acknowledged. Retry reporting only; accepted Git publication stays accepted.",
    );
  }
}
