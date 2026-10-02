// Deletion records launch-local intent even before native launch settlement.
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { replaceAttempts, withKeptAttempts } from "./launchAttemptStore.ts";
import { replaceRecords } from "./launchRecordDocument.ts";

// Removes one kept session's record, leaving the project's other records as
// they are. Answers whether such a record was kept.
export async function deleteRecord(
  sourceId: string,
  session: SessionReference,
): Promise<boolean> {
  const record = (await keptRecords(sourceId)).find(
    (entry) => sessionKey(entry.session) === sessionKey(session),
  );
  const reference = record?.request.reporting?.reference;
  if (reference !== undefined) {
    // Write intent before deletion; a late binding cannot recreate its record.
    await replaceAttempts((kept) => ({
      ...kept,
      [sourceId]: (kept[sourceId] ?? []).map((entry) =>
        entry.id === reference
          ? { ...entry, reportingDeletedAt: new Date().toISOString() }
          : entry,
      ),
    }));
  }
  return withKeptAttempts(async () => {
    let deleted = false;
    await replaceRecords((kept) => {
      const records = kept[sourceId];
      if (records === undefined) {
        return kept;
      }
      const remaining = records.filter(
        (record) =>
          !("session" in record) ||
          sessionKey(record.session) !== sessionKey(session),
      );
      deleted = remaining.length < records.length;
      return { ...kept, [sourceId]: remaining };
    });
    return deleted;
  });
}
