// @ts-check
import {
  assertKnownParents,
  assertNewRevisionName,
  assertOneBacklogFact,
  statesBacklog,
} from "./repository-revision-facts.mjs";
import {
  assertWorkspacesFromKnownTrunk,
  declareUnpublishedRevision,
  declareWorkspace,
  workspacesWithRevisions,
} from "./repository-workspace.mjs";
import { integrationDeveloper } from "./repository-revision-commit.mjs";
export { backlogPath } from "./repository-revision-facts.mjs";
export { describedWorkspaces } from "./repository-workspace.mjs";

/** @typedef {Parameters<typeof import("./published-backlog.mjs").renderPublishedBacklog>[0]} Backlog */
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs").renderAgentProfile>[0]} AgentProfile */
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs").renderDoneRecord>[0]} DoneRecord */
/** @typedef {{ name: string, email: string, date?: string }} GitPerson */
/** @typedef {import("./releaseTestData.mjs").Release} Release */
/**
 * @template {string} [Name=string]
 * @typedef {import("./repository-workspace.mjs").RepositoryWorkspace<Name>} RepositoryWorkspace
 */
/**
 * @template {string} [Name=string]
 * @typedef {import("./repository-workspace.mjs").WorkspaceFacts<Name>} WorkspaceFacts
 */

/**
 * @typedef {{
 *   identity: string,
 *   href: string,
 *   refinement: "not-refined" | "refined",
 *   approach: "unselected" | "planless" | "planned",
 *   plan?: string,
 *   assessment?: "ready" | "not-ready",
 *   reasons?: readonly string[],
 * }} StoryState
 */

/**
 * @typedef {{
 *   backlog?: Backlog | null,
 *   release?: Release,
 *   tags?: readonly string[],
 *   files?: Readonly<Record<string, string | Buffer>>,
 *   executables?: readonly string[],
 *   storyStates?: readonly StoryState[],
 *   agentProfiles?: readonly AgentProfile[],
 *   doneRecords?: readonly DoneRecord[],
 *   remove?: readonly string[],
 *   parents?: readonly string[],
 *   message?: string,
 *   author?: GitPerson,
 *   committer?: GitPerson,
 *   fetched?: false,
 * }} RevisionFacts
 * @typedef {RevisionFacts & { name: string }} RepositoryRevision
 */

/**
 * @template {string} Name
 * @typedef {RepositoryRevision & { name: Name }} NamedRevision
 */

/**
 * @template {string} [Name=string]
 * @typedef {{
 *   trunkBranch?: string,
 *   checkoutIdentity?: GitPerson,
 *   revisions: readonly [NamedRevision<Name>, ...NamedRevision<Name>[]],
 *   workspace?: RepositoryWorkspace<Name>,
 *   workspaces?: readonly RepositoryWorkspace<Name>[],
 * }} RepositoryDescription
 */

/**
 * @template {string} [Name=string]
 * @typedef {import("./repository-workspace.mjs").WorkspaceInProgress<Name>} WorkspaceInProgress
 */

/**
 * @template {string} Name
 * @typedef {{
 *   trunkBranch?: string,
 *   checkoutIdentity?: GitPerson,
 *   workspaces?: WorkspaceInProgress<Name>[],
 * }} RepositoryFacts
 */

/** @template {string} [Name=never] */
export class RepositoryBuilder {
  /** @type {readonly NamedRevision<Name>[]} */
  #revisions;
  /** @type {RepositoryFacts<Name>} */
  #facts;

  /**
   * @param {readonly NamedRevision<Name>[]} [revisions]
   * @param {RepositoryFacts<Name>} [facts]
   */
  constructor(revisions = [], facts = {}) {
    this.#revisions = revisions;
    this.#facts = facts;
  }

