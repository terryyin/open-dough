// Story review: a fixed snapshot of what one story's launch workspace would
// add to trunk now. The local launch boundary takes it
// (`../server/storyReviewSnapshot.ts`) for a project and work identity, never
// a path; the page shows it from the story's card (`./StoryReviewAction.tsx`).
// The review workspace is chosen by one rule on both sides
// (`reviewWorkspaceOf`), so the page offers a review exactly when the
// boundary can resolve one. The developer may mark the snapshot shown as
// reviewed (`../server/storyReviewMarks.ts`): the story's one mark on this
// machine, which only that request makes. A marked story's snapshot is also
// compared with its mark: the changes since the review, leaving out what
// came only from trunk -- unless the repository no longer holds the marked
// snapshot, and marking starts again.

import { z } from "zod";
import { launchTextLimit, workIdentitySchema } from "./launchRequest.ts";
import { launchSubject } from "./launchWorkflow.ts";
import type { EstablishedContext, LaunchRecord } from "./launchRecord.ts";

export const storyReviewEndpoint = "/__agent-launch/review";
// One file's diff within a snapshot: named by the `baseline` and `tree`
// object IDs it compares -- the file's *from* tree in the comparison shown,
// the baseline, the restated or the marked tree, and the snapshot's tree --
// and the file's path
// (and old path for a rename), so any file diff the page opens reads the
// same observation as the file list.
export const storyReviewFileEndpoint = "/__agent-launch/review/file";
export const storyReviewRangeEndpoint = "/__agent-launch/review/range";
// Where a same-origin POST marks the snapshot shown as reviewed.
export const storyReviewMarkEndpoint = "/__agent-launch/review/mark";

// The kept launch record a story's review reads, with what it established:
// the most recent by `launchedAt` of the story's records whose start or
// preparation names a workspace, or undefined when none does.
export function reviewWorkspaceOf<Kept extends LaunchRecord>(
  records: readonly Kept[] | undefined,
  sourceId: string,
  identity: string,
):
  | { readonly record: Kept; readonly established: EstablishedContext }
  | undefined {
  let latest: ReturnType<typeof reviewWorkspaceOf<Kept>>;
  for (const record of records ?? []) {
    const established = record.start ?? record.preparation;
    if (
      established === undefined ||
      record.request.source !== sourceId ||
      launchSubject(record.request).identity !== identity
    )
      continue;
    if (
      latest === undefined ||
      Date.parse(record.launchedAt) >= Date.parse(latest.record.launchedAt)
    )
      latest = { record, established };
  }
  return latest;
}

export const objectIdSchema = z.string().regex(/^[0-9a-f]{40,64}$/);

// How many lines a file's diff adds and removes, as Git counts them for the
// same comparison; a binary file has none.
const lineCountsSchema = z.object({
  added: z.number().int().nonnegative(),
  removed: z.number().int().nonnegative(),
});
export type LineCounts = z.infer<typeof lineCountsSchema>;

// What every changed file may say beside its kind and paths: its line counts
// when Git counted them, and, for a file of the changes since the review that
// trunk, integrated since the mark, and the story both changed in a way Git
// cannot separate, that it includes trunk's changes -- its kind, diff, and
// line counts then run from this tree instead of the comparison's *from*
// tree: the marked one, or the baseline when the story kept its marked
// version.
const fileFacts = {
  lines: lineCountsSchema.optional(),
  includesTrunkFrom: objectIdSchema.optional(),
};

// One changed file of a snapshot, as Git's rename-detecting tree diff names
// it; a renamed file also names the path it had at the *from* tree.
export const reviewedFileSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.enum(["added", "modified", "deleted"]),
    path: z.string().min(1),
    ...fileFacts,
  }),
  z.object({
    kind: z.literal("renamed"),
    path: z.string().min(1),
    oldPath: z.string().min(1),
    ...fileFacts,
  }),
]);
export type ReviewedFile = z.infer<typeof reviewedFileSchema>;

// A story's mark: the snapshot the developer marked reviewed, by its tree and
// the baseline it was compared with, and when.
export const reviewMarkSchema = z.object({
  tree: objectIdSchema,
  baseline: objectIdSchema,
  markedAt: z.iso.datetime(),
});
export type ReviewMark = z.infer<typeof reviewMarkSchema>;

// Whether trunk was integrated since the mark: a snapshot from `baseline` no
// longer shares the marked snapshot's baseline.
export const trunkIntegratedSince = (mark: ReviewMark, baseline: string) =>
  mark.baseline !== baseline;

// Names the snapshot shown to mark: the project, the work identity, and the
// snapshot's `tree` and `baseline`, never a path.
export const markReviewedRequestSchema = z.strictObject({
  source: z.string().min(1).max(launchTextLimit),
  identity: workIdentitySchema,
  tree: objectIdSchema,
  baseline: objectIdSchema,
});
export type MarkReviewedRequest = z.infer<typeof markReviewedRequestSchema>;

