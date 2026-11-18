// Shared snapshot and file-diff shapes for frontend story-review substitutes.

import type { LaunchRecord } from "../../src/launchRecord.ts";
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

// What a kept run's switch label names: its commit count and last commit.
export type FrontendSessionRunFacts = {
  readonly commits: number;
  readonly subject: string;
  readonly committedAt: string;
};

// The answer for a Done session's kept commits: the run at `position`'s
// comparison of `files`, each kept run offered with its `facts` (one commit
// at Done unless given), and the capture's shared mark.
export function frontendSessionCommitsReview(
  { launchedAt, doneAt, sessionCommits }: LaunchRecord,
  files: TakenStoryReview["files"],
  position = 0,
  facts: readonly FrontendSessionRunFacts[] = [],
): StoryReview {
  const runs = sessionCommits?.runs ?? [];
  const answered = runs[position];
  if (doneAt === undefined || answered === undefined)
    throw new Error("The record keeps no such run of a Done session.");
  return {
    kind: "session-commits",
    session: {
      launchedAt,
      doneAt,
      ...(sessionCommits?.shared === true && { shared: true as const }),
    },
    commitRuns: runs.map(({ base, revision }, at) => ({
      commits: 1,
      subject: "session work",
      committedAt: doneAt,
      ...facts[at],
      baseline: base,
      tree: revision,
    })),
    commitRun: position,
    baseline: answered.base,
    tree: answered.revision,
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
