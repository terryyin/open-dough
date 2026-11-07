import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  discoverAdapterAttempts,
  type AdapterRun,
} from "./baseCiAdapterAttempts.ts";
import { newestRunFor } from "./baseCiNearest.ts";
import { revisionSubject } from "./baseCiRevisionGit.ts";
import {
  isBuildConclusion,
  type RevisionCiLookup,
} from "./baseCiRevisionNearest.ts";
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
    { comparison: true },
  );
  const runsByRevision = new Map<string, AdapterRun[]>();
  for (const run of runs) {
    if (run.headSha === undefined) continue;
    const headSha = run.headSha.toLowerCase();
    const normalized = { ...run, headSha };
    const atRevision = runsByRevision.get(headSha);
    if (atRevision === undefined) runsByRevision.set(headSha, [normalized]);
    else atRevision.push(normalized);
  }
  return {
    listRunsAt(sha) {
      const atRevision = runsByRevision.get(sha) ?? [];
      const latest = newestRunFor(atRevision, sha);
      if (latest === undefined) return Promise.resolve([]);
      if (latest.conclusion !== "cancelled") return Promise.resolve([latest]);
      // Incomplete attempts have no verdict. Only a completed attempt of
      // this same check and context can supply the revision's result.
      const earlier = atRevision.filter(
        (run) =>
          run.check === latest.check &&
          run.context === latest.context &&
          isBuildConclusion(run.conclusion),
      );
      return Promise.resolve([newestRunFor(earlier, sha) ?? latest]);
    },
    preferCompletedAncestor: true,
    subjectOf: (sha) => revisionSubject(sha, call),
    timeWithoutRunnerWaitsOf: () =>
      Promise.resolve({
        reason: "The CI adapter does not report a job graph.",
      }),
  };
}
