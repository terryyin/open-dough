// Reads the authorized trunk for branch entry and manual delivery.
import type { BranchTrunk } from "../src/sessionBranchResult.ts";
import {
  fetchUnlessCommitPresent,
  remoteBranchHead,
} from "./gitTargetFetch.ts";
import type { GitCall } from "./gitRunner.ts";

type BranchGitCall = GitCall & { readonly signal: AbortSignal };

export function branchTrunk(remote: string, branch: string): BranchTrunk {
  return {
    remote,
    target: `refs/heads/${branch.replace(/^refs\/heads\//, "")}`,
  };
}

export async function observeBranchTrunk(
  trunk: BranchTrunk,
  call: BranchGitCall,
) {
  const revision = await remoteBranchHead(trunk.remote, trunk.target, {
    ...call,
    env: { ...call.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return { ...trunk, revision };
}

export async function readBranchTrunkRevision(
  trunk: BranchTrunk | undefined,
  call: BranchGitCall,
): Promise<string | undefined> {
  if (trunk === undefined) return undefined;
  try {
    const { revision } = await observeBranchTrunk(trunk, call);
    if (revision === undefined) return undefined;
    await fetchUnlessCommitPresent(revision, trunk, call);
    return revision;
  } catch {
    return undefined;
  }
}
