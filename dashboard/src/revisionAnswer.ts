// How the published observation reacts to one revision answer, apart from how
// that answer was delivered (`./revisionCheckSchedule.ts` or
// `./revisionStreamSchedule.ts`). Changed and moved-branch answers ask for a
// read; unchanged and failed or limited answers leave delivery free to
// continue at its pace.

import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import type { RevisionCheck } from "./revisionCheckRead.ts";
import { movedBranches } from "./movedBranchProgress.ts";

export type RevisionAnswerHandlers = {
  readonly onChanged: (revision: string) => void;
  readonly onUnchanged: () => void;
  readonly onBranchesMoved: (moved: StoryBranchHeads) => void;
  readonly onFailed: (error: unknown) => void;
};

// Whether delivery should ask again at its pace (`continue`), or a read the
// answer started will resettle the observation (`reading`).
export type RevisionAnswerReaction = "continue" | "reading";

export function reactToRevisionCheck(
  check: RevisionCheck,
  watchedHeads: StoryBranchHeads,
  {
    onChanged,
    onUnchanged,
    onBranchesMoved,
  }: Pick<
    RevisionAnswerHandlers,
    "onChanged" | "onUnchanged" | "onBranchesMoved"
  >,
): RevisionAnswerReaction {
  if (check.changed) {
    onChanged(check.revision);
    return "reading";
  }
  onUnchanged();
  const moved = movedBranches(watchedHeads, check.heads);
  if (moved.size > 0) {
    onBranchesMoved(moved);
    return "reading";
  }
  return "continue";
}

// A failed or limited check: the page records the problem, and delivery may
// continue at its pace (including waiting out a standing limit).
export function reactToRevisionCheckFailure(
  error: unknown,
  { onFailed }: Pick<RevisionAnswerHandlers, "onFailed">,
): RevisionAnswerReaction {
  onFailed(error);
  return "continue";
}
