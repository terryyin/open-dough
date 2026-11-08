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
 *   backlog?: Backlog,
 *   files?: Readonly<Record<string, string | Buffer>>,
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
 * @template {string} [Name=string]
 * @typedef {{ revisions: readonly [NamedRevision<Name>, ...NamedRevision<Name>[]] }} RepositoryDescription
 */

/**
 * @template {string} Name
 * @typedef {RepositoryRevision & { name: Name }} NamedRevision
 */

/** @template {string} [Name=never] */
export class RepositoryBuilder {
  /** @type {readonly NamedRevision<Name>[]} */
  #revisions;

  /** @param {readonly NamedRevision<Name>[]} [revisions] */
  constructor(revisions = []) {
    this.#revisions = revisions;
  }

  /**
   * A named commit's changes, in publication order. The first commit has
   * an empty backlog unless the description supplies its membership or bytes.
   * @template {string} NewName
   * @param {NewName} name
   * @param {RevisionFacts} [facts]
   * @returns {RepositoryBuilder<Name | NewName>}
   */
  withRevision(name, facts = {}) {
    if (
      this.#revisions.some(
        (revision) => revision.name === /** @type {string} */ (name),
      )
    )
      throw new Error(`Duplicate repository revision: ${name}`);
    /** @type {NamedRevision<Name | NewName>[]} */
    const revisions = [...this.#revisions, { ...facts, name }];
    return new RepositoryBuilder(revisions);
  }

  /** @returns {RepositoryDescription<[Name] extends [never] ? "base" : Name>} */
  please() {
    const [first = { name: "base" }, ...later] = this.#revisions;
    /** @type {RepositoryDescription<Name | "base">} */
    const result = { revisions: [{ backlog: {}, ...first }, ...later] };
    return /** @type {RepositoryDescription<[Name] extends [never] ? "base" : Name>} */ (
      result
    );
  }
}
