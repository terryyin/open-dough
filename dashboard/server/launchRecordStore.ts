// Public launch/creation record operations use one machine document and retention rule.
import { sameLaunch } from "../src/launchRequest.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import {
  branchPinOwner,
  keptBranchEvidence,
} from "../src/sessionBranchResult.ts";
import type { AgentLaunchRequest, LaunchRecord } from "../src/agentLaunch.ts";
import {
  readStoredRecords,
  replaceRecords,
  type RecordsDroppedByRetention,
} from "./launchRecordDocument.ts";
import { withinRetention } from "./launchRecordRetention.ts";

// Every project's records still kept, by project id, each oldest first.
export async function keptRecordsByProject(): Promise<
  ReadonlyMap<string, readonly LaunchRecord[]>
> {
  return (await readableRecordsByProject()) ?? new Map();
}

// The same, or undefined when the record file could not be read.
export async function readableRecordsByProject(): Promise<
  ReadonlyMap<string, readonly LaunchRecord[]> | undefined
> {
  const read = await readStoredRecords();
  if (read.kind === "unreadable") {
    return undefined;
  }
  const now = Date.now();
  return new Map(
    Object.entries(read.document).map(([id, records]) => [
      id,
      withinRetention(records, now).filter(
        (entry): entry is LaunchRecord => "session" in entry,
      ),
    ]),
  );
}

// One project's records still kept, oldest first.
export async function keptRecords(
  sourceId: string,
): Promise<readonly LaunchRecord[]> {
  return (await keptRecordsByProject()).get(sourceId) ?? [];
}

export type LaunchRecordStore = {
  keptRecords: typeof keptRecords;
  replaceRecords: typeof replaceRecords;
};

export const machineRecordStore: LaunchRecordStore = {
  keptRecords,
  replaceRecords,
};

// One retained host-qualified conversation for a catalog project.
export async function keptSession(
  sourceId: string,
  session: SessionReference,
  store: Pick<LaunchRecordStore, "keptRecords"> = machineRecordStore,
): Promise<LaunchRecord | undefined> {
  return sessionRecord(await store.keptRecords(sourceId), session);
}

// One host-qualified conversation among a project's kept records.
export function sessionRecord(
  records: readonly LaunchRecord[],
  session: SessionReference,
): LaunchRecord | undefined {
  return records.find(
    (record) => sessionKey(record.session) === sessionKey(session),
  );
}

// The canonical pending-input selection, shared by native recovery and
// continuation admission. A durable conversation alone does not confirm input.
export function pendingInputRecord(
  records: readonly LaunchRecord[],
  request: AgentLaunchRequest,
): LaunchRecord | undefined {
  return records.find(
    (record) =>
      sameLaunch(record.request, request) &&
      record.firstInput !== undefined &&
      record.firstInput.state !== "confirmed" &&
      record.firstInput.state !== "not-requested",
  );
}

// A kept conversation of this launch whose first input is unconfirmed.
export async function pendingInputOf(
  sourceId: string,
  request: AgentLaunchRequest,
): Promise<LaunchRecord | undefined> {
  return pendingInputRecord(await keptRecords(sourceId), request);
}

export { bindRecord, keepRecord } from "./launchRecordBinding.ts";
export { setRecordDoneAt } from "./recordDoneAt.ts";

// Changes one kept session's record by `change`, answering the record as it
// now is, or undefined when no such record is kept any more. Records the
// write drops by retention go to `droppedByRetention` (`replaceRecords`).
export async function changeSessionRecord(
  sourceId: string,
  session: SessionReference,
  change: (record: LaunchRecord) => LaunchRecord | Promise<LaunchRecord>,
  droppedByRetention?: RecordsDroppedByRetention,
  store: Pick<LaunchRecordStore, "replaceRecords"> = machineRecordStore,
): Promise<LaunchRecord | undefined> {
  let changed: LaunchRecord | undefined;
  await store.replaceRecords(async (kept) => {
    const records = kept[sourceId];
    if (records === undefined) return kept;
    return {
      ...kept,
      [sourceId]: await Promise.all(
        records.map(async (record) => {
          if (
            !("session" in record) ||
            sessionKey(record.session) !== sessionKey(session)
          ) {
            return record;
          }
          changed = await change(record);
          return changed;
        }),
      ),
    };
  }, droppedByRetention);
  return changed;
}

// Refines why pending input is still uncertain without replacing a later
// native confirmation or any other lifecycle evidence in the kept record.
export async function setRecordPendingInputExplanation(
  sourceId: string,
  session: SessionReference,
  explanation: string,
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, session, (record) =>
    record.firstInput?.state === "uncertain"
      ? { ...record, firstInput: { ...record.firstInput, explanation } }
      : record,
  );
}

// Retains an unconfirmed stop's explanation on one kept session, or clears
// it when a later stop is confirmed (`stopUnconfirmed` undefined). Nothing
// else changes: in particular the done mark is never written here.
export async function setRecordStopUnconfirmed(
  sourceId: string,
  session: SessionReference,
  stopUnconfirmed: string | undefined,
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, session, (record) => {
    const next: LaunchRecord = { ...record };
    delete next.stopUnconfirmed;
    return stopUnconfirmed === undefined
      ? next
      : { ...next, stopUnconfirmed: stopUnconfirmed.slice(0, 1_200) };
  });
}

// Marks one kept session's report with `receipt` read, changing nothing else:
// its done mark and disposition stay as they are. Answers the changed record,
// or undefined when no such record is kept any more.
export async function setRecordReportRead(
  sourceId: string,
  session: SessionReference,
  receipt: string,
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, session, (record) => ({
    ...record,
    reportRead: receipt,
  }));
}

export { deleteRecord } from "./launchRecordDeletion.ts";

// Replaces one kept session's record, matching the previous session key so the
// native conversation id may change (Cursor cannot-load replacement).
export async function replaceKeptSession(
  sourceId: string,
  previous: SessionReference,
  next: LaunchRecord,
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, previous, (record) => ({
    ...next,
    ...keptBranchEvidence(record),
    ...(record.branchEntry !== undefined || record.branchResult !== undefined
      ? { branchEvidenceOwner: branchPinOwner(record) }
      : {}),
    landing: record.landing ?? next.landing,
    landingReporting: record.landingReporting ?? next.landingReporting,
    dispositionChangedAt: record.dispositionChangedAt,
    doneAt: record.doneAt,
    doneProblem: record.doneProblem,
  }));
}

// Lifecycle updates never recreate evidence the developer has deleted.
export async function updateRecord(
  sourceId: string,
  record: LaunchRecord,
): Promise<boolean> {
  let updated = false;
  await replaceRecords((kept) => ({
    ...kept,
    [sourceId]: (kept[sourceId] ?? []).map((entry) => {
      if (
        !("session" in entry) ||
        sessionKey(entry.session) !== sessionKey(record.session)
      )
        return entry;
      updated = true;
      // Native lifecycle evidence never clears newer local done/reopen intent.
      return {
        ...record,
        completion: entry.completion ?? record.completion,
        returnedToBacklog: entry.returnedToBacklog,
        landing: entry.landing ?? record.landing,
        landingReporting: entry.landingReporting ?? record.landingReporting,
        dispositionChangedAt: entry.dispositionChangedAt,
        doneAt: entry.doneAt,
        doneProblem: entry.doneProblem,
        ...keptBranchEvidence(entry),
        stopUnconfirmed: entry.stopUnconfirmed,
        reportRead: entry.reportRead,
      };
    }),
  }));
  return updated;
}

export {
  creationOf,
  keepCreation,
  removeCreation,
  keptCreations,
} from "./launchCreationStore.ts";
