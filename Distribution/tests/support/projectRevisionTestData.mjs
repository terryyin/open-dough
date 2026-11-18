// @ts-check
// MakeMe carries the project revision the authenticated-read reuse
// boundaries publish. Tests name the label and the facts they prove;
// incidental records stay with the published shape.

import {
  projectBacklog,
  projectDoneRecord,
  projectNewSeedEntry,
  projectNewSeedText,
  projectRevisionLayout,
  projectSeedText,
  publishedProjectFiles,
} from "./projectRevisionRecords.mjs";

/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} BacklogEntry */
/**
 * @typedef {typeof projectRevisionLayout & {
 *   files: Readonly<Record<string, string>>,
 * }} ProjectRevision
 */

export class ProjectRevisionBuilder {
  /** @type {string | undefined} */
  #label;
  /** @type {RevisionFacts | undefined} */
  #facts;

  /**
   * @param {string | undefined} [label]
   * @param {RevisionFacts | undefined} [facts]
   */
  constructor(label = undefined, facts = undefined) {
    this.#label = label;
    this.#facts = facts;
  }

  /**
   * Paths of the published project, the same on every revision.
   * @returns {typeof projectRevisionLayout}
   */
  get paths() {
    return projectRevisionLayout;
  }

  /** @returns {string} */
  #requireLabel() {
    if (this.#label === undefined)
      throw new Error("Name the project revision with labeled().");
    return this.#label;
  }

  /**
   * Titles, seed prose, settings, and the done record name `label`.
   * @param {string} label
   */
  labeled(label) {
    return new ProjectRevisionBuilder(label, this.#facts);
  }

  /**
   * Facts a later revision changes on this labeled project.
   * @param {RevisionFacts} facts
   */
  with(facts) {
    return new ProjectRevisionBuilder(this.#label, facts);
  }

  /**
   * The backlog this label publishes, with `extra` queued after the other story.
   * @param {BacklogEntry} [extra]
   */
  backlogNaming(extra) {
    return projectBacklog(this.#requireLabel(), extra);
  }

  /**
   * A done record titled for `label`, or for this revision's label.
   * @param {string} identity
   * @param {string} [label]
   */
  doneRecord(identity, label = this.#requireLabel()) {
    return projectDoneRecord(identity, label);
  }

  /** @returns {BacklogEntry} */
  get newSeedEntry() {
    return projectNewSeedEntry();
  }

  /** The seed at `newSeed` named by {@link newSeedEntry}. */
  get newSeedText() {
    return projectNewSeedText();
  }

  /**
   * The reused story's seed as a revision for `label` publishes it.
   * @param {string} label
   */
  seedText(label) {
    return projectSeedText(label);
  }

  /** @returns {ProjectRevision} */
  please() {
    return {
      files: publishedProjectFiles(this.#requireLabel(), this.#facts),
      ...projectRevisionLayout,
    };
  }
}

/**
 * @typedef {object} ProjectRevisionMakeMe
 * @property {ProjectRevisionBuilder} aProjectRevision
 */

/** @returns {PropertyDescriptorMap} */
export function projectRevisionMakeMeProperties() {
  return {
    aProjectRevision: {
      enumerable: true,
      get() {
        return new ProjectRevisionBuilder();
      },
    },
  };
}
