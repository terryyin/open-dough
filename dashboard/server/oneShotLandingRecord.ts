// Capture authority is established once, then follows the original bound record.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { LandingReporting } from "../src/oneShotLanding.ts";
import { replaceRecords } from "./launchRecordDocument.ts";

export function boundLandingReporting(
  attempt: LaunchAttemptRecord | undefined,
  existing: LaunchRecord | undefined,
): LandingReporting | undefined {
  if (existing?.landingReporting !== undefined)
    return existing.landingReporting;
  if (
    attempt?.landingRepository === undefined ||
    attempt.reportingOrigin === undefined
  )
    return undefined;
  return {
    origin: attempt.reportingOrigin,
    authority: attempt.landingRepository,
    preparations: attempt.landingPreparations ?? [],
    ...(attempt.settledAt === undefined
      ? {}
      : { settledAt: attempt.settledAt }),
  };
}

// Called under the attempt lock; never introduces a record or extends retention.
export async function retainLandingSettlement(
  attempt: LaunchAttemptRecord,
): Promise<void> {
  if (
    attempt.settledAt === undefined ||
    attempt.landingRepository === undefined
  )
    return;
  await replaceRecords((kept) => ({
    ...kept,
    [attempt.request.source]: (kept[attempt.request.source] ?? []).map(
      (entry) => {
        if (
          !("session" in entry) ||
          entry.request.reporting?.reference !== attempt.id
        )
          return entry;
        const reporting = boundLandingReporting(attempt, entry);
        return reporting === undefined
          ? entry
          : {
              ...entry,
              landingReporting: {
                ...reporting,
                settledAt: reporting.settledAt ?? attempt.settledAt,
              },
            };
      },
    ),
  }));
}
