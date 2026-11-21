// @ts-check
// Builders of the story review's answers (dashboard/src/storyReviewContract.ts):
// a taken story's snapshot, a completed story's published comparison, an ad
// hoc landing's or a captured run's landed comparison, a Default main
// session's commits, a landing gap, a commit range and a file's printed diff. Node-free, so
// pageMakeMe.mjs exposes them to mounted cases.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").StoryReview} StoryReview */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").TakenStoryReview} TakenStoryReview */
/** @typedef {TakenStoryReview["files"][number]} ReviewedFile */
/** @typedef {import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice} ReviewRunChoice */
import { ReviewedFileDiffBuilder } from "./reviewedFileDiffTestData.mjs";
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
  #explanation = "";
  /** @type {ReviewRunChoice[] | undefined} */
  #runs;
  /** @type {ReviewRunChoice | undefined} */
  #selected;
  /** @type {ReviewedFile[] | undefined} */
  #committed;

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

  /** @param {string} path a file the comparison changes by one line */
  modifying(path) {
    this.#files.push({
      kind: "modified",
      path,
      lines: { added: 1, removed: 1 },
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

  /** @param {string} explanation a landing gap's words, with no comparison */
  landingGap(explanation) {
    this.#kind = "landing-unavailable";
    this.#explanation = explanation;
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
      return { kind: "landing-unavailable", explanation: this.#explanation };
    if (this.#kind === "session-commits")
      return {
        kind: "session-commits",
        session: {
          launchedAt: "2026-01-02T12:00:00.000Z",
          doneAt: "2026-01-02T13:00:00.000Z",
        },
        commitRuns: [
          {
            commits: 1,
            subject: "session commit",
            committedAt: "2026-01-02T12:30:00.000Z",
            baseline,
            tree,
          },
        ],
        commitRun: 0,
        baseline,
        tree,
        files,
      };
    if (this.#kind === "published")
      return {
        kind: "published",
        completion: storyReviewIds.completion,
        completedAt: "2026-01-01T00:00:00.000Z",
        agent: "claude",
        remote: "origin",
        target: "main",
        baseline,
        tree,
        files,
      };
    if (this.#kind === "landed")
      return {
        kind: "landed",
        landing: {
          reference: "74800000-0000-4000-8000-000000000001",
          delivery: "74800000-0000-4000-8000-000000000002",
          receipt: "74800000-0000-4000-8000-000000000003",
          base: baseline,
          revision: tree,
          receivedAt: "2026-01-02T13:00:00.000Z",
          remote: "origin",
          target: "refs/heads/main",
          workflow: run?.workflow ?? "ad-hoc",
          launchedAt: run?.launchedAt ?? "2026-01-02T12:00:00.000Z",
        },
        baseline,
        tree,
        files,
      };
    return takenSnapshot({ baseline, tree, files, committed: this.#committed });
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
