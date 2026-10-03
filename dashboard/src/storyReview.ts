// Story review: a fixed snapshot of what one story's launch workspace would
// add to trunk now. The local launch boundary takes it
// (`../server/storyReviewSnapshot.ts`) for a project and work identity, never
// a path; the page shows it from the story's card (`./StoryReviewAction.tsx`).
// The review workspace is chosen by one rule on both sides
// (`reviewWorkspaceOf`), so the page offers a review exactly when the
// boundary can resolve one.

import { z } from "zod";
import { launchSubject } from "./launchWorkflow.ts";
import type { EstablishedContext, LaunchRecord } from "./launchRecord.ts";

export const storyReviewEndpoint = "/__agent-launch/review";
// One file's diff within a snapshot: named by the snapshot's `baseline` and
// `tree` object IDs and the file's path (and old path for a rename), so any
// file diff the page opens reads the same observation as the file list.
export const storyReviewFileEndpoint = "/__agent-launch/review/file";

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

// One changed file of a snapshot, as Git's rename-detecting tree diff names
// it; a renamed file also names the path it had at the baseline.
export const reviewedFileSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.enum(["added", "modified", "deleted"]),
    path: z.string().min(1),
  }),
  z.object({
    kind: z.literal("renamed"),
    path: z.string().min(1),
    oldPath: z.string().min(1),
  }),
]);
export type ReviewedFile = z.infer<typeof reviewedFileSchema>;

export const objectIdSchema = z.string().regex(/^[0-9a-f]{40,64}$/);

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
    // file diff of this snapshot compares `baseline` with it.
    tree: objectIdSchema,
    files: z.array(reviewedFileSchema),
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
