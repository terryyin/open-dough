// @ts-check
// Builders of the story review's answers (dashboard/src/storyReviewContract.ts):
// a taken story's snapshot (./storyReviewSnapshotTestData.mjs), a completed
// comparison (./storyReviewCompletedTestData.mjs), a review gap, a commit
// range, a captured run and a file's printed diff. Node-free, so
// pageMakeMe.mjs exposes them to mounted cases.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").StoryReview} StoryReview */
/** @typedef {Pick<Extract<StoryReview, { kind: "landing-unavailable" }>, "explanation" | "comparison">} ReviewGap */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").TakenStoryReview} TakenStoryReview */
/** @typedef {TakenStoryReview["files"][number]} ReviewedFile */
/** @typedef {import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice} ReviewRunChoice */
import { ReviewedFileDiffBuilder } from "./reviewedFileDiffTestData.mjs";
import {
  landedComparison,
  publishedComparison,
  sessionCommits,
} from "./storyReviewCompletedTestData.mjs";
import { ReviewRunBuilder } from "./storyReviewRunTestData.mjs";
import {
  commitRange,
  storyReviewIds,
  takenSnapshot,
} from "./storyReviewSnapshotTestData.mjs";

export class StoryReviewBuilder {
  /** @type {ReviewedFile[]} */
  #files = [];
  /** @type {"snapshot" | "published" | "landed" | "session-commits" | "landing-unavailable"} */
  #kind = "snapshot";
  /** @type {ReviewGap} */
  #gap = { explanation: "" };
  /** @type {ReviewRunChoice[] | undefined} */
  #runs;
  /** @type {ReviewRunChoice | undefined} */
  #selected;
  /** @type {ReviewedFile[] | undefined} */
  #committed;
  /** @type {number | undefined} */
  #publishedKept;

  /**
   * @param {string} path a file the comparison adds
   * @param {number} lines how many lines long
   */
  adding(path, lines = 1) {
    this.#files.push({
      kind: "added",
      path,
      lines: { added: lines, removed: 0 },
    });
    return this;
  }

  /**
   * A snapshot whose committed part, `committed`'s files, can be told from
   * its uncommitted changes, so the uncommitted check is offered.
   * @param {StoryReviewBuilder} committed
   */
  committedAs(committed) {
    this.#committed = committed.#files;
    return this;
  }

  /**
   * A Trunk Mode snapshot whose agent published `commits` on trunk that this
   * machine's Git could not take out of its baseline.
   * @param {number} commits
   */
  keepingPublishedCommits(commits) {
    this.#publishedKept = commits;
    return this;
  }

  /** @param {string} path a file the comparison changes by one line */
  modifying(path) {
    this.#files.push({
      kind: "modified",
      path,
      lines: { added: 1, removed: 1 },
    });
    return this;
  }

  /**
   * @param {string} oldPath the file's path before the comparison
   * @param {string} path its path after, changed by one line
   */
  renaming(oldPath, path) {
    this.#files.push({
      kind: "renamed",
      path,
      oldPath,
      lines: { added: 1, removed: 0 },
    });
    return this;
  }

  // A completed story's published comparison.
  published() {
    this.#kind = "published";
    return this;
  }

  // An ad hoc session's landed comparison.
  landed() {
    this.#kind = "landed";
    return this;
  }

  // A Default main session's commits: one kept run.
  sessionCommits() {
    this.#kind = "session-commits";
    return this;
  }

  /** @param {string} explanation why the landed run cannot be reviewed */
  landingGap(explanation) {
    this.#kind = "landing-unavailable";
    this.#gap = { explanation };
    return this;
  }

  /** @param {string} explanation why the published session cannot be reviewed */
  publishedSessionGap(explanation) {
    this.#kind = "landing-unavailable";
    this.#gap = { explanation, comparison: "published-session" };
    return this;
  }

  /**
   * Offers `runs`, selecting `selected`; a landed comparison is that run's.
   * @param {ReviewRunChoice} selected
   * @param {readonly ReviewRunChoice[]} runs
   */
  onRun(selected, runs = [selected]) {
    this.#selected = selected;
    this.#runs = [...runs];
    return this;
  }

  /**
   * The range read of the snapshot's commit, holding this review's files.
   * @returns {import("../../../dashboard/src/storyReviewContract.ts").ReviewRange}
   */
  pleaseRange() {
    return commitRange(this.#files);
  }

  /** @returns {StoryReview} */
  please() {
    const review = this.#comparison();
    if (!this.#selected) return review;
    return {
      ...review,
      runs: structuredClone(this.#runs),
      selectedRun: this.#selected.key,
    };
  }

  /** @returns {StoryReview} */
  #comparison() {
    const run = this.#selected;
    const baseline = run?.comparison?.base ?? storyReviewIds.baseline;
    const tree = run?.comparison?.revision ?? storyReviewIds.tree;
    const files = structuredClone(this.#files);
    if (this.#kind === "landing-unavailable")
      return { kind: "landing-unavailable", ...this.#gap };
    if (this.#kind === "session-commits")
      return sessionCommits({ baseline, tree, files });
    if (this.#kind === "published")
      return publishedComparison({ baseline, tree, files });
    if (this.#kind === "landed")
      return landedComparison({ baseline, tree, files, run });
    const snapshot = takenSnapshot({
      baseline,
      tree,
      files,
      committed: this.#committed,
    });
    if (this.#publishedKept === undefined) return snapshot;
    return {
      ...snapshot,
      published: {
        trunk: baseline,
        commits: this.#publishedKept,
        kept: "not-restated",
      },
    };
  }
}

/**
 * @typedef {object} StoryReviewMakeMe
 * @property {StoryReviewBuilder} aStoryReview
 * @property {ReviewedFileDiffBuilder} aReviewedFileDiff
 * @property {ReviewRunBuilder} aReviewRun
 */

/** @returns {PropertyDescriptorMap} */
export function storyReviewMakeMeProperties() {
  return {
    aStoryReview: {
      enumerable: true,
      get() {
        return new StoryReviewBuilder();
      },
    },
    aReviewedFileDiff: {
      enumerable: true,
      get() {
        return new ReviewedFileDiffBuilder();
      },
    },
    aReviewRun: {
      enumerable: true,
      get() {
        return new ReviewRunBuilder();
      },
    },
  };
}
