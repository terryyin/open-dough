import { z } from "zod";
import { objectIdSchema, reviewedFileSchema } from "./storyReviewFiles.ts";

// The changed files from one starting object to a known end tree.
export const reviewComparisonSchema = z.object({
  from: objectIdSchema,
  files: z.array(reviewedFileSchema),
});
export type ReviewComparison = z.infer<typeof reviewComparisonSchema>;
