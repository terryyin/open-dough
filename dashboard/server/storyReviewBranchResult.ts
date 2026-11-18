import type { SessionBranchResult } from "../src/sessionBranchResult.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { retainedBranchPairFiles } from "./retainedReviewPair.ts";

export async function branchResultReview(
  result: SessionBranchResult,
  signal: AbortSignal,
): Promise<StoryReview> {
  const read = await retainedBranchPairFiles(result, signal);
  if ("missing" in read)
    return {
      kind: "unavailable",
      explanation: {
        repository: "The saved branch repository is missing or unreadable.",
        objects:
          "The saved branch comparison objects are missing or unreadable.",
        changes: "The saved branch changes could not be read.",
      }[read.missing],
    };
  return {
    kind: "branch-result",
    doneAt: result.doneAt,
    baseline: result.base,
    tree: result.revision,
    files: read.files,
  };
}
