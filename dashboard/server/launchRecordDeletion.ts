// Deletion records launch-local intent even before native launch settlement.
import { landingReportingReference } from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { removeLandingPins } from "./launchLandingGit.ts";
import {
  recordLanding,
  releaseSessionBranchRefs,
  releaseSessionCommitRefs,
} from "./launchRecordPins.ts";
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
      record?.landingReporting?.authority.repository ??
      attempts?.find((entry) => entry.id === reference)?.landingRepository
        ?.repository;
    const landing =
      reference === undefined || repository === undefined
        ? recordLanding(record)
        : { repository, reference };
    const retainedCleanup = record?.landingReporting !== undefined;
    if (retainedCleanup) {
      // Retain intent and repository in this same record until pin cleanup
      // succeeds, even if the startup attempt expires before retry.
      await replaceRecords((kept) => ({
        ...kept,
        [sourceId]: (kept[sourceId] ?? []).map((entry) =>
          "session" in entry &&
          sessionKey(entry.session) === sessionKey(session) &&
          landingReportingReference(entry) === landing?.reference &&
          entry.landingReporting !== undefined
            ? {
                ...entry,
                landingReporting: {
                  ...entry.landingReporting,
                  deletedAt:
                    entry.landingReporting.deletedAt ??
                    new Date().toISOString(),
                },
              }
            : entry,
        ),
      }));
      if (landing !== undefined)
        await removeLandingPins(landing.repository, landing.reference);
    }
    let deleted: LaunchRecord | undefined;
    await replaceRecords((kept) => {
      const records = kept[sourceId];
      if (records === undefined) {
        return kept;
      }
      const remaining = records.filter((record) => {
        if (
          !("session" in record) ||
          sessionKey(record.session) !== sessionKey(session)
        )
          return true;
        deleted = record;
        return false;
      });
      return { ...kept, [sourceId]: remaining };
    });
    // Any capture that won the record lock first has settled in `deleted`.
    if (deleted !== undefined) {
      await releaseSessionCommitRefs(deleted);
      await releaseSessionBranchRefs(deleted);
    }
    // Older records recover their repository through the retained attempt.
    if (!retainedCleanup) {
      const latestLanding = recordLanding(deleted) ?? landing;
      if (latestLanding !== undefined)
        await removeLandingPins(
          latestLanding.repository,
          latestLanding.reference,
        );
    }
    return deleted !== undefined;
  });
}
