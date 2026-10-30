// Story review shows a launch workspace snapshot, a landed run's captured
// comparison, or a completed story's published historical comparison.
// The local launch boundary resolves the project,
// work identity and optional launch reference, never a repository path.
// `./storyReviewWorkspace.ts` owns the workspace selection on both sides; the
// historical comparison comes from captured landing facts or published Git
// completion and execution evidence, never a fabricated launch.
// Only a workspace snapshot can be marked reviewed: the story's one mark on
// this machine. Its changes since the mark exclude trunk's changes when the
// repository can still read and restate the marked snapshot.

import { z } from "zod";
import { objectIdSchema, reviewedFileSchema } from "./storyReviewFiles.ts";
import {
  landedReviewContextSchema,
  reviewRunChoiceSchema,
} from "./storyReviewLandedRun.ts";
import { markUncomparableSchema, reviewMarkSchema } from "./reviewMark.ts";
import type { EstablishedContext } from "./launchRecord.ts";

export const storyReviewEndpoint = "/__agent-launch/review";
// One file's diff within a snapshot: named by the `baseline` and `tree`
// object IDs it compares -- the file's *from* tree in the comparison shown,
// the baseline, the restated or the marked tree, and the snapshot's tree --
// and the file's path
// (and old path for a rename), so any file diff the page opens reads the
// same observation as the file list.
export const storyReviewFileEndpoint = "/__agent-launch/review/file";
// The same admitted comparison's file text at its *from* and snapshot trees,
// for expanding omitted unified-diff context without a second identity.
export const storyReviewFileTextEndpoint = "/__agent-launch/review/file/text";
export const storyReviewRangeEndpoint = "/__agent-launch/review/range";
// Where a same-origin POST marks the snapshot shown as reviewed.
export const storyReviewMarkEndpoint = "/__agent-launch/review/mark";

// Saved landings retain full branch refs; workspace targets use short names.
export const reviewTargetName = ({
  remote,
  target,
}: Pick<EstablishedContext, "remote" | "target">) =>
  `${remote}/${target.replace(/^refs\/heads\//, "")}`;

export {
  objectIdSchema,
  reviewedFileSchema,
  type LineCounts,
  type ReviewedFile,
} from "./storyReviewFiles.ts";
export {
  markReviewedAnswerSchema,
  markReviewedRequestSchema,
  markUnavailable,
  markUncomparableSchema,
  reviewMarkSchema,
  type MarkReviewedAnswer,
  type MarkReviewedRequest,
  type MarkUncomparable,
  type ReviewMark,
} from "./reviewMark.ts";

// A snapshot's changed files from one *from* tree to the snapshot's tree.
export const reviewComparisonSchema = z.object({
  from: objectIdSchema,
  files: z.array(reviewedFileSchema),
});
export type ReviewComparison = z.infer<typeof reviewComparisonSchema>;

