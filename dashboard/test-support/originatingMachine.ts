// The machine published sessions came from, as the published-session journey
// (../../e2e/sessions/recently-done-published-sessions.spec.ts) prepares it:
// its own clone of the bare origin, where each session's branch adds a file
// and trunk later moves on without it.
import { existsSync } from "node:fs";
import path from "node:path";
import type { StartOrigin } from "./support/startOrigin.ts";
import { dashboardDeveloper } from "./support/startOriginPreparation.ts";
import { commitAll, git, writeAt } from "./support/storyReviewWorktree.ts";

const workspaceOf = (origin: StartOrigin) =>
  path.join(origin.machine, "originating-machine");

// The originating clone, with the project checkout's identity, on `branch` off
// the origin's current trunk with `file` added; answers the clone and the
// trunk commit the branch left.
export function addedOnBranch(
  origin: StartOrigin,
  branch: string,
  file: string,
) {
  const workspace = workspaceOf(origin);
  if (existsSync(workspace)) git(workspace, "fetch", "--quiet", "origin");
  else
    git(
      origin.machine,
      "clone",
      "--quiet",
      "-c",
      `user.name=${dashboardDeveloper.name}`,
      "-c",
      `user.email=${dashboardDeveloper.email}`,
      origin.origin,
      workspace,
    );
  const trunk = git(workspace, "rev-parse", "origin/main");
  git(workspace, "switch", "--quiet", "-c", branch, trunk);
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
