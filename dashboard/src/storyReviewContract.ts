// Story review shows a launch workspace snapshot, a landed run's captured
// comparison, or a completed story's published historical comparison.
// The local launch boundary resolves the project,
// work identity and optional launch reference, never a repository path.
// `./storyReviewWorkspace.ts` owns the workspace selection on both sides; the
// historical comparison comes from captured landing facts or published Git
// completion and execution evidence, never a fabricated launch.

import { z } from "zod";
import { objectIdSchema, reviewedFileSchema } from "./storyReviewFiles.ts";
import {
  landedReviewContextSchema,
  reviewRunChoiceSchema,
} from "./storyReviewLandedRun.ts";
import type { EstablishedContext } from "./launchRecord.ts";

export const storyReviewEndpoint = "/__agent-launch/review";
// The file diff reads the same comparison as the file list. The query names
// the start and end objects as `baseline` and `tree`, and supplies the file's
// path and, for a rename, its old path.
export const storyReviewFileEndpoint = "/__agent-launch/review/file";
// The same admitted comparison's file text at its *from* and snapshot trees,
// for expanding omitted unified-diff context without a second identity.
export const storyReviewFileTextEndpoint = "/__agent-launch/review/file/text";
export const storyReviewRangeEndpoint = "/__agent-launch/review/range";
// How long one review read may take before the boundary gives it up: a
// snapshot, trunk's fetch included, a chosen range, or a file's diff or text.
export const storyReviewWaitMs = 60_000;

// Saved landings retain full branch refs; workspace targets use short names.
export const reviewTargetName = ({
  remote,
  target,
}: Pick<EstablishedContext, "remote" | "target">) =>
  `${remote}/${target.replace(/^refs\/heads\//, "")}`;

export {
  objectIdSchema,
  reviewedFileSchema,
  reviewedPathSchema,
  type LineCounts,
  type ReviewedFile,
} from "./storyReviewFiles.ts";
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
    trunkIntegrated: z.boolean(),
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
      // The represented trunk landing; completion retains its own identity.
      landingRevision: objectIdSchema.optional(),
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
    // The commits a Default main session made in its checkout
    // (`./sessionCommits.ts`): one kept run's comparison.
    z.object({
      kind: z.literal("session-commits"),
      session: z.object({
        launchedAt: z.iso.datetime(),
        doneAt: z.iso.datetime(),
      }),
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
      // shown with it: `baseline` for `files`, or the file's `includesTrunkFrom`.
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
