// The adapter's read of where a published session record lives: the
// project's Review repository at its last synced trunk. An open syncs only
// when that ref or the UUID's record is absent; a file read never syncs.
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { PublishedSessionSource } from "./publishedSessionReview.ts";
import {
  reviewRepositoryPath,
  syncedReviewRepository,
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

const notSynced = () =>
  new RefusedRequest(
    404,
    "This machine has not synced this project's published trunk.",
  );

const admissionCall = (source: PublishedSource, signal: AbortSignal) => ({
  cwd: reviewRepositoryPath(source),
  signal,
  maxBuffer: 1024 * 1024,
});

const sourceAt = (
  source: PublishedSource,
  revision: string,
): PublishedSessionSource => ({
  repository: reviewRepositoryPath(source),
  revision,
  backlogPath: source.backlogPath,
});

// The last synced trunk, without a remote request: a file read admits
// against the record the open that showed it has already synced, and the
// record's reader refuses a session absent from it.
export async function lastSyncedPublishedSessionSource(
  source: PublishedSource,
  admission: AbortSignal,
): Promise<PublishedSessionSource> {
  const revision = await revisionAtOrigin(
    source.ref,
    admissionCall(source, admission),
  );
  if (revision === undefined) throw notSynced();
  return sourceAt(source, revision);
}

export async function fetchedPublishedSessionSource(
  source: PublishedSource,
  sessionId: string,
  bounds: PublishedSessionSourceBounds,
): Promise<PublishedSessionSource> {
  const admission = admissionCall(source, bounds.admission());
  const current = await revisionAtOrigin(source.ref, admission);
  if (
    current !== undefined &&
    (await recordPresentAt(source.backlogPath, current, sessionId, admission))
  )
    return sourceAt(source, current);

  try {
    await syncedReviewRepository(source, bounds.fetch());
  } catch {
    // Unreachable or hung origin: the last synced trunk still names records.
  }
  // Give the fallback its read budget after the fetch settles.
  return lastSyncedPublishedSessionSource(source, bounds.admission());
}
