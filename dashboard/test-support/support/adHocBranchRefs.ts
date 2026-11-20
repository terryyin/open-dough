// Retires an ad hoc session's worktree and branch and prunes every object no
// ref keeps, usable from either test runner.
import { git } from "./storyReviewWorktree.ts";

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
