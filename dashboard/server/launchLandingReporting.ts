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
  admitLandingRequest,
  type LandingOperation,
  type LandingSubmission,
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
import {
  machineRecordStore,
  type LaunchRecordStore,
} from "./launchRecordStore.ts";
import type { LandingRecordChange } from "./launchLandingRecord.ts";
import { leaveMachineJson } from "./machineJsonStore.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { textBody } from "./jsonRequestBody.ts";
import { knownSource } from "./sessionAdmission.ts";

// Attempt read/replace and record read/replace the adapter persists through.
// Optional on `handleLanding`; defaults to this machine's stores.
export type LandingStores = LaunchRecordStore & {
  withKeptAttempts: typeof withKeptAttempts;
  replaceAttempts: typeof replaceAttempts;
};

export const machineLandingStores: LandingStores = {
  ...machineRecordStore,
  withKeptAttempts,
  replaceAttempts,
};

async function saveLandingRecordChange(
  stores: LandingStores,
  sourceId: string,
  change: LandingRecordChange,
): Promise<void> {
  await stores.replaceRecords((document) => {
    const current = document[sourceId] ?? [];
    const next = change(current);
    return current === next
      ? leaveMachineJson
      : { ...document, [sourceId]: next };
  });
}

export async function submitLanding(
  req: IncomingMessage,
): Promise<LandingReceipt> {
  verifyLocalOrigin(req);
  const host = req.headers.host;
  const { operation, submission } = admitLandingRequest({
    route: new URL(req.url ?? "", `http://${host ?? "local"}`).pathname,
    method: req.method,
    origin: headerValue(req.headers.origin),
    host,
    bodyText: await textBody(req, undefined, 128 * 1024),
  });
  knownSource(submission.source);
  return handleLanding(submission, `http://${host}`, operation);
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
  stores: LandingStores = machineLandingStores,
): Promise<LandingReceipt> {
  try {
    const receiptId = randomUUID();
    const receivedAt = new Date().toISOString();
    // Retained landings keep the attempt store untouched (including an
    // unreadable attempts file) under the shared read lock, as before.
    const retained = await stores.withKeptAttempts(async (kept) => {
      const attempts = (kept ?? []).filter(
        (entry) => entry.request.source === report.source,
      );
      const records = await stores.keptRecords(report.source);
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
      if (answered.changeRecords !== undefined)
        await saveLandingRecordChange(
          stores,
          report.source,
          answered.changeRecords,
        );
      return answered;
    });
    if (retained !== undefined) return landingDecisionReceipt(retained);

    let decided: LandingDecision | undefined;
    await stores.replaceAttempts(async (kept) => {
      const attempts = kept[report.source] ?? [];
      const records = await stores.keptRecords(report.source);
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
    if (decided === undefined) throw new Error("No stored landing receipt.");
    const answered = decided;
    const change = answered.changeRecords;
    if (change !== undefined) {
      await stores.withKeptAttempts(() =>
        saveLandingRecordChange(stores, report.source, change),
      );
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
