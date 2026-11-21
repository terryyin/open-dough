// In-memory attempt and record stores for the landing adapter collaborator.
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { LandingStores } from "../../server/launchLandingReporting.ts";
import { leaveMachineJson } from "../../server/machineJsonStore.ts";
import { source } from "./doneCaptureCase.ts";

type AttemptDocument = Parameters<LandingStores["replaceAttempts"]>[0] extends (
  kept: infer K,
) => unknown
  ? K
  : never;
type RecordDocument = Parameters<LandingStores["replaceRecords"]>[0] extends (
  kept: infer K,
) => unknown
  ? K
  : never;

// Mutable attempt and record documents the adapter's collaborator shape reads
// and replaces, defaulting empty like missing machine files.
export function composedLandingStores(initial?: {
  attempts?: AttemptDocument;
  records?: RecordDocument;
}): LandingStores & {
  records: () => RecordDocument;
  recordOf: (sessionId: string) => LaunchRecord | undefined;
} {
  let attempts: AttemptDocument = structuredClone(initial?.attempts ?? {});
  let records: RecordDocument = structuredClone(initial?.records ?? {});
  const recordOf = (sessionId: string) =>
    (records[source] ?? []).find(
      (entry): entry is LaunchRecord =>
        "session" in entry && entry.session.sessionId === sessionId,
    );
  const replaceRecords: LandingStores["replaceRecords"] = async (change) => {
    const next = await change(records);
    if (next !== leaveMachineJson) records = next;
  };
  return {
    records: () => records,
    recordOf,
    withKeptAttempts: (observe) => observe(Object.values(attempts).flat()),
    replaceAttempts: async (change) => {
      const next = await change(attempts);
      if (next !== leaveMachineJson) attempts = next;
    },
    keptRecords: (sourceId) =>
      Promise.resolve(
        (records[sourceId] ?? []).filter(
          (entry): entry is LaunchRecord => "session" in entry,
        ),
      ),
    replaceRecords,
  };
}
