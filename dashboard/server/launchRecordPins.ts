// What a launch record keeps in a saved repository, released with the
// record: the references holding its landing's comparisons
// (`./launchLandingGit.ts`) and its session's kept commit runs
// (`./sessionCommitsCapture.ts`). Done, explicit deletion and retention expiry
// share the same session prefix.
import { landingReportingReference } from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { SessionCommits } from "../src/sessionCommits.ts";
import {
  branchPinOwner,
  type SessionBranchEntry,
  type SessionBranchResult,
} from "../src/sessionBranchResult.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit, runGitUntilClosed } from "./gitRunner.ts";
import {
  heldPins,
  pinPair,
  removeLandingPins,
  removePins,
} from "./launchLandingGit.ts";
import {
  recordedExecutionCheckoutStart,
  resolvedCheckout,
} from "./sessionCommitsCapture.ts";

const sessionCommitsRefPrefix = (session: LaunchRecord["session"]) =>
  `refs/open-dough/session-commits/${session.host}/${session.sessionId}/`;

const sessionBranchRefPrefix = (session: SessionReference) =>
  `refs/open-dough/session-branch/${session.host}/${session.sessionId}/`;

// The branch pins `repository` holds for `session`, ordered by ref name.
export const sessionBranchPins = (
  repository: string,
  session: SessionReference,
) => heldPins(repository, sessionBranchRefPrefix(session));

const branchResultRefPrefix = (
  session: SessionReference,
  result: SessionBranchResult,
) =>
  `${sessionBranchRefPrefix(session)}${result.doneAt.replace(/[.:]/g, "-")}/`;

const branchEntryRefPrefix = (session: SessionReference) =>
  `${sessionBranchRefPrefix(session)}entry/`;

async function keepTipRef(
  repository: string,
  ref: string,
  tip: string,
): Promise<void> {
  await runGitUntilClosed(["update-ref", ref, tip], {
    cwd: repository,
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  });
}

export async function keepBranchEntryRefs(
  session: SessionReference,
  entry: SessionBranchEntry,
): Promise<void> {
  const prefix = branchEntryRefPrefix(session);
  await pinPair(entry.repository, prefix, {
    base: entry.committedTip,
    revision: entry.tree,
  });
  if (entry.defaultTip !== undefined && entry.defaultTip !== entry.committedTip)
    await keepTipRef(
      entry.repository,
      `${prefix}default-tip`,
      entry.defaultTip,
    );
}

export function releaseBranchEntryRefs(
  session: SessionReference,
  entry: SessionBranchEntry,
): Promise<void> {
  return removePins(entry.repository, branchEntryRefPrefix(session));
}

export async function keepBranchResultRefs(
  session: SessionReference,
  result: SessionBranchResult,
): Promise<void> {
  const prefix = branchResultRefPrefix(session, result);
  await pinPair(result.repository, prefix, result);
  if (result.committedTip !== result.revision)
    await keepTipRef(result.repository, `${prefix}tip`, result.committedTip);
}

export async function releaseBranchResultRefs(
  session: SessionReference,
  result: SessionBranchResult | undefined,
): Promise<void> {
  if (result !== undefined)
    await removePins(
      result.repository,
      branchResultRefPrefix(session, result),
    ).catch(() => undefined);
}

export async function releaseSessionBranchRefs(
  record: LaunchRecord,
): Promise<void> {
  const result = record.branchEntry ?? record.branchResult;
  if (result !== undefined)
    await removePins(
      result.repository,
      sessionBranchRefPrefix(branchPinOwner(record)),
    ).catch(() => undefined);
}

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
// with no capture can still have refs in its execution checkout.
export async function releaseSessionCommitRefs(
  record: LaunchRecord,
  savedRepository = record.sessionCommits?.repository,
  keepingRepository?: string,
): Promise<void> {
  try {
    let repository = savedRepository;
    if (repository === undefined) {
      const start = recordedExecutionCheckoutStart(record);
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
  const reference = landingReportingReference(record);
  return repository === undefined || reference === undefined
    ? undefined
    : { repository, reference };
}

// A record that left by retention has no later deletion to retry from.
export async function releaseExpiredRecordPins(
  record: LaunchRecord,
): Promise<void> {
  await releaseSessionCommitRefs(record);
  await releaseSessionBranchRefs(record);
  const landing = recordLanding(record);
  if (landing !== undefined)
    await removeLandingPins(landing.repository, landing.reference).catch(
      () => undefined,
    );
}
