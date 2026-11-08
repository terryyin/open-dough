// @ts-check

/** @typedef {Parameters<typeof import("./published-backlog.mjs").renderPublishedBacklog>[0]} Backlog */
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs").renderAgentProfile>[0]} AgentProfile */
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs").renderDoneRecord>[0]} DoneRecord */
/** @typedef {{ name: string, email: string, date?: string }} GitPerson */

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
 *   backlog?: Backlog | undefined,
 *   files?: Readonly<Record<string, string | Buffer>>,
 *   executables?: readonly string[],
 *   storyStates?: readonly StoryState[],
 *   agentProfiles?: readonly AgentProfile[],
 *   doneRecords?: readonly DoneRecord[],
 *   remove?: readonly string[],
 *   message?: string,
 *   author?: GitPerson,
 *   committer?: GitPerson,
 * }} RevisionFacts
 * @typedef {RevisionFacts & { name: string }} RepositoryRevision
 */

/**
 * @template {string} Name
 * @typedef {RepositoryRevision & { name: Name }} NamedRevision
 */

/**
 * The execution workspace: a branch that starts from a named trunk revision
 * and holds ordered revisions the origin does not have.
 * @template {string} [Name=string]
 * @typedef {{
 *   branch: string,
 *   from: Name,
 *   checkoutIdentity?: GitPerson,
 *   revisions: readonly NamedRevision<Name>[],
 * }} RepositoryWorkspace
 */

/**
 * @template {string} [Name=string]
 * @typedef {{
 *   trunkBranch?: string,
 *   checkoutIdentity?: GitPerson,
 *   revisions: readonly [NamedRevision<Name>, ...NamedRevision<Name>[]],
 *   workspace?: RepositoryWorkspace<Name>,
 * }} RepositoryDescription
 */

/**
 * @template {string} Name
 * @typedef {{
 *   trunkBranch?: string,
 *   checkoutIdentity?: GitPerson,
 *   workspace?: Omit<RepositoryWorkspace<Name>, "revisions">,
 * }} RepositoryFacts
 */

/** @template {string} [Name=never] */
export class RepositoryBuilder {
  /** @type {readonly NamedRevision<Name>[]} */
  #revisions;
  /** @type {readonly NamedRevision<Name>[]} */
  #unpublished;
  /** @type {RepositoryFacts<Name>} */
  #facts;

  /**
   * @param {readonly NamedRevision<Name>[]} [revisions]
   * @param {readonly NamedRevision<Name>[]} [unpublished]
   * @param {RepositoryFacts<Name>} [facts]
   */
  constructor(revisions = [], unpublished = [], facts = {}) {
    this.#revisions = revisions;
    this.#unpublished = unpublished;
    this.#facts = facts;
  }

  /** @param {string} name */
  #assertNew(name) {
    if (
      [...this.#revisions, ...this.#unpublished].some(
        (revision) => revision.name === name,
      )
    )
      throw new Error(`Duplicate repository revision: ${name}`);
  }

  /**
   * A named commit's changes, in publication order. The first commit has
   * an empty backlog unless the description supplies its membership or bytes,
   * or states `backlog: undefined` for a trunk without one.
   * @template {string} NewName
   * @param {NewName} name
   * @param {RevisionFacts} [facts]
   * @returns {RepositoryBuilder<Name | NewName>}
   */
  withRevision(name, facts = {}) {
    this.#assertNew(name);
    /** @type {NamedRevision<Name | NewName>[]} */
    const revisions = [...this.#revisions, { ...facts, name }];
    return new RepositoryBuilder(revisions, this.#unpublished, this.#facts);
  }

  /**
   * The branch the origin and the integration checkout publish. Default `main`.
   * @param {string} trunkBranch
   * @returns {RepositoryBuilder<Name>}
   */
  withTrunkBranch(trunkBranch) {
    return new RepositoryBuilder(this.#revisions, this.#unpublished, {
      ...this.#facts,
      trunkBranch,
    });
  }

  /**
   * The checkout's configured developer (`user.name` and `user.email`), and
   * the default author and committer of every revision. Default: the fixed
   * integration developer.
   * @param {GitPerson} checkoutIdentity
   * @returns {RepositoryBuilder<Name>}
   */
  withCheckoutIdentity(checkoutIdentity) {
    return new RepositoryBuilder(this.#revisions, this.#unpublished, {
      ...this.#facts,
      checkoutIdentity,
    });
  }

  /**
   * An execution workspace on `branch`, starting from the named trunk
   * revision. Its `checkoutIdentity`, when stated, is the committer Git
   * configures for that worktree and the default committer of its revisions.
   * @param {string} branch
   * @param {{ from: Name, checkoutIdentity?: GitPerson }} facts
   * @returns {RepositoryBuilder<Name>}
   */
  withWorkspace(branch, facts) {
    if (this.#facts.workspace)
      throw new Error(
        `The repository already has workspace ${this.#facts.workspace.branch}`,
      );
    return new RepositoryBuilder(this.#revisions, this.#unpublished, {
      ...this.#facts,
      workspace: { ...facts, branch },
    });
  }

  /**
   * A named workspace commit the origin does not have, in commit order. It
   * states the same facts as a trunk revision.
   * @template {string} NewName
   * @param {NewName} name
   * @param {RevisionFacts} [facts]
   * @returns {RepositoryBuilder<Name | NewName>}
   */
  withUnpublishedRevision(name, facts = {}) {
    if (!this.#facts.workspace)
      throw new Error(
        `Unpublished revision ${name} needs a workspace: call withWorkspace first`,
      );
    this.#assertNew(name);
    /** @type {NamedRevision<Name | NewName>[]} */
    const unpublished = [...this.#unpublished, { ...facts, name }];
    return new RepositoryBuilder(this.#revisions, unpublished, this.#facts);
  }

  /** @returns {RepositoryDescription<[Name] extends [never] ? "base" : Name>} */
  please() {
    const [first = { name: "base" }, ...later] = this.#revisions;
    const { workspace, ...facts } = this.#facts;
    if (
      workspace &&
      !this.#revisions.some((revision) => revision.name === workspace.from)
    )
      throw new Error(
        `Workspace ${workspace.branch} starts from unknown trunk revision ${workspace.from}`,
      );
    /** @type {RepositoryDescription<Name | "base">} */
    const result = {
      ...facts,
      revisions: [{ backlog: {}, ...first }, ...later],
      ...(workspace && {
        workspace: {
          ...workspace,
          revisions: this.#unpublished.map((revision) => ({ ...revision })),
        },
      }),
    };
    return /** @type {RepositoryDescription<[Name] extends [never] ? "base" : Name>} */ (
      result
    );
  }
}
