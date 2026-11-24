// The adapter's read of where a published session record lives: the
// project's Review repository at its last synced trunk, syncing only when
// that ref or the UUID's record is absent.
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

export async function fetchedPublishedSessionSource(
  source: PublishedSource,
  sessionId: string,
  bounds: PublishedSessionSourceBounds,
): Promise<PublishedSessionSource> {
  const { ref, backlogPath } = source;
  const repository = reviewRepositoryPath(source);
  const admission: GitCall = {
    cwd: repository,
    signal: bounds.admission(),
    maxBuffer: 1024 * 1024,
  };
  const at = (revision: string): PublishedSessionSource => ({
    repository,
    revision,
    backlogPath,
  });
  const current = await revisionAtOrigin(ref, admission);
  if (
    current !== undefined &&
    (await recordPresentAt(backlogPath, current, sessionId, admission))
  )
    return at(current);

  try {
    await syncedReviewRepository(source, bounds.fetch());
  } catch {
    // Unreachable or hung origin: the last synced trunk still names records.
  }
  // Give the fallback its read budget after the fetch settles.
  const revision = await revisionAtOrigin(ref, {
    ...admission,
    signal: bounds.admission(),
  });
  if (revision === undefined)
    throw new RefusedRequest(
      404,
      "This machine has not synced this project's published trunk.",
    );
  return at(revision);
}
