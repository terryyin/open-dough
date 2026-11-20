// Retiring host-local state when a launch record is removed: the one
// host-neutral dispatch every removal path uses, so shared code never
// gains host logic. The host named by the record decides what its
// removal retires (for Cursor, its configuration scope); a host with no
// such operation keeps nothing of the kind.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { launchHost } from "./launchHosts.ts";
import {
  onRecordsDroppedByRetention,
  type RecordsDroppedByRetention,
} from "./launchRecordDocument.ts";
import { releaseExpiredRecordPins } from "./launchRecordPins.ts";

// Runs the record's host's record-removal operation, if it has one.
// Callers run this only after the record itself is actually gone.
export async function notifyRecordRemoved(record: LaunchRecord): Promise<void> {
  await launchHost(record.session.host)?.recordRemoved?.(record);
}

// The retention path's cleanup: session records the record store drops
// past their retention are surfaced by `./launchRecordDocument.ts` once
// the dropping rewrite has landed, and each is retired here exactly as an
// explicit deletion retires it, after what it kept in a saved repository
// is released (`./launchRecordPins.ts`).
export const retireExpiredRecords: RecordsDroppedByRetention = async (
  records,
) => {
  for (const record of records) {
    await releaseExpiredRecordPins(record);
    await notifyRecordRemoved(record);
  }
};

// Installs that cleanup as every write's default. Installed by the launch
// boundary (`./launchBoundary.ts`); a write in a process that never
// installed it and names no cleanup still drops the records, and their
// host-local state then has no record left to retire, so it can be stranded.
export function installRecordRemovalDispatch(): void {
  onRecordsDroppedByRetention(retireExpiredRecords);
}
