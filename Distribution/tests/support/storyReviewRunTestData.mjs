// @ts-check
// Builder of a story review's captured run choice
// (dashboard/src/storyReviewLandedRun.ts): a refinement launched on a day,
// delivered to origin/main, comparing its captured base and accepted revision.
// Node-free, so pageMakeMe.mjs exposes it through storyReviewTestData.mjs.
/** @typedef {import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice} ReviewRunChoice */

export class ReviewRunBuilder {
  #key = "captured-run";
  #launchedAt = "2026-01-02T12:00:00.000Z";
  /** @type {ReviewRunChoice["comparison"]} */
  #comparison;

  /** @param {string} key */
  keyed(key) {
    this.#key = key;
    return this;
  }

  /** @param {string} at an ISO time */
  launchedAt(at) {
    this.#launchedAt = at;
    return this;
  }

  /**
   * @param {string} base the captured base revision
   * @param {string} revision the accepted revision
   */
  comparing(base, revision) {
    this.#comparison = { base, revision };
    return this;
  }

  /** @returns {ReviewRunChoice} */
  please() {
    return {
      key: this.#key,
      workflow: "refinement",
      launchedAt: this.#launchedAt,
      remote: "origin",
      target: "refs/heads/main",
      ...(this.#comparison ? { comparison: { ...this.#comparison } } : {}),
    };
  }
}
