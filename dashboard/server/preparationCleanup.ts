// Ends a workspace a stopped preparation start created: the worktree and the
// branch this launch made, and nothing that existed before it ran the start.

import { existsSync } from "node:fs";
import { defaultGitOutputLimit, GitFailure, runGit } from "./gitRunner.ts";
import type { ProjectFolder } from "./projectFolders.ts";

// Whether git succeeded, with what it printed to stderr.
async function tryGit(
  cwd: string,
  args: readonly string[],
): Promise<{ ok: boolean; text: string }> {
  try {
    const { stderr } = await runGit(args, {
      cwd,
      maxBuffer: defaultGitOutputLimit,
    });
    return { ok: true, text: stderr.trim() };
  } catch (error) {
    if (!(error instanceof GitFailure)) throw error;
    return { ok: false, text: error.stderr.trim() };
  }
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
