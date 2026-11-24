// @ts-check
// A completed piece of work's comparisons as the story review answers them
// (dashboard/src/storyReviewContract.ts): a story's published comparison, an
// ad hoc landing's or a captured run's landed comparison, and a execution checkout
// session's commits. Node-free, for ./storyReviewTestData.mjs.
/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").StoryReview} StoryReview */

/** @typedef {import("../../../dashboard/src/storyReviewContract.ts").ReviewedFile[][number]} ReviewedFile */
/** @typedef {import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice} ReviewRunChoice */
/** @typedef {{ baseline: string, tree: string, files: ReviewedFile[] }} Compared */

/** @param {number} digit */
const oid = (digit) => String(digit).repeat(40);

export const storyReviewIds = Object.freeze({
  baseline: oid(1),
  tree: oid(2),
  head: oid(3),
  completion: oid(7),
});

/**
 * A completed story's published comparison and represented landing.
 * @param {Compared & { completion: string | undefined, storyStart?: string | undefined, widened?: ReviewedFile[] | undefined }} compared
 * @returns {StoryReview}
 */
export function publishedComparison({
  baseline,
  tree,
  files,
  completion,
  storyStart,
  widened,
}) {
  return {
    kind: "published",
    completion: completion ?? storyReviewIds.completion,
    ...(completion === undefined ? {} : { landingRevision: completion }),
    completedAt: "2026-01-01T00:00:00.000Z",
    agent: "claude",
    remote: "origin",
    target: "main",
    baseline,
    tree,
    files,
    ...(storyStart !== undefined && widened !== undefined
      ? { withMerged: { from: storyStart, files: structuredClone(widened) } }
      : {}),
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
 * One comparison from a session's published close record.
 * @param {Compared} compared
 * @returns {StoryReview}
 */
export function publishedSessionComparison({ baseline, tree, files }) {
  return {
    kind: "published-session",
    session: { closedAt: "2026-01-02T13:00:00.000Z" },
    baseline,
    tree,
    files,
  };
}
