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
  declaredLandingAuthority,
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
  const declared = declaredLandingAuthority(record);
  const authority = retained?.authority;
  if (
    record.request.workflow !== "ad-hoc" ||
    record.request.host !== report.host ||
    record.session.host !== report.host ||
    retained?.origin !== origin ||
    retained.deletedAt !== undefined ||
    declared === undefined ||
    authority?.identity !== declared.identity ||
    authority?.repository !== declared.repository ||
    record.defaultStart?.repository !== declared.repository ||
    authority.workspace !== declared.workspace ||
    authority.branch !== declared.branch ||
    authority.remote !== declared.remote ||
    authority.target !== declared.target ||
    (record.doneAt !== undefined &&
      record.landing === undefined &&
      !retained.preparations.some(
        ({ delivery }) => delivery === report.delivery,
      ))
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
  // The record's request binds the story. The workflow's established facts
  // bind its workspace and branch.
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
    established === undefined ||
    storyOf(record.request) !== authority.identity ||
    (record.request.workflow !== "ad-hoc" &&
      establishedStory(established) !== authority.identity) ||
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
    retained.branchContext === undefined
      ? undefined
      : current.branchEntry?.trunk?.revision,
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
