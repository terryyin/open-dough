// Attempt-path prepare or record when no retained record owns the landing.
import { storyOf } from "../src/launchWorkflow.ts";
import { isReportingRecord, reportingAttempt } from "./completionAdmission.ts";
import type {
  LandingDecision,
  LandingDecisionInput,
} from "./launchLandingDecision.ts";
import {
  boundLandingReporting,
  changeBoundLandingRecord,
  landingStoryOfAttempt,
  withLandingPreparations,
} from "./launchLandingRecord.ts";
import {
  authorizedLanding,
  resolveLandingComparison,
  sameComparison,
} from "./launchLandingReservation.ts";
import { RefusedRequest } from "./localOrigin.ts";

export async function decideAttemptLanding({
  report,
  origin,
  operation,
  attempts,
  records,
  receiptId,
  receivedAt,
}: LandingDecisionInput): Promise<LandingDecision> {
  const prepare = operation === "prepare";
  const attempt = reportingAttempt(attempts, report, origin);
  const authority = authorizedLanding(attempt.landingRepository, report);
  if (landingStoryOfAttempt(attempt) !== report.identity)
    throw new RefusedRequest(
      409,
      "This is not the established launch's authorized landing.",
    );
  const bound = records.find(
    (record) => record.request.reporting?.reference === report.reference,
  );
  if (
    bound !== undefined &&
    (!isReportingRecord(bound, report) ||
      bound.request.host !== report.host ||
      bound.request.reporting?.origin !== origin ||
      storyOf(bound.request) !== authority.identity)
  )
    throw new RefusedRequest(
      409,
      "The retained session does not match the launch's landing authority.",
    );
  if (bound?.landingReporting?.deletedAt !== undefined)
    throw new RefusedRequest(409, "The reporting session was deleted.");
  if (bound === undefined && attempt.outcome !== undefined)
    throw new RefusedRequest(
      409,
      "This launch has no retained reporting session.",
    );
  const reservation = await resolveLandingComparison(
    authority,
    report,
    prepare,
    attempt.landing,
    attempt.landingPreparations,
    receiptId,
    receivedAt,
  );
  const { landing, isNew } = reservation;
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
  const changeRecords =
    bound === undefined
      ? undefined
      : changeBoundLandingRecord(bound, (current) => {
          const reporting = boundLandingReporting(nextAttempt, current);
          const landingReporting =
            reporting === undefined
              ? undefined
              : withLandingPreparations(
                  reporting,
                  nextAttempt.landingPreparations ?? [],
                );
          if (
            landingReporting === current.landingReporting &&
            (prepare || current.landing?.receipt === landing.receipt)
          )
            return current;
          return {
            ...current,
            ...(prepare ? {} : { landing }),
            landingReporting,
          };
        });
  return {
    ...reservation,
    state: prepare
      ? "prepared"
      : bound !== undefined
        ? "recorded"
        : "pending-native-session",
    nextAttempts,
    changeRecords,
  };
}