  /**
   * A named commit's changes, in publication order. The first commit has
   * an empty backlog unless the description supplies its membership or bytes,
   * or states `backlog: null` for a trunk without one. Explicit `parents`
   * name earlier published revisions; the tree inherits the first parent
   * and applies the declared facts, without inventing merge resolutions.
   * A revision states its backlog once: as `backlog` or as bytes at `.planning/PRODUCT-BACKLOG.md`.
   * A revision with a `release` is tagged `v<version>`, and `tags` names
   * further lightweight tags on it; `files` it states override the release's.
   * @template {string} NewName
   * @param {NewName} name
   * @param {RevisionFacts} [facts]
   * @returns {RepositoryBuilder<Name | NewName>}
   */
  withRevision(name, facts = {}) {
    const unpublished = (this.#facts.workspaces ?? []).flatMap(
      (workspace) => workspace.unpublished,
    );
    assertNewRevisionName(name, [...this.#revisions, ...unpublished]);
    assertKnownParents(name, facts, this.#revisions);
    /** @type {NamedRevision<Name | NewName>[]} */
    const revisions = [...this.#revisions, { ...facts, name }];
    return new RepositoryBuilder(revisions, this.#facts);
  }

  /**
   * The shared `base` revision, holding `files`, committed at a fixed date
   * that predates every launch a dated case states.
   * @param {Readonly<Record<string, string>>} [files]
   */
  withBaseBeforeEveryLaunch(files) {
    return this.withRevision("base", {
      ...(files !== undefined && { files }),
      backlog: null,
      committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
    });
  }

  /**
   * The branch the origin and the integration checkout publish. Default `main`.
   * @param {string} trunkBranch
   * @returns {RepositoryBuilder<Name>}
   */
  withTrunkBranch(trunkBranch) {
    return new RepositoryBuilder(this.#revisions, {
      ...this.#facts,
      trunkBranch,
    });
  }

  /**
   * The integration checkout's configured developer (`user.name` and
   * `user.email`), and the default author and committer of every revision.
   * Default: the fixed integration developer.
   * @param {GitPerson} checkoutIdentity
   * @returns {RepositoryBuilder<Name>}
   */
  withCheckoutIdentity(checkoutIdentity) {
    return new RepositoryBuilder(this.#revisions, {
      ...this.#facts,
      checkoutIdentity,
    });
  }

  /**
   * An execution workspace on `branch`, starting from the named trunk
   * revision. Further `withWorkspace` calls declare additional workspaces;
   * each later `withUnpublishedRevision` attaches to the latest. Its
   * `checkoutIdentity`, when stated, is the committer Git configures for
   * that worktree only and the default committer of its revisions; the
   * integration checkout keeps its own identity. Its `agent`, when stated,
   * is materialized through the real `configureAgentAuthorship`
   * (per-worktree `author.*`), not as `checkoutIdentity`.
   * @param {string} branch
   * @param {{ from: Name, checkoutIdentity?: GitPerson, agent?: string }} facts
   * @returns {RepositoryBuilder<Name>}
   */
  withWorkspace(branch, facts) {
    return new RepositoryBuilder(this.#revisions, {
      ...this.#facts,
      workspaces: declareWorkspace(this.#facts.workspaces, branch, facts),
    });
  }

  /**
   * A named workspace commit the origin does not have, in commit order on
   * the latest workspace. It states the same facts as a trunk revision.
   * @template {string} NewName
   * @param {NewName} name
   * @param {RevisionFacts} [facts]
   * @returns {RepositoryBuilder<Name | NewName>}
   */
  withUnpublishedRevision(name, facts = {}) {
    return new RepositoryBuilder(this.#revisions, {
      ...this.#facts,
      workspaces: declareUnpublishedRevision(
        this.#facts.workspaces,
        name,
        this.#revisions,
        facts,
      ),
    });
  }

  /** @returns {RepositoryDescription<[Name] extends [never] ? "base" : Name>} */
  please() {
    const [first = { name: "base" }, ...later] = this.#revisions;
    const { workspaces, ...facts } = this.#facts;
    assertWorkspacesFromKnownTrunk(workspaces, this.#revisions);
    for (const revision of [
      ...this.#revisions,
      ...(workspaces ?? []).flatMap((workspace) => workspace.unpublished),
    ])
      assertOneBacklogFact(revision);
    const resolved = workspacesWithRevisions(workspaces);
    /** @type {RepositoryDescription<Name | "base">} */
    const result = {
      ...facts,
      revisions: [
        statesBacklog(first) ? first : { backlog: {}, ...first },
        ...later,
      ],
    };
    const [only] = resolved ?? [];
    if (resolved?.length === 1 && only) result.workspace = only;
    else if (resolved && resolved.length > 1) result.workspaces = resolved;
    return /** @type {RepositoryDescription<[Name] extends [never] ? "base" : Name>} */ (
      result
    );
  }
}
