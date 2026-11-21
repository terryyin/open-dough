// @ts-check
// Builders of the story review's answers (dashboard/src/storyReviewContract.ts):
// a taken story's snapshot, a completed story's published comparison, an ad
// hoc landing's landed comparison, and a file's printed diff. Node-free, so
// pageMakeMe.mjs exposes them to mounted cases.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").StoryReview} StoryReview */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").TakenStoryReview} TakenStoryReview */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewedFileDiff} ReviewedFileDiff */
/** @typedef {TakenStoryReview["files"][number]} ReviewedFile */

/** @param {number} n */
const oid = (n) => n.toString(16).padStart(40, "0");

const storyReviewIds = Object.freeze({
  baseline: oid(1),
  tree: oid(2),
  head: oid(3),
  commit: oid(4),
  commitTree: oid(5),
  completion: oid(7),
});

export class StoryReviewBuilder {
  /** @type {ReviewedFile[]} */
  #files = [];
  /** @type {"snapshot" | "published" | "landed"} */
  #kind = "snapshot";

  /** @param {string} path a file the comparison adds, one line long */
  adding(path) {
    this.#files.push({ kind: "added", path, lines: { added: 1, removed: 0 } });
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

  /** @returns {StoryReview} */
  please() {
    const { baseline, tree } = storyReviewIds;
    const files = structuredClone(this.#files);
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
          workflow: "ad-hoc",
          launchedAt: "2026-01-02T12:00:00.000Z",
        },
        baseline,
        tree,
        files,
      };
    return {
      kind: "snapshot",
      workspace: "~/git/open-dough/.worktrees/story-review",
      branch: "claude/taken",
      remote: "origin",
      target: "main",
      baseline,
      tree,
      head: storyReviewIds.head,
      files,
      commits: [
        {
          kind: "commit",
          revision: storyReviewIds.commit,
          shortRevision: "aaaaaaa",
          subject: "story file",
          committedAt: "2026-01-01T00:00:00.000Z",
          merge: false,
          tree: storyReviewIds.commitTree,
          baseline,
          fromTree: baseline,
          fromBaseline: baseline,
        },
      ],
    };
  }
}

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

/**
 * @typedef {object} StoryReviewMakeMe
 * @property {StoryReviewBuilder} aStoryReview
 * @property {ReviewedFileDiffBuilder} aReviewedFileDiff
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
  };
}
