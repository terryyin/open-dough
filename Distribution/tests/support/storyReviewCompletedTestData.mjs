// @ts-check
// A completed piece of work's comparisons as the story review answers them
// (dashboard/src/storyReviewContract.ts): a story's published comparison, an
// ad hoc landing's or a captured run's landed comparison, and a Default main
// session's commits. Node-free, for ./storyReviewTestData.mjs.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").StoryReview} StoryReview */
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").TakenStoryReview} TakenStoryReview */
/** @typedef {TakenStoryReview["files"][number]} ReviewedFile */
/** @typedef {import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice} ReviewRunChoice */
/** @typedef {{ baseline: string, tree: string, files: ReviewedFile[] }} Compared */
import { storyReviewIds } from "./storyReviewSnapshotTestData.mjs";

/**
 * @param {Compared} compared
 * @returns {StoryReview}
 */
export function publishedComparison({ baseline, tree, files }) {
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
}

/**
 * An ad hoc landing's comparison, or `run`'s when one is selected.
 * @param {Compared & { run: ReviewRunChoice | undefined }} compared
 * @returns {StoryReview}
 */
export function landedComparison({ baseline, tree, files, run }) {
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
}

/**
 * A Default main session's commits: one kept run.
 * @param {Compared} compared
 * @returns {StoryReview}
 */
export function sessionCommits({ baseline, tree, files }) {
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
}