// The answer to Mark reviewed: the story's mark now, or why the snapshot
// could not be marked.
export const markReviewedAnswerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("marked"), mark: reviewMarkSchema }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type MarkReviewedAnswer = z.infer<typeof markReviewedAnswerSchema>;

// The answer that the snapshot could not be marked reviewed, and why.
export const markUnavailable = (why: string): MarkReviewedAnswer => ({
  kind: "unavailable",
  explanation: `The snapshot could not be marked reviewed: ${why}`,
});

// A snapshot's changed files from one *from* tree to the snapshot's tree.
export const reviewComparisonSchema = z.object({
  from: objectIdSchema,
  files: z.array(reviewedFileSchema),
});
export type ReviewComparison = z.infer<typeof reviewComparisonSchema>;

// Two repository points supplied by the snapshot's first-parent commit list.
export const reviewCommitSchema = z.object({
  kind: z.literal("commit"),
  revision: objectIdSchema,
  shortRevision: z.string().min(1),
  subject: z.string(),
  committedAt: z.iso.datetime({ offset: true }),
  merge: z.boolean(),
  tree: objectIdSchema,
  baseline: objectIdSchema,
  fromTree: objectIdSchema,
  fromBaseline: objectIdSchema,
});
export type ReviewCommit = z.infer<typeof reviewCommitSchema>;

// The virtual newest item has points, but no commit revision or timestamp.
export const reviewUncommittedSchema = z.object({
  kind: z.literal("uncommitted"),
  tree: objectIdSchema,
  baseline: objectIdSchema,
  fromTree: objectIdSchema,
  fromBaseline: objectIdSchema,
});
export type ReviewItem = ReviewCommit | z.infer<typeof reviewUncommittedSchema>;
export const reviewItemId = (item: ReviewItem) =>
  item.kind === "commit" ? item.revision : "uncommitted";

// A selected merge's listed parent point and its destination baseline.
export const reviewIntegrationSchema = z.strictObject({
  fromTree: objectIdSchema,
  fromBaseline: objectIdSchema,
  baseline: objectIdSchema,
});
export type ReviewIntegration = z.infer<typeof reviewIntegrationSchema>;

export const reviewRangeSchema = z.discriminatedUnion("kind", [
  reviewComparisonSchema.extend({
    kind: z.literal("comparison"),
    tree: objectIdSchema,
    trunkIntegrated: z.boolean(),
  }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type ReviewRange = z.infer<typeof reviewRangeSchema>;

// Why the earlier review cannot be compared: the repository no longer holds
// the mark's tree or baseline, or this machine's Git cannot restate the
// marked tree on trunk's changes since.
export const markUncomparableSchema = z.enum(["unreadable", "not-restated"]);
export type MarkUncomparable = z.infer<typeof markUncomparableSchema>;

export const storyReviewSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("snapshot"),
    // The workspace as the page shows the project's folders.
    workspace: z.string().min(1),
    branch: z.string().min(1),
    remote: z.string().min(1),
    target: z.string().min(1),
    // The merge-base of `head` and the freshly fetched `<remote>/<target>`.
    baseline: objectIdSchema,
    head: objectIdSchema,
    // The workspace's files as observed, written as a tree object: every
    // file diff of this snapshot compares the *from* tree of the comparison
    // shown with it: `baseline` for `files`; for `since`, its `from` or the
    // file's `includesTrunkFrom`.
    tree: objectIdSchema,
    files: z.array(reviewedFileSchema),
    commits: z.array(reviewCommitSchema),
    uncommitted: reviewUncommittedSchema.optional(),
    // The story's mark on this machine, when it has one.
    mark: reviewMarkSchema.optional(),
    // With a mark the repository holds, the same snapshot compared with it:
    // the changes since the review. Its `from` is the marked tree restated on `baseline`, leaving
    // out what came only from trunk -- the marked tree itself while
    // `baseline` is the mark's -- and its file diffs compare `from`, or a
    // file's `includesTrunkFrom`, with `tree`. Trunk was integrated since the
    // mark exactly when the mark's baseline differs from `baseline`.
    since: reviewComparisonSchema.optional(),
    // With a mark that cannot be compared, in place of `since`: why.
    markUncomparable: markUncomparableSchema.optional(),
  }),
  z.object({
    kind: z.literal("unavailable"),
    workspace: z.string().min(1),
    explanation: z.string().min(1),
  }),
]);
export type StoryReview = z.infer<typeof storyReviewSchema>;
// A review whose snapshot was taken.
export type TakenStoryReview = Extract<StoryReview, { kind: "snapshot" }>;

// Git's unified diff of one file of a snapshot, as printed
// (`./unifiedDiff.ts` reads it), or why it could not be read.
export const reviewedFileDiffSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("diff"), printed: z.string() }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type ReviewedFileDiff = z.infer<typeof reviewedFileDiffSchema>;
