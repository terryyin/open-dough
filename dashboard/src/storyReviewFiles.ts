// Shared file facts for workspace and fixed landed comparisons.
import { z } from "zod";
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
