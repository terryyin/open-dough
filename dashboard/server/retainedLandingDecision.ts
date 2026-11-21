// Retained-record landings: declared branch handoffs and expired attempts.
import { landingReportingReference } from "../src/launchLanding.ts";
import { launchRetentionDays, type LaunchRecord } from "../src/launchRecord.ts";
import { storyOf } from "../src/launchWorkflow.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { reportingAttempt } from "./completionAdmission.ts";
import type { LandingSubmission } from "./launchLandingAdmission.ts";
import type {
  LandingDecision,
  LandingDecisionInput,
} from "./launchLandingDecision.ts";
import { establishedStory } from "./launchRecord.ts";
import {
  changeBoundLandingRecord,
  withLandingPreparations,
} from "./launchLandingRecord.ts";
import {
  authorizedLanding,
  resolveLandingComparison,
} from "./launchLandingReservation.ts";
import { RefusedRequest } from "./localOrigin.ts";

// The bound record is authoritative for a branch handoff, even while the
// original startup attempt is still kept.
function declaredLandingRecord(
  records: readonly LaunchRecord[],
  report: LandingSubmission,
  origin: string,
): LaunchRecord | undefined {
  const record = records.find(
    (entry) =>
      entry.landingReporting?.branchContext?.reference === report.reference,
  );
  if (record === undefined) return undefined;
  const retained = record.landingReporting;
  const entry = record.branchEntry;
  const authority = retained?.authority;
  if (
    record.request.workflow !== "ad-hoc" ||
    record.request.host !== report.host ||
    record.session.host !== report.host ||
    retained?.origin !== origin ||
    retained.deletedAt !== undefined ||
    authority?.identity !== undefined ||
    entry?.trunk === undefined ||
    authority?.repository !== entry.repository ||
    authority.workspace !== entry.workspace ||
    authority.branch !== entry.branch ||
    authority.remote !== entry.trunk.remote ||
    authority.target !== entry.trunk.target
  )
    throw new RefusedRequest(
      409,
      "This is not the session's authorized branch landing.",
    );
  return record;
}

function expiredAttemptRecord({
  attempts,
  records,
  report,
  origin,
  receivedAt,
}: LandingDecisionInput): LaunchRecord | undefined {
  if (attempts.some((entry) => entry.id === report.reference)) {
    reportingAttempt(attempts, report, origin);
    return undefined;
  }
  const record = records.find(
    (entry) =>
      entry.request.reporting?.reference === report.reference &&
      entry.session.host === report.host,
  );
  const retained = record?.landingReporting;
  if (
    retained === undefined ||
    retained.settledAt === undefined ||
    Date.parse(receivedAt) - Date.parse(retained.settledAt) <=
      launchRetentionDays * 86_400_000 ||
    retained.origin !== origin
  )
    throw new RefusedRequest(
      404,
      "This dashboard accepted no such reporting launch.",
    );
  if (retained.deletedAt !== undefined)
    throw new RefusedRequest(409, "The reporting session was deleted.");
  // The workflow a record names decides which of its facts is its own; an
  // unattached launch's is its established session, which names no story.
  const established =
    record?.request.workflow === "execution"
      ? record.start
      : record?.request.workflow === "refinement"
        ? record.preparation
        : record?.establishedSession;
  const authority = retained.authority;
  if (
    record?.request.host !== report.host ||
    record.request.reporting?.origin !== origin ||
    storyOf(record.request) !== report.identity ||
    established === undefined ||
    establishedStory(established) !== authority.identity ||
    established.workspace !== authority.workspace ||
    established.branch !== authority.branch ||
    established.remote !== authority.remote ||
    `refs/heads/${established.target}` !== authority.target
  )
    throw new RefusedRequest(
      409,
      "This is not the established launch's authorized landing.",
    );
  return record;
}

export async function decideRetainedLanding(
  input: LandingDecisionInput,
): Promise<LandingDecision | undefined> {
  const { records, report, origin, operation, receiptId, receivedAt } = input;
  const record =
    declaredLandingRecord(records, report, origin) ??
    expiredAttemptRecord(input);
  if (record === undefined) return undefined;
  const prepare = operation === "prepare";
  const current = records.find(
    (entry) =>
      "session" in entry &&
      sessionKey(entry.session) === sessionKey(record.session) &&
      entry.launchedAt === record.launchedAt &&
      landingReportingReference(entry) === report.reference,
  );
  const retained = current?.landingReporting;
  if (
    current === undefined ||
    retained === undefined ||
    retained.deletedAt !== undefined
  )
    throw new RefusedRequest(409, "The reporting session was deleted.");
  const reservation = await resolveLandingComparison(
    authorizedLanding(retained.authority, report),
    report,
    prepare,
    current.landing,
    retained.preparations,
    receiptId,
    receivedAt,
  );
  const { landing, isNew } = reservation;
  if (!isNew)
    return {
      ...reservation,
      state: prepare ? "prepared" : "recorded",
    };
  const changeRecords = changeBoundLandingRecord(current, (record) => {
    const reporting = record.landingReporting;
    if (reporting === undefined) return record;
    if (!prepare)
      return record.landing?.receipt === landing.receipt
        ? record
        : { ...record, landing };
    const landingReporting = withLandingPreparations(reporting, [landing]);
    return landingReporting === reporting
      ? record
      : { ...record, landingReporting };
  });
  return {
    ...reservation,
    state: prepare ? "prepared" : "recorded",
    changeRecords,
  };
}
