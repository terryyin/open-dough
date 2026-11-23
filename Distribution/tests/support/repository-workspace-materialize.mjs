// @ts-check
// Materializes described execution workspaces as worktrees of an integration
// checkout: the first at the fixture `execution` path, further ones under
// `.worktrees/<branch basename>`, with declared agent authorship, unpublished
// revisions, and local state.
import { basename, join } from "node:path";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { writeLocalState } from "./repository-local-state.mjs";
import {
  commitDeclaredRevision,
  configureDeclaredAgentAuthorship,
  configureIdentity,
  declaredParents,
  tagRevision,
} from "./repository-revision-commit.mjs";
import { describedWorkspaces } from "./repository-workspace.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repositoryTestData.mjs").GitPerson} GitPerson */
/** @typedef {import("./repository-local-state.mjs").WorkspaceWithLocalState} WorkspaceWithLocalState */

/**
 * One described workspace as a worktree of `integration` at `worktree`, with
 * its branch from the named trunk revision, declared agent authorship, its
 * unpublished revisions, and local state. Answers the tip SHA.
 * @param {string} integration
 * @param {string} worktree
 * @param {import("./repositoryTestData.mjs").RepositoryWorkspace} workspace
 * @param {Map<string, string>} commits
 * @param {GitPerson} checkoutIdentity
 */
async function materializeWorkspace(
  integration,
  worktree,
  workspace,
  commits,
  checkoutIdentity,
) {
  const start = /** @type {string} */ (commits.get(workspace.from));
  await git(integration, "branch", workspace.branch, start);
  await git(integration, "worktree", "add", worktree, workspace.branch);
  if (workspace.checkoutIdentity)
    await configureIdentity(worktree, workspace.checkoutIdentity, {
      worktreeOnly: true,
    });
  if (workspace.agent !== undefined)
    await configureDeclaredAgentAuthorship(worktree, workspace.agent);
  let tip = start;
  for (const revision of workspace.revisions) {
    tip = await commitDeclaredRevision(
      worktree,
      revision,
      workspace.checkoutIdentity ?? checkoutIdentity,
      declaredParents(revision, commits),
    );
    await tagRevision(worktree, revision);
    commits.set(revision.name, tip);
  }
  writeLocalState(
    worktree,
    /** @type {WorkspaceWithLocalState} */ (workspace).local,
  );
  return tip;
}

/**
 * Every described workspace as a worktree of `integration`. The first uses
 * `execution`; further ones are linked under `.worktrees/<branch basename>`.
 * Revisions are committed there and never pushed; a declared `agent` is
 * applied through the real configureAgentAuthorship before those revisions.
 * Answers the first workspace's tip as `candidateSha`, or `undefined` when
 * none are declared.
 * @param {{ integration: string, execution: string }} paths
 * @param {RepositoryDescription} description
 * @param {Map<string, string>} commits
 * @param {GitPerson} checkoutIdentity
 */
export async function materializeDescribedWorkspaces(
  { integration, execution },
  description,
  commits,
  checkoutIdentity,
) {
  const workspaces = describedWorkspaces(description);
  if (workspaces.length === 0) return undefined;

  let candidateSha;
  for (const [index, workspace] of workspaces.entries()) {
    const worktree =
      index === 0
        ? execution
        : join(integration, ".worktrees", basename(workspace.branch));
    const tip = await materializeWorkspace(
      integration,
      worktree,
      workspace,
      commits,
      checkoutIdentity,
    );
    if (index === 0) candidateSha = tip;
  }
  return candidateSha;
}
