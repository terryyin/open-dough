import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { discoverAdapterAttempts } from "./baseCiAdapterAttempts.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import { revisionSubject } from "./baseCiRevisionGit.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import type { GitCall } from "./gitRunner.ts";

export async function adapterRevisionLookup(
  source: PublishedSource,
  storyBranch: string | undefined,
  root: string,
  command: readonly string[],
  call: GitCall,
  signal: AbortSignal,
): Promise<RevisionCiLookup> {
  const branch =
    storyBranch !== undefined && isSafeBranchName(storyBranch)
      ? storyBranch
      : source.ref;
  const runs = await discoverAdapterAttempts(
    source,
    branch,
    root,
    command,
    signal,
    { includeOtherBranches: true },
  );
  const runsByRevision = new Map<string, ListedRun[]>();
  for (const run of runs) {
    if (run.headSha === undefined) continue;
    const headSha = run.headSha.toLowerCase();
    const normalized = { ...run, headSha };
    const atRevision = runsByRevision.get(headSha);
    if (atRevision === undefined) runsByRevision.set(headSha, [normalized]);
    else atRevision.push(normalized);
  }
  return {
    listRunsAt: (sha) => Promise.resolve(runsByRevision.get(sha) ?? []),
    subjectOf: (sha) => revisionSubject(sha, call),
  };
}
