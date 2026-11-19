// @ts-check
// A description's execution workspace: branch, starting trunk revision,
// optional agent authorship and checkout identity, and ordered unpublished
// revisions. Builder methods stay on RepositoryBuilder; the workspace facts,
// checks and assembly live here.
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
 * @template {string} Name
 * @param {WorkspaceFacts<Name> | undefined} existing
 * @param {string} branch
 * @param {{ from: Name, checkoutIdentity?: GitPerson, agent?: string }} facts
 * @returns {WorkspaceFacts<Name>}
 */
export function declareWorkspace(existing, branch, facts) {
  if (existing)
    throw new Error(`The repository already has workspace ${existing.branch}`);
  return { ...facts, branch };
}

/**
 * @template {string} Name
 * @template {string} NewName
 * @param {WorkspaceFacts<Name> | undefined} workspace
 * @param {NewName} name
 * @param {readonly RepositoryRevision[]} revisions
 * @param {readonly RepositoryRevision[]} unpublished
 * @param {RevisionFacts} [facts]
 * @returns {NamedRevision<Name | NewName>[]}
 */
export function declareUnpublishedRevision(
  workspace,
  name,
  revisions,
  unpublished,
  facts = {},
) {
  if (!workspace)
    throw new Error(
      `Unpublished revision ${name} needs a workspace: call withWorkspace first`,
    );
  const known = [...revisions, ...unpublished];
  assertNewRevisionName(name, known);
  assertKnownParents(name, facts, known);
  return /** @type {NamedRevision<Name | NewName>[]} */ ([
    ...unpublished,
    { ...facts, name },
  ]);
}

/**
 * @template {string} Name
 * @param {WorkspaceFacts<Name> | undefined} workspace
 * @param {readonly RepositoryRevision[]} revisions
 */
export function assertWorkspaceFromKnownTrunk(workspace, revisions) {
  if (
    workspace &&
    !revisions.some((revision) => revision.name === workspace.from)
  )
    throw new Error(
      `Workspace ${workspace.branch} starts from unknown trunk revision ${workspace.from}`,
    );
}

/**
 * @template {string} Name
 * @param {WorkspaceFacts<Name> | undefined} workspace
 * @param {readonly RepositoryRevision[]} unpublished
 * @returns {RepositoryWorkspace<Name> | undefined}
 */
export function workspaceWithRevisions(workspace, unpublished) {
  if (!workspace) return undefined;
  return /** @type {RepositoryWorkspace<Name>} */ (
    /** @type {unknown} */ ({
      ...workspace,
      revisions: unpublished.map((revision) => ({ ...revision })),
    })
  );
}
