// A kept record owns declared landing capture and capture after startup expiry.
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  landingReceiptSchema,
  landingReportingReference,
  type LandingReceipt,
  type LaunchLanding,
} from "../src/launchLanding.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { leaveMachineJson } from "./machineJsonStore.ts";
import { sessionKey } from "../src/sessionReference.ts";
import type { LandingSubmission } from "./launchLandingAdmission.ts";
import {
  authorizedLanding,
  reserveLandingComparison,
} from "./launchLandingReservation.ts";
import { RefusedRequest } from "./localOrigin.ts";

// The caller holds the attempt lock. Failed record writes retain the exact
// sender input; an applied write supplies the original immutable receipt.
export async function submitRetainedLanding(
  record: LaunchRecord,
  report: LandingSubmission,
  prepare: boolean,
): Promise<LandingReceipt> {
  let saved: LaunchLanding | undefined;
  await replaceRecords(async (kept) => {
    const records = kept[report.source] ?? [];
    const current = records.find(
      (entry): entry is LaunchRecord =>
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
    const { landing, needsSave } = await reserveLandingComparison(
      authorizedLanding(retained.authority, report),
      report,
      prepare,
      current.landing,
      retained.preparations,
    );
    saved = landing;
    if (!needsSave) return leaveMachineJson;
    const next = prepare
      ? {
          ...current,
          landingReporting: {
            ...retained,
            preparations: [...retained.preparations, landing],
          },
        }
      : { ...current, landing };
    return {
      ...kept,
      [report.source]: records.map((entry) =>
        entry === current ? next : entry,
      ),
    };
  });
  if (saved === undefined) throw new Error("No stored landing receipt.");
  return {
    ...landingReceiptSchema.omit({ state: true }).parse(saved),
    state: prepare ? "prepared" : "recorded",
  };
}
