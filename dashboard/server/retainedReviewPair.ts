// A fixed comparison reads only the objects in its saved repository.
import type { SessionBranchResult } from "../src/sessionBranchResult.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { changedFrom } from "./storyReviewFiles.ts";

interface RetainedPair {
  readonly repository: string;
  readonly base: string;
  readonly revision: string;
}

export function retainedCommitPairFiles(
  pair: RetainedPair,
  signal: AbortSignal,
) {
  return retainedPairFiles(pair, signal, ["commit"]);
}

// A working-tree snapshot can contribute a tree object to either end.
export function retainedBranchPairFiles(
  pair: SessionBranchResult,
  signal: AbortSignal,
) {
  if (pair.attributionGap !== undefined)
    return Promise.resolve({ attributionGap: pair.attributionGap });
  return retainedPairFiles(pair, signal, ["commit", "tree"]);
}

async function retainedPairFiles(
  pair: RetainedPair,
  signal: AbortSignal,
  objectKinds: readonly string[],
): Promise<
  | { readonly files: Awaited<ReturnType<typeof changedFrom>> }
  | { readonly missing: "repository" | "objects" | "changes" }
> {
  if (directoryState(pair.repository).kind !== "available")
    return { missing: "repository" };
  const call: GitCall = {
    cwd: pair.repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
    env: { GIT_NO_LAZY_FETCH: "1" },
  };
  try {
    for (const object of [pair.base, pair.revision]) {
      const kind = (
        await runGit(["cat-file", "-t", object], call)
      ).stdout.trim();
      if (!objectKinds.includes(kind)) return { missing: "objects" };
    }
  } catch {
    return { missing: "objects" };
  }
  try {
    return { files: await changedFrom(pair.base, pair.revision, call) };
  } catch {
    return { missing: "changes" };
  }
}
