// A fixed comparison reads only the objects in its saved repository.
import { runGit, type GitCall } from "./gitRunner.ts";
import { directoryState } from "./sessionWorkspace.ts";
import { changedFrom } from "./storyReviewFiles.ts";

interface RetainedPair {
  readonly repository: string;
  readonly base: string;
  readonly revision: string;
}

export async function retainedCommitPairFiles(
  pair: RetainedPair,
  signal: AbortSignal,
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
      if (kind !== "commit") return { missing: "objects" };
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
