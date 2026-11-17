// Shared snapshot and file-diff shapes for frontend story-review substitutes.

import {
  reviewedFileDiffSchema,
  type ReviewedFileDiff,
  type StoryReview,
  type TakenStoryReview,
} from "../../src/storyReviewContract.ts";

const oid = (n: number) => n.toString(16).padStart(40, "0");

export const frontendReviewIds = {
  baseline: oid(1),
  tree: oid(2),
  head: oid(3),
  commit: oid(4),
  commitTree: oid(5),
  uncommittedTree: oid(6),
} as const;

// A minimal snapshot: one added file and one commit unless overridden.
export function frontendReviewSnapshot(
  overrides: Partial<TakenStoryReview> = {},
): TakenStoryReview {
  const baseline = overrides.baseline ?? frontendReviewIds.baseline;
  const tree = overrides.tree ?? frontendReviewIds.tree;
  const head = overrides.head ?? frontendReviewIds.head;
  const files = overrides.files ?? [
    {
      kind: "added" as const,
      path: "story.txt",
      lines: { added: 1, removed: 0 },
    },
  ];
  return {
    kind: "snapshot",
    workspace: "~/git/open-dough/.worktrees/story-review",
    branch: "claude/taken",
    remote: "origin",
    target: "main",
    baseline,
    head,
    tree,
    files,
    commits: overrides.commits ?? [
      {
        kind: "commit",
        revision: frontendReviewIds.commit,
        shortRevision: "aaaaaaa",
        subject: "story file",
        committedAt: "2026-01-01T00:00:00.000Z",
        merge: false,
        tree: frontendReviewIds.commitTree,
        baseline,
        fromTree: baseline,
        fromBaseline: baseline,
      },
    ],
    uncommitted: overrides.uncommitted,
    committed: overrides.committed,
    published: overrides.published,
    runs: overrides.runs,
    selectedRun: overrides.selectedRun,
  };
}

// A completed story's published comparison of `files`.
export function frontendPublishedReview(
  files: TakenStoryReview["files"],
): Extract<StoryReview, { kind: "published" }> {
  return {
    kind: "published",
    completion: oid(7),
    completedAt: "2026-01-01T00:00:00.000Z",
    agent: "claude",
    remote: "origin",
    target: "main",
    baseline: frontendReviewIds.baseline,
    tree: frontendReviewIds.tree,
    files,
  };
}

export function frontendFileDiff(
  path: string,
  lines: readonly string[],
): ReviewedFileDiff {
  const printed = [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    "@@ -0,0 +1 @@",
    ...lines.map((line) => (line.startsWith("+") ? line : `+${line}`)),
    "",
  ].join("\n");
  return reviewedFileDiffSchema.parse({ kind: "diff", printed });
}
