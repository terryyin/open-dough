// Reported landings decide over composed attempts and records.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import {
  landingReceiptSchema,
  type LandingReceipt,
  type LaunchLanding,
} from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { LandingSubmission } from "./launchLandingAdmission.ts";
import type { LandingRecordChange } from "./launchLandingRecord.ts";
import { decideAttemptLanding } from "./attemptLandingDecision.ts";
import {
  declaredLandingRecord,
  decideRetainedLanding,
  expiredAttemptRecord,
} from "./retainedLandingDecision.ts";

export type LandingDecision = {
  readonly landing: LaunchLanding;
  readonly isNew: boolean;
  readonly state: LandingReceipt["state"];
  readonly path: "attempt" | "retained";
  readonly nextAttempts: readonly LaunchAttemptRecord[];
  readonly changeRecords?: LandingRecordChange | undefined;
};

export { decideAttemptLanding, declaredLandingRecord, expiredAttemptRecord };

// Decides one prepare or record over the source's kept attempts and records.
// Runs `verifyLanding` for a new landing; writes no store or ref.
export async function decideLanding(
  report: LandingSubmission,
  origin: string,
  operation: "prepare" | "record",
  attempts: readonly LaunchAttemptRecord[],
  records: readonly LaunchRecord[],
  receiptId: string,
  receivedAt: string,
): Promise<LandingDecision> {
  const prepare = operation === "prepare";
  const retained =
    declaredLandingRecord(records, report, origin) ??
    expiredAttemptRecord(attempts, records, report, origin);
  if (retained !== undefined)
    return decideRetainedLanding(
      retained,
      report,
      prepare,
      attempts,
      records,
      receiptId,
      receivedAt,
    );
  return decideAttemptLanding(
    report,
    origin,
    operation,
    attempts,
    records,
    receiptId,
    receivedAt,
  );
}

export function landingDecisionReceipt(
  decision: LandingDecision,
): LandingReceipt {
  return {
    ...landingReceiptSchema.omit({ state: true }).parse(decision.landing),
    state: decision.state,
  };
}
