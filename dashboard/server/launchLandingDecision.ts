// Reported landings decide over composed attempts and records.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import {
  landingReceiptSchema,
  type LandingReceipt,
} from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type {
  LandingOperation,
  LandingSubmission,
} from "./launchLandingAdmission.ts";
import type { LandingRecordChange } from "./launchLandingRecord.ts";
import type { LandingReservation } from "./launchLandingReservation.ts";
import { decideAttemptLanding } from "./attemptLandingDecision.ts";
import { decideRetainedLanding } from "./retainedLandingDecision.ts";

export type LandingDecisionInput = {
  readonly report: LandingSubmission;
  readonly origin: string;
  readonly operation: LandingOperation;
  readonly attempts: readonly LaunchAttemptRecord[];
  readonly records: readonly LaunchRecord[];
  readonly receiptId: string;
  readonly receivedAt: string;
};

export type LandingDecision = LandingReservation & {
  readonly state: LandingReceipt["state"];
  readonly nextAttempts?: readonly LaunchAttemptRecord[] | undefined;
  readonly changeRecords?: LandingRecordChange | undefined;
};

// Decides one prepare or record over the source's kept attempts and records.
// Runs `verifyLanding` for a new landing; writes no store or ref.
export async function decideLanding(
  input: LandingDecisionInput,
): Promise<LandingDecision> {
  return (await decideRetainedLanding(input)) ?? decideAttemptLanding(input);
}

export function landingDecisionReceipt(
  decision: LandingDecision,
): LandingReceipt {
  return {
    ...landingReceiptSchema.omit({ state: true }).parse(decision.landing),
    state: decision.state,
  };
}
