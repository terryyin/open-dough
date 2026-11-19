// @ts-check
// A description's execution workspaces: each branch, starting trunk revision,
// optional agent authorship and checkout identity, and ordered unpublished
// revisions. Builder methods stay on RepositoryBuilder; the workspace facts,
// checks and assembly live here. One workspace is the usual case; several
// appear when a case needs agent-authored worktrees beside the story's.
import {
  assertKnownParents,
  assertNewRevisionName,
} from "./repository-revision-facts.mjs";

/** @typedef {import("./repositoryTestData.mjs").GitPerson} GitPerson */
/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {import("./repositoryTestData.mjs").RepositoryRevision} RepositoryRevision */
/**
 * @template {string} Name
 * @typedef {import("./repositoryTestData.mjs").NamedRevision<Name>} NamedRevision
 */

/**
 * The execution workspace: a branch that starts from a named trunk revision
 * and holds ordered revisions the origin does not have. Its `agent`, when
 * stated, is the roster agent whose real per-worktree authorship the
 * materializer applies; `checkoutIdentity` remains the committer only.
 * @template {string} [Name=string]
 * @typedef {{
 *   branch: string,
 *   from: Name,
 *   checkoutIdentity?: GitPerson,
 *   agent?: string,
 *   revisions: readonly NamedRevision<Name>[],
 * }} RepositoryWorkspace
 */

/**
 * Workspace facts before unpublished revisions are attached at `please()`.
 * @template {string} [Name=string]
 * @typedef {Omit<RepositoryWorkspace<Name>, "revisions">} WorkspaceFacts
 */

/**
 * Builder-side workspace while unpublished revisions accumulate on the latest.
 * @template {string} [Name=string]
 * @typedef {WorkspaceFacts<Name> & {
 *   unpublished: NamedRevision<Name>[],
 * }} WorkspaceInProgress
 */

/**
 * @template {string} Name
 * @param {readonly WorkspaceInProgress<Name>[] | undefined} existing
 * @param {string} branch
 * @param {{ from: Name, checkoutIdentity?: GitPerson, agent?: string }} facts
 * @returns {WorkspaceInProgress<Name>[]}
 */
export function declareWorkspace(existing, branch, facts) {
  const workspaces = existing ?? [];
  if (workspaces.some((workspace) => workspace.branch === branch))
    throw new Error(`The repository already has workspace ${branch}`);
  return [...workspaces, { ...facts, branch, unpublished: [] }];
}

/**
 * @template {string} Name
 * @template {string} NewName
 * @param {readonly WorkspaceInProgress<Name>[] | undefined} workspaces
 * @param {NewName} name
 * @param {readonly RepositoryRevision[]} revisions
 * @param {RevisionFacts} [facts]
 * @returns {WorkspaceInProgress<Name | NewName>[]}
 */
export function declareUnpublishedRevision(
  workspaces,
  name,
  revisions,
  facts = {},
) {
  if (!workspaces?.length)
    throw new Error(
      `Unpublished revision ${name} needs a workspace: call withWorkspace first`,
    );
  const known = [
    ...revisions,
    ...workspaces.flatMap((workspace) => workspace.unpublished),
  ];
  assertNewRevisionName(name, known);
  assertKnownParents(name, facts, known);
  const last = workspaces.length - 1;
  return /** @type {WorkspaceInProgress<Name | NewName>[]} */ (
    workspaces.map((workspace, index) =>
      index === last
        ? {
            ...workspace,
            unpublished: [...workspace.unpublished, { ...facts, name }],
          }
        : workspace,
    )
  );
}

/**
 * @template {string} Name
 * @param {readonly WorkspaceInProgress<Name>[] | undefined} workspaces
 * @param {readonly RepositoryRevision[]} revisions
 */
export function assertWorkspacesFromKnownTrunk(workspaces, revisions) {
  for (const workspace of workspaces ?? [])
    if (!revisions.some((revision) => revision.name === workspace.from))
      throw new Error(
        `Workspace ${workspace.branch} starts from unknown trunk revision ${workspace.from}`,
      );
}

/**
 * @template {string} Name
 * @param {readonly WorkspaceInProgress<Name>[] | undefined} workspaces
 * @returns {RepositoryWorkspace<Name>[] | undefined}
 */
export function workspacesWithRevisions(workspaces) {
  if (!workspaces?.length) return undefined;
  return /** @type {RepositoryWorkspace<Name>[]} */ (
    workspaces.map(({ unpublished, ...facts }) => ({
      ...facts,
      revisions: unpublished.map((revision) => ({ ...revision })),
    }))
  );
}

/**
 * Every workspace a completed description holds: the singular `workspace` or
 * the `workspaces` list when several were declared.
 * @param {{ workspace?: RepositoryWorkspace, workspaces?: readonly RepositoryWorkspace[] }} description
 * @returns {readonly RepositoryWorkspace[]}
 */
export function describedWorkspaces(description) {
  if (description.workspaces) return description.workspaces;
  if (description.workspace) return [description.workspace];
  return [];
}
