// Settlement on a bound record follows the attempt under the attempt lock.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { CreationRecord } from "../src/launchCreation.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { boundLandingReporting } from "./launchLandingRecord.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { leaveMachineJson } from "./machineJsonStore.ts";

// Called under the attempt lock; never introduces a record or extends retention.
export async function retainLandingSettlement(
  attempt: LaunchAttemptRecord,
): Promise<void> {
  if (
    attempt.settledAt === undefined ||
    attempt.landingRepository === undefined
  )
    return;
  const bound = (entry: LaunchRecord | CreationRecord): entry is LaunchRecord =>
    "session" in entry && entry.request.reporting?.reference === attempt.id;
  await replaceRecords((kept) => {
    const records = kept[attempt.request.source] ?? [];
    // A settlement no kept record is bound to leaves the records as they are.
    if (!records.some(bound)) return leaveMachineJson;
    return {
      ...kept,
      [attempt.request.source]: records.map((entry) => {
        if (!bound(entry)) return entry;
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
      }),
    };
  });
}
