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

const objectId = z.string().regex(/^[0-9a-f]{40,64}$/);

export const storyReviewSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("snapshot"),
    // The workspace as the page shows the project's folders.
    workspace: z.string().min(1),
    branch: z.string().min(1),
    remote: z.string().min(1),
    target: z.string().min(1),
    // The merge-base of `head` and the freshly fetched `<remote>/<target>`.
    baseline: objectId,
    head: objectId,
    // The workspace's files as observed, written as a tree object: every
    // file diff of this snapshot compares `baseline` with it.
    tree: objectId,
    files: z.array(reviewedFileSchema),
  }),
  z.object({
    kind: z.literal("unavailable"),
    workspace: z.string().min(1),
    explanation: z.string().min(1),
  }),
]);
export type StoryReview = z.infer<typeof storyReviewSchema>;
