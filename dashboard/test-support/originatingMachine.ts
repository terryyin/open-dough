// The machine a published session came from, as the second-machine journey
// (../../e2e/sessions/recently-done-published-session-second-machine.spec.ts)
// prepares it: its own clone of the bare origin, where the session's branch
// adds a file and trunk later moves on without it.
import path from "node:path";
import type { StartOrigin } from "./support/startOrigin.ts";
import { commitAll, git, writeAt } from "./support/storyReviewWorktree.ts";

const workspaceOf = (origin: StartOrigin) =>
  path.join(origin.machine, "originating-machine");

// The originating clone on `branch` off trunk, with `file` added; answers the
// clone and the trunk commit the branch left.
export function addedOnBranch(
  origin: StartOrigin,
  branch: string,
  file: string,
) {
  const workspace = workspaceOf(origin);
  git(origin.machine, "clone", "--quiet", origin.origin, workspace);
  const trunk = git(workspace, "rev-parse", "HEAD");
  git(workspace, "switch", "--quiet", "-c", branch);
  writeAt(workspace, file, "published by another machine\n");
  commitAll(workspace, "Edit on the originating machine");
  return { workspace, trunk };
}

// Trunk moves on from the originating clone with `file` added; answers the
// origin's new trunk commit.
export function trunkAdvancedWith(origin: StartOrigin, file: string) {
  const workspace = workspaceOf(origin);
  git(workspace, "switch", "--quiet", "--detach", "origin/main");
  writeAt(workspace, file, "trunk moved on\n");
  commitAll(workspace, "Advance trunk after the session");
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  return git(origin.origin, "rev-parse", "main");
}
