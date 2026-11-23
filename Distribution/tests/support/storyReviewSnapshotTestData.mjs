// @ts-check
// A taken story's workspace snapshot as the story review answers it
// (dashboard/src/storyReviewContract.ts): its branch, its commits (one by
// default, or the story's own from ./reviewCommitTestData.mjs) and, when its
// committed part can be told apart or is asked for, its uncommitted changes;
// commits a Trunk Mode agent published that its baseline keeps or subtracts; and the range
// read of a commit range. Node-free, for ./storyReviewTestData.mjs.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").TakenStoryReview} TakenStoryReview */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewRange} ReviewRange */
/** @typedef {TakenStoryReview["files"][number]} ReviewedFile */
/** @typedef {import("./reviewCommitTestData.mjs").ReviewCommit} ReviewCommit */
import { UncommittedReviewItemBuilder } from "./reviewCommitTestData.mjs";

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
 * @typedef {object} SnapshotParts
 * @property {string} baseline
 * @property {string} tree
 * @property {ReviewedFile[]} files
 * @property {ReviewedFile[] | undefined} committed its committed part's files
 * @property {ReviewCommit[] | undefined} commits newest first
 * @property {boolean} uncommitted uncommitted changes over the newest commit
 * @property {{ commits: number, trunk?: string, kept?: "not-restated" } | undefined} published
 */

/**
 * @param {SnapshotParts} parts
 * @returns {TakenStoryReview}
 */
export function takenSnapshot(parts) {
  const snapshot = withCommits(oneCommitSnapshot(parts), parts);
  if (parts.published === undefined) return snapshot;
  return {
    ...snapshot,
    published: {
      trunk: parts.baseline,
      ...parts.published,
    },
  };
}

/**
 * @param {SnapshotParts} parts
 * @returns {TakenStoryReview}
 */
function oneCommitSnapshot({ baseline, tree, files, committed }) {
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
 * The snapshot on the story's own `commits`; its committed part runs from the
 * oldest's parent tree to the newest's tree.
 * @param {TakenStoryReview} snapshot
 * @param {SnapshotParts} parts
 * @returns {TakenStoryReview}
 */
function withCommits(snapshot, { commits = [], uncommitted, committed }) {
  const [newest] = commits;
  const oldest = commits.at(-1);
  if (newest === undefined || oldest === undefined) return snapshot;
  return {
    ...snapshot,
    commits: structuredClone(commits),
    uncommitted:
      uncommitted || committed !== undefined
        ? new UncommittedReviewItemBuilder().after(newest).please()
        : undefined,
    committed:
      committed === undefined
        ? undefined
        : {
            from: oldest.fromTree,
            tree: newest.tree,
            files: structuredClone(committed),
          },
  };
}

/**
 * The range read holding `files`: from `oldest`'s parent tree to `newest`'s
 * tree, or without them, of the default snapshot's one commit.
 * @param {ReviewedFile[]} files
 * @param {ReviewCommit} [oldest]
 * @param {ReviewCommit} [newest]
 * @returns {ReviewRange}
 */
export function commitRange(files, oldest, newest = oldest) {
  return {
    kind: "comparison",
    from: oldest?.fromTree ?? storyReviewIds.baseline,
    tree: newest?.tree ?? storyReviewIds.commitTree,
    trunkIntegrated: false,
    files: structuredClone(files),
  };
}
