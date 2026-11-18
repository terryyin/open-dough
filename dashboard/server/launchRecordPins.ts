// What a launch record keeps in a saved repository, released with the
// record: the references holding its landing's comparisons
// (`./launchLandingGit.ts`) and its session's kept commit runs
// (`./sessionCommitsCapture.ts`). Done, explicit deletion and retention expiry
// share the same session prefix.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { SessionCommits } from "../src/sessionCommits.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit } from "./gitRunner.ts";
import { pinPair, removeLandingPins, removePins } from "./launchLandingGit.ts";
import { defaultMainStart, resolvedCheckout } from "./sessionCommitsCapture.ts";

const sessionCommitsRefPrefix = (session: LaunchRecord["session"]) =>
  `refs/open-dough/session-commits/${session.host}/${session.sessionId}/`;

const canonicalRepository = (cwd: string) =>
  commonGitDirectory({
    cwd: resolvedCheckout(cwd),
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  });

// Hold the read's pairs in place of any pairs pinned for an earlier Done.
export async function keepSessionCommitRefs(
  session: LaunchRecord["session"],
  { repository, runs }: SessionCommits,
): Promise<void> {
  const prefix = sessionCommitsRefPrefix(session);
  await removePins(repository, prefix);
  for (const [index, run] of runs.entries())
    await pinPair(repository, `${prefix}${String(index)}/`, run);
}

// Use the repository that actually held the refs when it is known. A record
// with no capture can still have refs in its Default main checkout's repository.
export async function releaseSessionCommitRefs(
  record: LaunchRecord,
  savedRepository = record.sessionCommits?.repository,
  keepingRepository?: string,
): Promise<void> {
  try {
    let repository = savedRepository;
    if (repository === undefined) {
      const start = defaultMainStart(record);
      if (start === undefined) return;
      repository = await canonicalRepository(start.workspace);
    }
    // An older path can still resolve to the repository of the new capture.
    if (
      keepingRepository !== undefined &&
      (await canonicalRepository(repository)) ===
        (await canonicalRepository(keepingRepository))
    )
      return;
    await removePins(repository, sessionCommitsRefPrefix(record.session));
  } catch {
    // An unavailable repository does not keep a failed capture or a record.
  }
}

// Where a record's landing references are held, as the record itself states:
// its captured landing, or the authority its launch reports through.
export function recordLanding(
  record: LaunchRecord | undefined,
): { readonly repository: string; readonly reference: string } | undefined {
  if (record === undefined) return undefined;
  if (record.landing !== undefined) return record.landing;
  const repository = record.landingReporting?.authority.repository;
  const reference = record.request.reporting?.reference;
  return repository === undefined || reference === undefined
    ? undefined
    : { repository, reference };
}

// A record that left by retention has no later deletion to retry from.
export async function releaseExpiredRecordPins(
  record: LaunchRecord,
): Promise<void> {
  await releaseSessionCommitRefs(record);
  const landing = recordLanding(record);
  if (landing !== undefined)
    await removeLandingPins(landing.repository, landing.reference).catch(
      () => undefined,
    );
}