// A comparison whose `from` is an earlier point's tree restated on the later
// point's baseline, with whether trunk was integrated between them: the two
// baselines differ as trees, whichever of them is a commit.
export const restatedComparisonSchema = reviewComparisonSchema.extend({
  trunkIntegrated: z.boolean(),
});
export type RestatedComparison = z.infer<typeof restatedComparisonSchema>;

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
  restatedComparisonSchema.extend({
    kind: z.literal("comparison"),
    tree: objectIdSchema,
  }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type ReviewRange = z.infer<typeof reviewRangeSchema>;

export const storyReviewSchema = z
  .discriminatedUnion("kind", [
    z.object({
      kind: z.literal("published"),
      completion: objectIdSchema,
      completedAt: z.iso.datetime(),
      agent: z.string().min(1),
      remote: z.string().min(1),
      target: z.string().min(1),
      baseline: objectIdSchema,
      tree: objectIdSchema,
      files: z.array(reviewedFileSchema),
    }),
    z.object({
      kind: z.literal("landed"),
      landing: landedReviewContextSchema,
      baseline: objectIdSchema,
      tree: objectIdSchema,
      files: z.array(reviewedFileSchema),
    }),
    z.object({
      kind: z.literal("landing-unavailable"),
      reference: z.uuid().optional(),
      explanation: z.string().min(1),
    }),
    z.object({
      kind: z.literal("snapshot"),
      // The workspace as the page shows the project's folders.
      workspace: z.string().min(1),
      branch: z.string().min(1),
      remote: z.string().min(1),
      target: z.string().min(1),
      // The merge-base of `head` and the freshly fetched `<remote>/<target>`,
      // or, with `published`, that revision's tree with the story's published
      // commits taken out.
      baseline: objectIdSchema,
      // A Trunk Mode story's commits its agent already published on trunk,
      // taken out of `baseline`: the trunk revision they were taken out of,
      // the merge-base, and how many. With `kept`, this machine's Git could
      // not take them out, so `baseline` is that revision still holding them.
      published: z
        .object({
          trunk: objectIdSchema,
          commits: z.number().int().positive(),
          kept: z.literal("not-restated").optional(),
        })
        .optional(),
      head: objectIdSchema,
      // The workspace's files as observed, written as a tree object: every
      // file diff of this snapshot compares the *from* tree of the comparison
      // shown with it: `baseline` for `files`; for `since`, its `from`; or in
      // either, the file's `includesTrunkFrom`.
      tree: objectIdSchema,
      files: z.array(reviewedFileSchema),
      commits: z.array(reviewCommitSchema),
      uncommitted: reviewUncommittedSchema.optional(),
      // With uncommitted changes, the same snapshot's committed work alone:
      // the files from `baseline` to the head's tree, its `tree`, which its
      // file diffs compare `from` with in place of the snapshot's.
      committed: reviewComparisonSchema
        .extend({ tree: objectIdSchema })
        .optional(),
      // The story's mark on this machine, when it has one.
      mark: reviewMarkSchema.optional(),
      // With a mark the repository holds, the same snapshot compared with it:
      // the changes since the review. Its `from` is the marked tree restated on `baseline`, leaving
      // out what came only from trunk -- the marked tree itself while
      // `baseline` is the mark's -- and its file diffs compare `from`, or a
      // file's `includesTrunkFrom`, with `tree`. Its baselines are the mark's
      // and `baseline`.
      since: restatedComparisonSchema.optional(),
      // With a mark that cannot be compared, in place of `since`: why.
      markUncomparable: markUncomparableSchema.optional(),
    }),
    z.object({
      kind: z.literal("unavailable"),
      // The one workspace that could not be read; absent when the review
      // could not choose a workspace at all.
      workspace: z.string().min(1).optional(),
      explanation: z.string().min(1),
    }),
  ])
  .and(
    z.object({
      runs: z.array(reviewRunChoiceSchema).optional(),
      selectedRun: z.string().min(1).optional(),
    }),
  );
export type StoryReview = z.infer<typeof storyReviewSchema>;
// A review whose snapshot was taken.
export type TakenStoryReview = Extract<StoryReview, { kind: "snapshot" }>;

// The revision a snapshot's baseline is named by wherever the review shows
// it: the trunk revision the story's published commits were taken out of, or
// the baseline itself.
export const baselineRevision = ({
  baseline,
  published,
}: Pick<TakenStoryReview, "baseline" | "published">) =>
  published?.trunk ?? baseline;

// Git's unified diff of one file of a snapshot, as printed
// (`./unifiedDiff.ts` reads it), or why it could not be read.
export const reviewedFileDiffSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("diff"), printed: z.string() }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type ReviewedFileDiff = z.infer<typeof reviewedFileDiffSchema>;

// File text at the same comparison trees the printed diff uses: `baseline` at
// the *from* path (`oldPath` when renamed), `tree` at `path`; null when that
// side has no file. Unavailable when the text cannot be read as text.
export const reviewedFileTextSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    baseline: z.string().nullable(),
    tree: z.string().nullable(),
  }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type ReviewedFileText = z.infer<typeof reviewedFileTextSchema>;
