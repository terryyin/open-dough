// Attempt-reported landings decide over composed attempts and records.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  landingReceiptSchema,
  type LandingReceipt,
  type LaunchLanding,
} from "../src/launchLanding.ts";
import { storyOf } from "../src/launchWorkflow.ts";
import { reportingAttempt } from "./completionAdmission.ts";
import type { LandingSubmission } from "./launchLandingAdmission.ts";
import { boundLandingReporting } from "./launchLandingRecord.ts";
import {
  authorizedLanding,
  resolveLandingComparison,
  sameComparison,
} from "./launchLandingReservation.ts";
import { RefusedRequest } from "./localOrigin.ts";

export type AttemptLandingDecision = {
  readonly landing: LaunchLanding;
  readonly isNew: boolean;
  readonly state: LandingReceipt["state"];
  readonly nextAttempts: readonly LaunchAttemptRecord[];
  readonly nextRecords: readonly LaunchRecord[];
};

// Decides one attempt-path prepare or record over the source's kept attempts
// and records. Runs `verifyLanding` for a new landing; writes no store or ref.
export async function decideAttemptLanding(
  report: LandingSubmission,
  origin: string,
  operation: "prepare" | "record",
  attempts: readonly LaunchAttemptRecord[],
  records: readonly LaunchRecord[],
  receiptId: string,
  receivedAt: string,
): Promise<AttemptLandingDecision> {
  const prepare = operation === "prepare";
  const attempt = reportingAttempt(attempts, report, origin);
  const authority = authorizedLanding(attempt.landingRepository, report);
  if (storyOf(attempt.request) !== report.identity)
    throw new RefusedRequest(
      409,
      "This is not the established launch's authorized landing.",
    );
  const bound = records.find(
    (record) => record.request.reporting?.reference === report.reference,
  );
  if (bound?.landingReporting?.deletedAt !== undefined)
    throw new RefusedRequest(409, "The reporting session was deleted.");
  if (bound === undefined && attempt.outcome !== undefined)
    throw new RefusedRequest(
      409,
      "This launch has no retained reporting session.",
    );
  const { landing, isNew } = await resolveLandingComparison(
    authority,
    report,
    prepare,
    attempt.landing,
    attempt.landingPreparations,
    receiptId,
    receivedAt,
  );
  const nextAttempts = isNew
    ? attempts.map((entry) =>
        entry.id === report.reference
          ? prepare
            ? {
                ...entry,
                landingPreparations: [
                  ...(entry.landingPreparations ?? []),
                  landing,
                ],
              }
            : { ...entry, landing }
          : entry,
      )
    : attempts;
  const nextAttempt =
    nextAttempts.find((entry) => entry.id === report.reference) ?? attempt;
  if (!prepare && nextAttempt.landing === undefined)
    throw new Error("Landing reservation is missing.");
  if (nextAttempt.landing !== undefined)
    sameComparison(nextAttempt.landing, report);
  const binding = { found: false };
  const nextRecords = records.map((entry) => {
    if (
      !("session" in entry) ||
      entry.request.reporting?.reference !== report.reference
    )
      return entry;
    binding.found = true;
    const reporting = boundLandingReporting(nextAttempt, entry);
    return {
      ...entry,
      ...(prepare ? {} : { landing }),
      landingReporting:
        reporting === undefined
          ? undefined
          : {
              ...reporting,
              preparations:
                nextAttempt.landingPreparations ?? reporting.preparations,
            },
    };
  });
  if (!binding.found && nextAttempt.outcome !== undefined)
    throw new RefusedRequest(409, "The reporting session was deleted.");
  return {
    landing,
    isNew,
    state: prepare
      ? "prepared"
      : binding.found
        ? "recorded"
        : "pending-native-session",
    nextAttempts,
    nextRecords,
  };
}

export function attemptLandingReceipt(
  decision: AttemptLandingDecision,
): LandingReceipt {
  return {
    ...landingReceiptSchema.omit({ state: true }).parse(decision.landing),
    state: decision.state,
  };
}
