// A Done baseline combines the saved entry files with the trunk history
// the branch actually incorporated. Review reads only the retained result.
import { commitIdSchema } from "../src/launchLanding.ts";
import type { BranchTrunk } from "../src/sessionBranchResult.ts";
import { fetchGitTarget, remoteBranchHead } from "./gitTargetFetch.ts";
import { isAncestor, runGit, type GitCall } from "./gitRunner.ts";
import { restatedPoint } from "./storyReviewComparison.ts";

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

// Excluding the ancestry of tip leaves a contiguous prefix of the target's
// first-parent history. The next commit is the latest shared trunk point.
// Git's --boundary also prints merge side parents, including a delivered
// topic tip.
async function sharedFirstParent(
  history: string,
  tip: string,
  call: BranchGitCall,
): Promise<string> {
  const { stdout: count } = await runGit(
    ["rev-list", "--first-parent", "--count", history, "--not", tip],
    call,
  );
  const { stdout } = await runGit(
    [
      "rev-list",
      "--first-parent",
      "--max-count=1",
      `--skip=${count.trim()}`,
      history,
    ],
    call,
  );
  return commitIdSchema.parse(stdout.trim());
}

type BranchAttribution = {
  readonly base: string;
  readonly attributionGap?: string;
};

export async function attributeBranchResult(
  base: string,
  entryTip: string,
  committedTip: string,
  trunk: BranchTrunk | undefined,
  call: BranchGitCall,
): Promise<BranchAttribution> {
  const ambiguous = {
    base,
    attributionGap:
      "The saved branch changes could not be separated from trunk history.",
  };
  const unavailable = {
    base,
    attributionGap:
      "The authorized trunk could not be read to separate its changes from the saved branch result.",
  };
  if (entryTip === committedTip) return { base };
  if (trunk === undefined) return unavailable;

  let target: string;
  try {
    const { revision } = await observeBranchTrunk(trunk, call);
    if (revision === undefined) return unavailable;
    target = revision;
    try {
      await runGit(["cat-file", "-e", `${target}^{commit}`], call);
    } catch {
      await fetchGitTarget(trunk.remote, trunk.target, call);
      await runGit(["cat-file", "-e", `${target}^{commit}`], call);
    }
  } catch {
    return unavailable;
  }

  try {
    const observedAtEntry = trunk.revision;
    if (
      observedAtEntry !== undefined &&
      (await sharedFirstParent(target, observedAtEntry, call)) !==
        observedAtEntry
    )
      return ambiguous;
    const entryTrunk = await sharedFirstParent(
      observedAtEntry ?? target,
      entryTip,
      call,
    );
    const incorporated = await sharedFirstParent(target, committedTip, call);
    if (
      entryTrunk === incorporated ||
      (await isAncestor(incorporated, entryTip, call))
    )
      return { base };

    // A newly shared commit on both first-parent lines could be a direct
    // delivery. An earlier target observation can establish it as trunk.
    if (
      !(await isAncestor(incorporated, observedAtEntry ?? entryTrunk, call)) &&
      (await sharedFirstParent(committedTip, incorporated, call)) ===
        incorporated
    )
      return ambiguous;

    const restated = await restatedPoint(
      { baseline: entryTrunk, tree: base },
      incorporated,
      call,
    );
    if (restated === undefined) return ambiguous;
    if (restated.inseparable.size !== 0)
      return {
        base,
        attributionGap:
          "Earlier branch changes conflict with imported trunk changes, so the saved branch changes could not be separated.",
      };
    return { base: restated.tree };
  } catch {
    return ambiguous;
  }
}
