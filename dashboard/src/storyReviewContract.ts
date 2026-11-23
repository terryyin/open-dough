import { sessionComparisonKeySchema } from "./sessionReviewComparisons.ts";
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
import {
  reviewCommitSchema,
  reviewComparisonSchema,
  reviewUncommittedSchema,
} from "./storyReviewPoints.ts";
import type { EstablishedContext } from "./launchRecord.ts";
import { sessionRunChoiceSchema } from "./sessionCommits.ts";

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
  reviewedFileDiffSchema,
  reviewedFileSchema,
  reviewedFileTextSchema,
  reviewedPathSchema,
  type LineCounts,
  type ReviewedFile,
  type ReviewedFileDiff,
  type ReviewedFileText,
} from "./storyReviewFiles.ts";
export {
  reviewCommitSchema,
  reviewComparisonSchema,
  reviewIntegrationSchema,
  reviewItemId,
  reviewRangeSchema,
  reviewUncommittedSchema,
  type ReviewCommit,
  type ReviewComparison,
  type ReviewIntegration,
  type ReviewItem,
  type ReviewRange,
} from "./storyReviewPoints.ts";

const fixedComparison = {
  baseline: objectIdSchema,
  tree: objectIdSchema,
  files: z.array(reviewedFileSchema),
};

// Another session was open in the same checkout meanwhile, so the comparison
// may include that session's work.
const sharedCheckout = { shared: z.literal(true).optional() };

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
      ...fixedComparison,
      // A branch story can also compare from its recorded story start to this tree.
      withMerged: reviewComparisonSchema.optional(),
    }),
    z.object({
      kind: z.literal("landed"),
      landing: landedReviewContextSchema,
      ...fixedComparison,
    }),
    // The commits a Default main session made in its checkout
    // (`./sessionCommits.ts`): one kept run's comparison, with the kept runs
    // oldest first and the answered run's position among them.
    z.object({
      kind: z.literal("session-commits"),
      session: z.object({
        launchedAt: z.iso.datetime(),
        doneAt: z.iso.datetime(),
        ...sharedCheckout,
      }),
      commitRuns: z.array(sessionRunChoiceSchema).min(1),
      commitRun: z.number().int().nonnegative(),
      ...fixedComparison,
    }),
    // A standalone session's published close record: the selected recorded
    // pair and the session's close time. A record of several ordered ranges
    // names how many and which position is shown; launch history is not
    // required (`../server/publishedSessionReview.ts`).
    z.object({
      kind: z.literal("published-session"),
      session: z.object({
        closedAt: z.iso.datetime(),
        // Set when the selected range is marked shared-checkout.
        ...sharedCheckout,
      }),
      ranges: z.number().int().min(2).optional(),
      selectedRun: z.string().regex(/^\d+$/).optional(),
      ...fixedComparison,
    }),
    z.object({
      kind: z.literal("branch-result"),
      doneAt: z.iso.datetime(),
      ...fixedComparison,
    }),
    z.object({
      kind: z.literal("landing-unavailable"),
      comparison: z.enum(["session-commits", "published-session"]).optional(),
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
      withMerged: reviewComparisonSchema.optional(),
      mergedChangesUnavailable: z.string().min(1).optional(),
      uncommitted: reviewUncommittedSchema.optional(),
      // With uncommitted changes, the same snapshot's committed work alone:
      // the files from `baseline` to the head's tree, its `tree`, which its
      // file diffs compare `from` with in place of the snapshot's.
      committed: reviewComparisonSchema
        .extend({
          tree: objectIdSchema,
          withMerged: reviewComparisonSchema.optional(),
        })
        .optional(),
    }),
    z.object({
      kind: z.literal("unavailable"),
      ambiguousWorktrees: z.literal(true).optional(),
      // The one workspace that could not be read, when selected.
      workspace: z.string().min(1).optional(),
      explanation: z.string().min(1),
    }),
  ])
  .and(
    z.object({
      runs: z.array(reviewRunChoiceSchema).optional(),
      selectedRun: z.string().min(1).optional(),
      sessionComparisonKeys: z.array(sessionComparisonKeySchema).optional(),
      deliveryGap: z.string().min(1).optional(),
    }),
  );
export type StoryReview = z.infer<typeof storyReviewSchema>;
// A review whose snapshot was taken.
export type TakenStoryReview = Extract<StoryReview, { kind: "snapshot" }>;
// A session's kept commits, including when the server could not show them.
// Published-session reviews are a distinct kind and never match here.
export const reviewsSessionCommits = (review: StoryReview | undefined) =>
  review?.kind === "session-commits" ||
  (review?.kind === "landing-unavailable" &&
    review.comparison === "session-commits");
// A published session's recorded comparison and gaps in that comparison.
export const reviewsPublishedSession = (review: StoryReview | undefined) =>
  review?.kind === "published-session" ||
  (review?.kind === "landing-unavailable" &&
    review.comparison === "published-session");
// A landed run's review, whether its delivered change could be read or not.
export const reviewsLanding = (review: StoryReview | undefined) =>
  review?.kind === "landed" ||
  (review?.kind === "landing-unavailable" && review.comparison === undefined);

// The revision a snapshot's baseline is named by wherever the review shows
// it: the trunk revision the story's published commits were taken out of, or
// the baseline itself.
export const baselineRevision = ({
  baseline,
  published,
}: Pick<TakenStoryReview, "baseline" | "published">) =>
  published?.trunk ?? baseline;
