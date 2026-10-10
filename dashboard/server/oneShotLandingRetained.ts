// A kept bound record owns capture after its startup attempt normally expires.
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  landingReceiptSchema,
  type LandingReceipt,
} from "../src/oneShotLanding.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import type { LandingSubmission } from "./oneShotLandingAdmission.ts";
import {
  authorizedLanding,
  reserveLandingComparison,
} from "./oneShotLandingReservation.ts";
import { RefusedRequest } from "./localOrigin.ts";

// The caller holds the attempt lock. Failed record writes retain the exact
// sender input; an applied write supplies the original immutable receipt.
export async function submitRetainedLanding(
  record: LaunchRecord,
  report: LandingSubmission,
  prepare: boolean,
): Promise<LandingReceipt> {
  const retained = record.landingReporting;
  if (retained === undefined)
    throw new RefusedRequest(404, "No retained landing authority.");
  const { landing, needsSave } = await reserveLandingComparison(
    authorizedLanding(retained.authority, report),
    report,
    prepare,
    record.landing,
    retained.preparations,
  );
  if (needsSave) {
    const binding = { found: false };
    await replaceRecords((kept) => ({
      ...kept,
      [report.source]: (kept[report.source] ?? []).map((entry) => {
        if (
          !("session" in entry) ||
          entry.request.reporting?.reference !== report.reference
        )
          return entry;
        if (entry.landingReporting?.deletedAt !== undefined)
          throw new RefusedRequest(409, "The reporting session was deleted.");
        binding.found = true;
        return prepare
          ? {
              ...entry,
              landingReporting: {
                ...retained,
                preparations: [...retained.preparations, landing],
              },
            }
          : { ...entry, landing };
      }),
    }));
    if (!binding.found)
      throw new RefusedRequest(409, "The reporting session was deleted.");
  }
  return {
    ...landingReceiptSchema.omit({ state: true }).parse(landing),
    state: prepare ? "prepared" : "recorded",
  };
}
