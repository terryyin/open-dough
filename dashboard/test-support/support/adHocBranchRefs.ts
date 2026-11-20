// Git operations on an ad hoc session's branch and the refs that pin its
// kept commits, usable from either test runner.
import { realpathSync } from "node:fs";
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

export function sessionBranchPins(checkout: string, session: string): string[] {
  return git(
    checkout,
    "for-each-ref",
    "--format=%(objectname)",
    `refs/open-dough/session-branch/claude/${session}/`,
  )
    .split("\n")
    .filter(Boolean);
}

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
