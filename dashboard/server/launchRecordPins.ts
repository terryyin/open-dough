// What a launch record keeps in a saved repository, released with the
// record: the references holding its landing's comparisons
// (`./launchLandingGit.ts`) and its session's kept commit runs
// (`./sessionCommitsCapture.ts`). Explicit deletion and retention expiry
// both release through this one rule. Removing those references is the only
// write; every other reference and object stays as it is.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { removeLandingPins, removePins } from "./launchLandingGit.ts";

export const sessionCommitsRefPrefix = (session: LaunchRecord["session"]) =>
  `refs/open-dough/session-commits/${session.host}/${session.sessionId}/`;

// Where a record's landing references are held, as the record itself states:
// its captured landing, or the authority its launch reports through.
export function recordLanding(
  record: LaunchRecord,
): { readonly repository: string; readonly reference: string } | undefined {
  if (record.landing !== undefined) return record.landing;
  const repository = record.landingReporting?.authority.repository;
  const reference = record.request.reporting?.reference;
  return repository === undefined || reference === undefined
    ? undefined
    : { repository, reference };
}

// Releases the record's session runs, then its landing references held at
// `landing`. Session runs have no retry of their own, so a repository that is
// gone or unreadable leaves them and the release goes on; a landing release
// that fails throws, for the caller to retry or let go.
export async function releaseRecordPins(
  record: LaunchRecord | undefined,
  landing:
    | { readonly repository: string; readonly reference: string }
    | undefined = record === undefined ? undefined : recordLanding(record),
): Promise<void> {
  if (record?.sessionCommits !== undefined)
    await removePins(
      record.sessionCommits.repository,
      sessionCommitsRefPrefix(record.session),
    ).catch(() => undefined);
  if (landing !== undefined)
    await removeLandingPins(landing.repository, landing.reference);
}

// A record that left by retention has no later deletion to retry from, so
// neither failure keeps anything from expiring.
export const releaseExpiredRecordPins = (record: LaunchRecord): Promise<void> =>
  releaseRecordPins(record).catch(() => undefined);
