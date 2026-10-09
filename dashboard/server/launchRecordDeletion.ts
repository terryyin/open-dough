// Deletion records launch-local intent even before native launch settlement.
import { removeLandingPins } from "./oneShotLandingGit.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { keptRecords } from "./launchRecordStore.ts";
import {
  keptAttempts,
  replaceAttempts,
  withKeptAttempts,
} from "./launchAttemptStore.ts";
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
  const deletedAttempt = (await keptAttempts())?.find(
    (entry) =>
      entry.request.source === sourceId &&
      entry.reportingDeletedAt !== undefined &&
      entry.reportingDeletedSession !== undefined &&
      sessionKey(entry.reportingDeletedSession) === sessionKey(session),
  );
  const reference = record?.request.reporting?.reference ?? deletedAttempt?.id;
  if (reference !== undefined) {
    // Write intent before deletion; a late binding cannot recreate its record.
    await replaceAttempts((kept) => ({
      ...kept,
      [sourceId]: (kept[sourceId] ?? []).map((entry) =>
        entry.id === reference
          ? {
              ...entry,
              reportingDeletedAt:
                entry.reportingDeletedAt ?? new Date().toISOString(),
              reportingDeletedSession: {
                host: session.host,
                sessionId: session.sessionId,
              },
            }
          : entry,
      ),
    }));
  }
  return withKeptAttempts(async (attempts) => {
    // Durable intent prevents late writers before removing refs; a failed deletion can retry.
    const repository =
      record?.landing?.repository ??
      attempts?.find((entry) => entry.id === reference)?.landingRepository
        ?.repository;
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
    // Metadata removal is durable first; intent and repository survive a failed pin cleanup.
    if (reference !== undefined && repository !== undefined)
      await removeLandingPins(repository, reference);
    return deleted;
  });
}
