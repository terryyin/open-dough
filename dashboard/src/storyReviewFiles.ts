// Shared file facts for workspace and fixed landed comparisons.
import { z } from "zod";
export const objectIdSchema = z.string().regex(/^[0-9a-f]{40,64}$/);

// A literal reviewed path as file reads and file-anchored follow-ups name it:
// nonempty, bounded, and free of null or newline bytes.
export const reviewedPathSchema = z
  .string()
  .min(1)
  .max(4_096)
  .refine((path) => !path.includes("\0") && !path.includes("\n"));

// How many lines a file's diff adds and removes, as Git counts them for the
// same comparison; a binary file has none.
const lineCountsSchema = z.object({
  added: z.number().int().nonnegative(),
  removed: z.number().int().nonnegative(),
});
export type LineCounts = z.infer<typeof lineCountsSchema>;

// Line counts and an alternate starting tree for changes to a file that Git
// cannot separate from trunk's. The kind, diff and counts all use that tree.
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
