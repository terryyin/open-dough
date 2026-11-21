import type { CreationRecord } from "../src/launchCreation.ts";
import { launchRetentionDays, type LaunchRecord } from "../src/launchRecord.ts";

const retentionMs = launchRetentionDays * 24 * 60 * 60 * 1000;

// Creation records and open launches stay. Done launches expire after their
// retention window.
export function withinRetention<Entry extends LaunchRecord | CreationRecord>(
  records: readonly Entry[],
  now: number,
): Entry[] {
  return records.filter(
    (record) =>
      !("session" in record) ||
      record.doneAt === undefined ||
      now - Date.parse(record.doneAt) <= retentionMs,
  );
}
