// A described workspace's state beyond its revisions, as a developer leaves
// it uncommitted: files staged in the index, files edited but not staged,
// untracked files, files Git ignores through the repository's info/exclude,
// and file modes changed alone. Materialization writes it after the
// workspace's revisions, in that order.

import { execFileSync } from "node:child_process";
import { appendFileSync, chmodSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describedWorkspaces } from "./repository-workspace.mjs";

/**
 * @typedef {{
 *   staged?: Readonly<Record<string, string>>,
 *   unstaged?: Readonly<Record<string, string>>,
 *   untracked?: Readonly<Record<string, string>>,
 *   ignored?: Readonly<Record<string, string>>,
 *   modes?: Readonly<Record<string, number>>,
 * }} LocalState
 */

/**
 * A described workspace with its declared local state.
 * @typedef {import("./repositoryTestData.mjs").RepositoryWorkspace & { local?: LocalState }} WorkspaceWithLocalState
 */

/**
 * The description with one workspace's local state extended by `local`;
 * each kind of fact merges file by file over what the description states.
 * With several workspaces, `branch` names which one receives the state.
 * @template {{ workspace?: object & { local?: LocalState }, workspaces?: readonly (object & { local?: LocalState })[] }} Description
 * @param {Description} description
 * @param {LocalState} local
 * @param {string} [branch]
 * @returns {Description}
 */
export function withLocalState(description, local, branch) {
  const workspaces = describedWorkspaces(description);
  if (workspaces.length === 0)
    throw new Error("Local state needs a workspace: call withWorkspace first");
  const target =
    branch !== undefined
      ? workspaces.find((workspace) => workspace.branch === branch)
      : workspaces.length === 1
        ? workspaces[0]
        : undefined;
  if (target === undefined)
    throw new Error(
      branch === undefined
        ? "Local state needs a workspace branch when several are declared"
        : `Local state names unknown workspace ${branch}`,
    );
  const merged = { .../** @type {WorkspaceWithLocalState} */ (target).local };
  for (const [kind, facts] of Object.entries(local))
    Object.assign(merged, {
      [kind]: { ...merged[/** @type {keyof LocalState} */ (kind)], ...facts },
    });
  const updated = workspaces.map((workspace) =>
    workspace.branch === target.branch
      ? { ...workspace, local: merged }
      : workspace,
  );
  const rest = { ...description };
  delete rest.workspace;
  delete rest.workspaces;
  return /** @type {Description} */ (
    updated.length === 1
      ? { ...rest, workspace: updated[0] }
      : { ...rest, workspaces: updated }
  );
}

/**
 * @param {string} root
 * @param {Readonly<Record<string, string>> | undefined} files
 */
function writeFiles(root, files = {}) {
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
}

/**
 * Writes the declared local state into a checked-out worktree.
 * @param {string} worktree
 * @param {LocalState | undefined} local
 */
export function writeLocalState(worktree, local) {
  if (!local) return;
  const git = (/** @type {string[]} */ ...args) =>
    execFileSync("git", ["-C", worktree, ...args], { encoding: "utf8" }).trim();
  const staged = Object.keys(local.staged ?? {});
  writeFiles(worktree, local.staged);
  if (staged.length > 0) git("add", "--", ...staged);
  writeFiles(worktree, local.unstaged);
  writeFiles(worktree, local.untracked);
  const ignored = Object.keys(local.ignored ?? {});
  if (ignored.length > 0)
    appendFileSync(
      path.resolve(
        worktree,
        git("rev-parse", "--git-common-dir"),
        "info",
        "exclude",
      ),
      ignored.map((file) => `${file}\n`).join(""),
    );
  writeFiles(worktree, local.ignored);
  for (const [file, mode] of Object.entries(local.modes ?? {}))
    chmodSync(path.join(worktree, file), mode);
}
