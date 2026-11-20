// Git operations on an ad hoc session's branch and the refs that pin its
// kept commits, usable from either test runner.
import { realpathSync } from "node:fs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import type { SessionReference } from "../../src/sessionReference.ts";
import { git } from "./storyReviewWorktree.ts";

// Adds `workspace` as a worktree of `checkout` on a new `branch` and answers
// the path Git registers for it.
export function addAdHocWorktree(
  checkout: string,
  workspace: string,
  branch: string,
) {
  git(checkout, "worktree", "add", "--quiet", "-b", branch, workspace);
  return realpathSync(workspace);
}

export function retireAdHocBranch(
  checkout: string,
  workspace: string,
  branch: string,
  { discardWorkingChanges = false } = {},
) {
  git(
    checkout,
    "worktree",
    "remove",
    ...(discardWorkingChanges ? ["--force"] : []),
    workspace,
  );
  git(checkout, "branch", "--quiet", "-D", branch);
  git(checkout, "reflog", "expire", "--expire=now", "--all");
  git(checkout, "gc", "--quiet", "--prune=now");
}

// The objects `repository` pins for `session`'s branch, ordered by ref name.
export const sessionBranchPinnedObjects = async (
  repository: string,
  session: SessionReference,
) =>
  (await sessionBranchPins(repository, session)).map(
    ({ objectId }) => objectId,
  );

export function landingPins(checkout: string): string[] {
  return git(
    checkout,
    "for-each-ref",
    "--format=%(refname)",
    "refs/open-dough/one-shot",
  )
    .split("\n")
    .filter(Boolean);
}
