// @ts-check
// A taken story's workspace snapshot as the story review answers it
// (dashboard/src/storyReviewContract.ts): its branch, one commit and, when
// its committed part can be told apart, its uncommitted changes; and the
// range read of that commit. Node-free, for ./storyReviewTestData.mjs.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").TakenStoryReview} TakenStoryReview */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewRange} ReviewRange */
/** @typedef {TakenStoryReview["files"][number]} ReviewedFile */

/** @param {number} n */
const oid = (n) => n.toString(16).padStart(40, "0");

export const storyReviewIds = Object.freeze({
  baseline: oid(1),
  tree: oid(2),
  head: oid(3),
  commit: oid(4),
  commitTree: oid(5),
  completion: oid(7),
});

/**
 * @param {{ baseline: string, tree: string, files: ReviewedFile[], committed: ReviewedFile[] | undefined }} parts
 * @returns {TakenStoryReview}
 */
export function takenSnapshot({ baseline, tree, files, committed }) {
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
    ...(committed && {
      uncommitted: {
        kind: "uncommitted",
        tree,
        baseline,
        fromTree: baseline,
        fromBaseline: baseline,
      },
      committed: {
        from: baseline,
        tree: storyReviewIds.head,
        files: structuredClone(committed),
      },
    }),
  };
}

/**
 * The range read of the snapshot's commit, holding `files`.
 * @param {ReviewedFile[]} files
 * @returns {ReviewRange}
 */
export function commitRange(files) {
  return {
    kind: "comparison",
    from: storyReviewIds.baseline,
    tree: storyReviewIds.commitTree,
    trunkIntegrated: false,
    files: structuredClone(files),
  };
}
