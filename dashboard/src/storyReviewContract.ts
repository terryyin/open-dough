import { sessionComparisonKeySchema } from "./sessionReviewComparisons.ts";
// The comparison selected by a published story or session review reader.

import { z } from "zod";
import { objectIdSchema, reviewedFileSchema } from "./storyReviewFiles.ts";
import {
  landedReviewContextSchema,
  reviewRunChoiceSchema,
} from "./storyReviewLandedRun.ts";
import { reviewComparisonSchema } from "./storyReviewPoints.ts";
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
// Bound a comparison or file read, including remote fetches.
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
  reviewComparisonSchema,
  type ReviewComparison,
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
      kind: z.literal("published-taken"),
      mode: z.enum(["story-branch", "trunk"]),
      head: objectIdSchema,
      agent: z.string().min(1),
      remote: z.string().min(1),
      target: z.string().min(1),
      ...fixedComparison,
      withMerged: reviewComparisonSchema.optional(),
    }),
    z.object({
      kind: z.literal("landed"),
      landing: landedReviewContextSchema,
      ...fixedComparison,
    }),
    // The commits an execution checkout session made in its checkout
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
      kind: z.literal("unavailable"),
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
