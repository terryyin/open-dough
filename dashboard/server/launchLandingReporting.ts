// One launch, write-ahead acceptance, then its record, under the shared lock order.
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { LandingReceipt } from "../src/launchLanding.ts";
import {
  declaredLandingRecord,
  type LandingSubmission,
  landingSubmissionSchema,
  expiredAttemptRecord,
} from "./launchLandingAdmission.ts";
import {
  attemptLandingReceipt,
  decideAttemptLanding,
  type AttemptLandingDecision,
} from "./launchLandingDecision.ts";
import { registerFollowUpReceipt } from "./ciFollowUpAdmission.ts";
import { pinLanding } from "./launchLandingGit.ts";
import { submitRetainedLanding } from "./launchLandingRetained.ts";
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

// Prepares or records one admitted submission for the dashboard at `origin`.
export async function handleLanding(
  report: LandingSubmission,
  origin: string,
  operation: LandingOperation,
): Promise<LandingReceipt> {
  try {
    const retained = await withKeptAttempts(async (attempts) => {
      const record =
        (await declaredLandingRecord(report, origin)) ??
        (await expiredAttemptRecord(attempts, report, origin));
      return record === undefined
        ? undefined
        : submitRetainedLanding(record, report, operation === "prepare");
    });
    if (retained !== undefined) return retained;
    const receiptId = randomUUID();
    const receivedAt = new Date().toISOString();
    let decided: AttemptLandingDecision | undefined;
    await replaceAttempts(async (kept) => {
      const attempts = kept[report.source] ?? [];
      const records = await keptRecords(report.source);
      const answered = await decideAttemptLanding(
        report,
        origin,
        operation,
        attempts,
        records,
        receiptId,
        receivedAt,
      );
      if (answered.isNew) {
        await pinLanding(answered.landing);
        const prepared = attempts
          .find((entry) => entry.id === report.reference)
          ?.landingPreparations?.some(
            (entry) => entry.delivery === report.delivery,
          );
        if (!prepared)
          await registerFollowUpReceipt(report.source, answered.landing);
      }
      decided = answered;
      if (!answered.isNew) return kept;
      return {
        ...kept,
        [report.source]: [...answered.nextAttempts],
      };
    });
    if (decided === undefined) throw new Error("No stored landing receipt.");
    const answered = decided;
    await withKeptAttempts(async () => {
      await replaceRecords((kept) => ({
        ...kept,
        [report.source]: [...answered.nextRecords],
      }));
    });
    return attemptLandingReceipt(answered);
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      500,
      "Landing capture was not acknowledged. Retry reporting only; accepted Git publication stays accepted.",
    );
  }
}
