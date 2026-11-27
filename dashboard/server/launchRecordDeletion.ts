// Session deletion checks native state. Record removal keeps durable intent.
import type { DeleteRecordAnswer } from "../src/deleteRecord.ts";
import { landingReportingReference } from "../src/launchLanding.ts";
import { recordDeletable, type LaunchRecord } from "../src/launchRecord.ts";
import { removeLandingPins } from "./launchLandingGit.ts";
import {
  recordLanding,
  releaseSessionBranchRefs,
  releaseSessionCommitRefs,
} from "./launchRecordPins.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import {
  keptSession,
  machineRecordStore,
  type LaunchRecordStore,
} from "./launchRecordStore.ts";
import {
  keptAttempts,
  replaceAttempts,
  withKeptAttempts,
} from "./launchAttemptStore.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { admittedDelete } from "./sessionAdmission.ts";

export async function deleted(
  { source, record }: Awaited<ReturnType<typeof admittedDelete>>,
  launches: AgentLaunches,
): Promise<DeleteRecordAnswer> {
  const joined = await launches.stateOf(source, record);
  if (!recordDeletable(joined)) {
    return { kind: "state-known", record: joined };
  }
  let wasDeleted: boolean;
  try {
    wasDeleted = await deleteRecord(source.id, record.session);
  } catch (error) {
    throw new RefusedRequest(
      500,
      `The session record could not be deleted: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  // Only once the record is actually gone may its host retire the
  // session-local state that record alone remembered; a kept record
  // (a failed deletion above) keeps that state, so a session whose
  // record survives stays resumable exactly as before.
  if (wasDeleted) {
    try {
      const { notifyRecordRemoved } = await import("./launchRecordRemoval.ts");
      await notifyRecordRemoved(record);
    } catch (error) {
      throw new RefusedRequest(
        500,
        `The session record was deleted, but its session-local state could not be removed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return { kind: "deleted" };
}

// Removes one kept session's record, leaving the project's other records as
// they are. Answers whether such a record was kept.
export async function deleteRecord(
  sourceId: string,
  session: SessionReference,
  store: LaunchRecordStore = machineRecordStore,
): Promise<boolean> {
  const record = await keptSession(sourceId, session, store);
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
      await store.replaceRecords((kept) => ({
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
    await store.replaceRecords((kept) => {
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
