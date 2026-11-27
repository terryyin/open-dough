// @ts-check
// Shared builder for published comparisons, sessions and evidence gaps.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").StoryReview} StoryReview */
/** @typedef {Pick<Extract<StoryReview, { kind: "landing-unavailable" }>, "explanation" | "comparison">} ReviewGap */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewedFile} ReviewedFile */
/** @typedef {import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice} ReviewRunChoice */
import {
  landedComparison,
  publishedComparison,
  publishedSessionComparison,
  storyReviewIds,
} from "./storyReviewCompletedTestData.mjs";
export class StoryReviewBuilder {
  /** @type {ReviewedFile[]} */
  #files = [];
  /** @type {"published-taken" | "published" | "landed" | "published-session" | "landing-unavailable" | "unavailable"} */
  #kind = "published-taken";
  /** @type {ReviewGap} */
  #gap = { explanation: "" };
  /** @type {ReviewRunChoice[] | undefined} */
  #runs;
  /** @type {ReviewRunChoice | undefined} */
  #selected;
  /** @type {string | undefined} */
  #completion;
  #agent = "claude";
  /** @type {{ ranges?: number, selectedRun?: string, shared?: true }} */
  #session = {};
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

  /** @param {string} path a file the comparison deletes */
  deleting(path) {
    this.#files.push({
      kind: "deleted",
      path,
      lines: { added: 0, removed: 1 },
    });
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

  // A completed story's published comparison; given its `completion`, the
  // trunk revision that completion landed.
  /** @param {string} [completion] */
  published(completion) {
    this.#kind = "published";
    this.#completion = completion;
    return this;
  }

  // An ad hoc session's landed comparison.
  landed() {
    this.#kind = "landed";
    return this;
  }

  /**
   * A session's published comparison: when given, range `position` (from 1)
   * of the record's `ranges`, and whether that range shared its checkout.
   * @param {{ range?: { position: number, of: number }, shared?: true }} [recorded]
   */
  publishedSession(recorded = {}) {
    this.#kind = "published-session";
    this.#session = {
      ...(recorded.range === undefined
        ? {}
        : {
            ranges: recorded.range.of,
            selectedRun: String(recorded.range.position - 1),
          }),
      ...(recorded.shared === undefined ? {} : { shared: recorded.shared }),
    };
    return this;
  }

  /** @param {string} explanation why the landed run cannot be reviewed */
  landingGap(explanation) {
    this.#kind = "landing-unavailable";
    this.#gap = { explanation };
    return this;
  }

  /** @param {string} explanation why this machine cannot read the review */
  unavailable(explanation) {
    this.#kind = "unavailable";
    this.#gap = { explanation };
    return this;
  }

  /** @param {string} explanation why the published session cannot be reviewed */
  publishedSessionGap(explanation) {
    this.#kind = "landing-unavailable";
    this.#gap = { explanation, comparison: "published-session" };
    return this;
  }

  /** @param {string} agent the agent a published comparison records */
  by(agent) {
    this.#agent = agent;
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

  /** @param {{ from: string, changes: StoryReviewBuilder }} [withMerged] @returns {StoryReview} */
  please(withMerged) {
    const review = this.#comparison(
      withMerged?.from,
      withMerged === undefined ? undefined : withMerged.changes.#files,
    );
    if (!this.#selected) return review;
    return {
      ...review,
      runs: structuredClone(this.#runs),
      selectedRun: this.#selected.key,
    };
  }

  /** @param {string} [storyStart] @param {ReviewedFile[]} [widened] @returns {StoryReview} */
  #comparison(storyStart, widened) {
    const run = this.#selected;
    const baseline = run?.comparison?.base ?? storyReviewIds.baseline;
    const tree = run?.comparison?.revision ?? storyReviewIds.tree;
    const files = structuredClone(this.#files);
    if (this.#kind === "landing-unavailable")
      return { kind: "landing-unavailable", ...this.#gap };
    if (this.#kind === "unavailable")
      return { kind: "unavailable", explanation: this.#gap.explanation };
    if (this.#kind === "published-session") {
      const { shared, ...ranges } = this.#session;
      const review = publishedSessionComparison({ baseline, tree, files });
      if (review.kind !== "published-session") return review;
      return {
        ...review,
        ...ranges,
        session: { ...review.session, ...(shared ? { shared } : {}) },
      };
    }
    if (this.#kind === "published")
      return publishedComparison({
        baseline,
        tree,
        files,
        completion: this.#completion,
        agent: this.#agent,
        storyStart,
        widened,
      });
    if (this.#kind === "landed")
      return landedComparison({ baseline, tree, files, run });
    return {
      kind: "published-taken",
      mode: "story-branch",
      head: storyReviewIds.head,
      agent: this.#agent,
      remote: "origin",
      target: "claude/taken",
      baseline,
      tree,
      files,
      ...(storyStart !== undefined && widened !== undefined
        ? { withMerged: { from: storyStart, files: widened } }
        : {}),
    };
  }
}
