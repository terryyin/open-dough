import { z } from "zod";
import { objectIdSchema, reviewedFileSchema } from "./storyReviewFiles.ts";

// The changed files from one starting object to a known end tree.
export const reviewComparisonSchema = z.object({
  from: objectIdSchema,
  files: z.array(reviewedFileSchema),
});
export type ReviewComparison = z.infer<typeof reviewComparisonSchema>;

// Two repository points supplied by the snapshot's first-parent commit list.
export const reviewCommitSchema = z.object({
  kind: z.literal("commit"),
  revision: objectIdSchema,
  firstParent: objectIdSchema.optional(),
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

// The selected range follows the snapshot's newest-first order.
export function reviewRangeEnds(items: readonly ReviewItem[]) {
  return { oldest: items.at(-1), newest: items[0] };
}

// A selected merge's listed parent point and its destination baseline.
export const reviewIntegrationSchema = z.strictObject({
  fromTree: objectIdSchema,
  fromBaseline: objectIdSchema,
  baseline: objectIdSchema,
});
export type ReviewIntegration = z.infer<typeof reviewIntegrationSchema>;

export const reviewIntegrations = (
  items: readonly ReviewItem[],
): ReviewIntegration[] =>
  items
    .filter((item) => item.kind === "commit" && item.merge)
    .map(({ fromTree, fromBaseline, baseline }) => ({
      fromTree,
      fromBaseline,
      baseline,
    }));

export const reviewRangeSchema = z.discriminatedUnion("kind", [
  reviewComparisonSchema.extend({
    trunkIntegrated: z.boolean(),
    kind: z.literal("comparison"),
    tree: objectIdSchema,
    withMerged: reviewComparisonSchema.optional(),
  }),
  z.object({ kind: z.literal("unavailable"), explanation: z.string().min(1) }),
]);
export type ReviewRange = z.infer<typeof reviewRangeSchema>;
