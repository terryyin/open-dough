// A story's mark on this machine (`./storyReviewContract.ts`): the one workspace
// snapshot the developer marked reviewed, the request and answer of Mark
// reviewed, and why a mark cannot be compared with a later snapshot.

import { z } from "zod";
import { launchTextLimit, workIdentitySchema } from "./launchRequest.ts";
import { objectIdSchema } from "./storyReviewFiles.ts";

// A story's mark: the snapshot the developer marked reviewed, by its tree and
// the baseline it was compared with, and when.
export const reviewMarkSchema = z.object({
  tree: objectIdSchema,
  baseline: objectIdSchema,
  markedAt: z.iso.datetime(),
});
export type ReviewMark = z.infer<typeof reviewMarkSchema>;

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

// Why the earlier review cannot be compared: the repository no longer holds
// the mark's tree or baseline, or this machine's Git cannot restate the
// marked tree on trunk's changes since.
export const markUncomparableSchema = z.enum(["unreadable", "not-restated"]);
export type MarkUncomparable = z.infer<typeof markUncomparableSchema>;
