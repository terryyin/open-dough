// The adapter's read of where a published session record lives: the
// configured project's checkout at its last fetched trunk, fetching only when
// that ref or the UUID's record is absent. An unknown project is refused
// before any Git read.
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { fetchGitTarget } from "./gitTargetFetch.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { projectFolder } from "./projectFolders.ts";
import type { PublishedSessionSource } from "./publishedSessionReview.ts";

// Separate bounds so a hung fetch cannot spend the fallback rev-parse budget.
export type PublishedSessionSourceBounds = {
  readonly admission: AbortSignal;
  readonly fetch: AbortSignal;
};

async function revisionAtOrigin(
  source: PublishedSource,
  call: GitCall,
): Promise<string | undefined> {
  try {
    return (
      await runGit(
        ["rev-parse", "--verify", `origin/${source.ref}^{commit}`],
        call,
      )
    ).stdout.trim();
  } catch {
    return undefined;
  }
}

async function recordPresentAt(
  source: PublishedSource,
  revision: string,
  sessionId: string,
  call: GitCall,
): Promise<boolean> {
  const path = sessionRecordPathBeside(source.backlogPath, sessionId);
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
  const repository = projectFolder(source).path;
  const admission: GitCall = {
    cwd: repository,
    signal: bounds.admission,
    maxBuffer: 1024 * 1024,
  };
  const at = (revision: string): PublishedSessionSource => ({
    repository,
    revision,
    backlogPath: source.backlogPath,
  });
  const current = await revisionAtOrigin(source, admission);
  if (
    current !== undefined &&
    (await recordPresentAt(source, current, sessionId, admission))
  )
    return at(current);

  try {
    await fetchGitTarget("origin", source.ref, {
      ...admission,
      signal: bounds.fetch,
    });
  } catch {
    // Unreachable or hung origin: the last fetched trunk still names records.
  }
  const revision = await revisionAtOrigin(source, admission);
  if (revision === undefined)
    throw new RefusedRequest(
      404,
      "This machine has not fetched this project's published trunk.",
    );
  return at(revision);
}
