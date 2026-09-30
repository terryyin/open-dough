// Ends a workspace a stopped preparation start created: the worktree and the
// branch this launch made, and nothing that existed before it ran the start.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import type { ProjectFolder } from "./projectFolders.ts";

function tryGit(
  cwd: string,
  args: readonly string[],
): Promise<{ ok: boolean; text: string }> {
  return new Promise((resolve) => {
    execFile("git", [...args], { cwd, encoding: "utf8" }, (...done) => {
      resolve({ ok: !done[0], text: done[2].trim() });
    });
  });
}

async function branchExists(
  project: ProjectFolder,
  branch: string,
): Promise<boolean> {
  const found = await tryGit(project.path, [
    "rev-parse",
    "--verify",
    "--quiet",
    `refs/heads/${branch}`,
  ]);
  return found.ok;
}

// What existed before the start ran: only what was absent then is removable.
export type BeforeStart = {
  readonly workspaceExisted: boolean;
  readonly branchExisted: boolean;
};

export async function beforeStart(
  project: ProjectFolder,
  workspace: string,
  branch: string,
): Promise<BeforeStart> {
  return {
    workspaceExisted: existsSync(workspace),
    branchExisted: await branchExists(project, branch),
  };
}

// Removes the worktree and branch the start created, without `--force`, and
// returns a sentence naming what could not be removed, or "" when nothing is
// left behind.
export async function removeCreatedWorkspace(
  project: ProjectFolder,
  workspace: string,
  branch: string,
  before: BeforeStart,
): Promise<string> {
  const left: string[] = [];
  if (!before.workspaceExisted && existsSync(workspace)) {
    const removed = await tryGit(project.path, [
      "worktree",
      "remove",
      workspace,
    ]);
    if (!removed.ok) left.push(`workspace ${workspace} (${removed.text})`);
  }
  if (!before.branchExisted && (await branchExists(project, branch))) {
    const removed = await tryGit(project.path, ["branch", "-D", branch]);
    if (!removed.ok) left.push(`branch ${branch} (${removed.text})`);
  }
  return left.length === 0
    ? ""
    : ` The stopped start's ${left.join(" and ")} could not be removed.`;
}
