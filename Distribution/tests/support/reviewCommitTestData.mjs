// @ts-check
// A Taken story's commit as Review changes lists it
// (`../../../dashboard/src/storyReviewContract.ts`): the story's n-th commit,
// oldest first, reaching its own tree from the tree of the commit before it;
// and the story's uncommitted changes, reaching the worktree's tree from its
// newest commit's.

/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewItem} ReviewItem */
/** @typedef {Extract<ReviewItem, { kind: "commit" }>} ReviewCommit */
/** @typedef {Extract<ReviewItem, { kind: "uncommitted" }>} ReviewUncommitted */

const oid = (/** @type {number} */ n) => n.toString(16).padStart(40, "0");

export class ReviewCommitBuilder {
  /** @type {number} */
  #position = 1;
  /** @type {string} */
  #subject = "story change";

  /**
   * The story's `position`-th commit, oldest first.
   * @param {number} position
   * @param {string} subject
   */
  numbered(position, subject) {
    this.#position = position;
    this.#subject = subject;
    return this;
  }

  /** @returns {ReviewCommit} */
  please() {
    const n = this.#position;
    return {
      kind: "commit",
      revision: oid(0x100 + n),
      shortRevision: `c${n}c${n}c${n}c`,
      subject: this.#subject,
      committedAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
      merge: false,
      tree: oid(0x200 + n),
      baseline: oid(1),
      fromTree: oid(0x200 + n - 1),
      fromBaseline: oid(1),
    };
  }
}

export class UncommittedReviewItemBuilder {
  /** @type {string} */
  #fromTree = oid(1);

  /**
   * Uncommitted changes over the story's newest commit.
   * @param {ReviewCommit} newest
   */
  after(newest) {
    this.#fromTree = newest.tree;
    return this;
  }

  /** @returns {ReviewUncommitted} */
  please() {
    return {
      kind: "uncommitted",
      tree: oid(0x300),
      baseline: oid(1),
      fromTree: this.#fromTree,
      fromBaseline: oid(1),
    };
  }
}

/**
 * @typedef {object} ReviewCommitMakeMe
 * @property {ReviewCommitBuilder} aReviewCommit
 * @property {UncommittedReviewItemBuilder} anUncommittedReviewItem
 */

/** @returns {PropertyDescriptorMap} */
export function reviewCommitMakeMeProperties() {
  return {
    aReviewCommit: {
      enumerable: true,
      get() {
        return new ReviewCommitBuilder();
      },
    },
    anUncommittedReviewItem: {
      enumerable: true,
      get() {
        return new UncommittedReviewItemBuilder();
      },
    },
  };
}
