// @ts-check
// Builder of a reviewed file's printed diff
// (dashboard/src/storyReviewContract.ts): one file whose given lines are all
// added. Node-free, so pageMakeMe.mjs exposes it through storyReviewTestData.mjs.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewedFileDiff} ReviewedFileDiff */

export class ReviewedFileDiffBuilder {
  #path = "story.txt";
  /** @type {string[]} */
  #lines = ["+story"];

  /**
   * @param {string} path
   * @param {...string} lines each printed added
   */
  adding(path, ...lines) {
    this.#path = path;
    this.#lines = lines.map((line) =>
      line.startsWith("+") ? line : `+${line}`,
    );
    return this;
  }

  /** @returns {ReviewedFileDiff} */
  please() {
    const path = this.#path;
    return {
      kind: "diff",
      printed: [
        `diff --git a/${path} b/${path}`,
        `--- a/${path}`,
        `+++ b/${path}`,
        `@@ -0,0 +1,${this.#lines.length} @@`,
        ...this.#lines,
        "",
      ].join("\n"),
    };
  }
}
