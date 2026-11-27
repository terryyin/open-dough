// Capture authority is established once, then follows the original bound record.
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { CreationRecord } from "../src/launchCreation.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type {
  LandingReporting,
  LandingRepository,
  LaunchLanding,
} from "../src/launchLanding.ts";
import { storyOf } from "../src/launchWorkflow.ts";
import { sessionKey } from "../src/sessionReference.ts";

type StoredRecord = LaunchRecord | CreationRecord;
export type LandingRecordChange = (records: StoredRecord[]) => StoredRecord[];

export function landingStoryOfAttempt({
  request,
  publication,
}: LaunchAttemptRecord): string | undefined {
  if (request.workflow !== "ad-hoc") return storyOf(request);
  return publication.kind === "published"
    ? publication.identity
    : request.followUp?.storyIdentity;
}

export function declaredLandingAuthority(
  record: LaunchRecord,
): LandingRepository | undefined {
  const entry = record.branchEntry;
  if (entry?.trunk === undefined) return undefined;
  const identity = storyOf(record.request);
  if (identity === undefined) return undefined;
  return {
    repository: entry.repository,
    workspace: entry.workspace,
    branch: entry.branch,
    identity,
    remote: entry.trunk.remote,
    target: entry.trunk.target,
  };
}

// Apply the change to the same launch in the write's own retained records.
export function changeBoundLandingRecord(
  bound: LaunchRecord,
  update: (current: LaunchRecord) => LaunchRecord,
): LandingRecordChange | undefined {
  if (update(bound) === bound) return undefined;
  const key = sessionKey(bound.session);
  return (records) => {
    const current = records.find(
      (entry): entry is LaunchRecord =>
        "session" in entry &&
        sessionKey(entry.session) === key &&
        entry.launchedAt === bound.launchedAt &&
        entry.request.reporting?.reference ===
          bound.request.reporting?.reference &&
        entry.landingReporting?.branchContext?.reference ===
          bound.landingReporting?.branchContext?.reference &&
        entry.landingReporting?.deletedAt === undefined,
    );
    if (current === undefined) return records;
    const next = update(current);
    if (next === current) return records;
    return records.map((entry) => (entry === current ? next : entry));
  };
}

// A late attempt write can add its preparations without dropping a newer one.
export function withLandingPreparations(
  reporting: LandingReporting,
  preparations: readonly LaunchLanding[],
): LandingReporting {
  const missing = preparations.filter(
    ({ delivery }) =>
      !reporting.preparations.some((entry) => entry.delivery === delivery),
  );
  return missing.length === 0
    ? reporting
    : { ...reporting, preparations: [...reporting.preparations, ...missing] };
}

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
