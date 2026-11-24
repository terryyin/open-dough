// The adapter's read of where a published session record lives: the
// project's Review repository at its last synced trunk. An open syncs only
// when that ref or the UUID's record is absent, and names a failed sync that
// leaves the record absent; a file read never syncs.
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewSyncFailure } from "../src/storyReviewContract.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import {
  unknownSession,
  type PublishedSessionSource,
} from "./publishedSessionReview.ts";
import {
  ReviewSyncFailed,
  reviewRepositoryPath,
  reviewSyncFailure,
} from "./reviewRepository.ts";

type PublishedSessionSourceBounds = {
  readonly admission: () => AbortSignal;
  readonly fetch: () => AbortSignal;
};

async function revisionAtOrigin(
  ref: string,
  call: GitCall,
): Promise<string | undefined> {
  try {
    return (
      await runGit(["rev-parse", "--verify", `origin/${ref}^{commit}`], call)
    ).stdout.trim();
  } catch {
    return undefined;
  }
}

async function recordPresentAt(
  backlogPath: string,
  revision: string,
  sessionId: string,
  call: GitCall,
): Promise<boolean> {
  const path = sessionRecordPathBeside(backlogPath, sessionId);
  try {
    await runGit(["cat-file", "-e", `${revision}:${path}`], call);
    return true;
  } catch {
    return false;
  }
}

const admissionCall = (source: PublishedSource, signal: AbortSignal) => ({
  cwd: reviewRepositoryPath(source),
  signal,
  maxBuffer: 1024 * 1024,
});

// The project's last synced trunk and whether it holds the session's record.
async function lastSyncOf(
  source: PublishedSource,
  sessionId: string,
  admission: AbortSignal,
): Promise<{ revision?: string; recorded: boolean }> {
  const call = admissionCall(source, admission);
  const revision = await revisionAtOrigin(source.ref, call);
  if (revision === undefined) return { recorded: false };
  const recorded = await recordPresentAt(
    source.backlogPath,
    revision,
    sessionId,
    call,
  );
  return { revision, recorded };
}

// The source at a synced revision; a project never synced holds no session.
const sourceAt = (
  source: PublishedSource,
  revision: string | undefined,
): PublishedSessionSource => {
  if (revision === undefined) throw unknownSession();
  return {
    repository: reviewRepositoryPath(source),
    revision,
    backlogPath: source.backlogPath,
  };
};

// The last synced trunk, without a remote request: a file read admits
// against the record the open that showed it has already synced, and the
// record's reader refuses a session absent from it.
export async function lastSyncedPublishedSessionSource(
  source: PublishedSource,
  admission: AbortSignal,
): Promise<PublishedSessionSource> {
  return sourceAt(
    source,
    await revisionAtOrigin(source.ref, admissionCall(source, admission)),
  );
}

// The open's sync, with the session's fetch bound running out named as a
// failed sync; a request abort still rethrows.
async function sessionSyncFailure(
  source: PublishedSource,
  bounds: PublishedSessionSourceBounds,
): Promise<ReviewSyncFailure | undefined> {
  try {
    return await reviewSyncFailure(source, bounds.fetch());
  } catch (error) {
    if (bounds.admission().aborted) throw error;
    return { problem: gitProblem(error) };
  }
}

// Throws ReviewSyncFailed when the open's sync failed and the last synced
// trunk still lacks the record, or the project never synced.
export async function fetchedPublishedSessionSource(
  source: PublishedSource,
  sessionId: string,
  bounds: PublishedSessionSourceBounds,
): Promise<PublishedSessionSource> {
  const current = await lastSyncOf(source, sessionId, bounds.admission());
  if (current.recorded) return sourceAt(source, current.revision);

  const failure = await sessionSyncFailure(source, bounds);
  // Give the last synced trunk its read budget after the sync settles.
  const synced = await lastSyncOf(source, sessionId, bounds.admission());
  if (failure !== undefined && !synced.recorded)
    throw new ReviewSyncFailed(failure);
  return sourceAt(source, synced.revision);
}
