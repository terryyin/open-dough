// A Done story's Published completion comparison for file-anchored follow-up
// specs: the published review the dashboard serves and the file facts a
// follow-up names from it. Rename and journey histories:
// ./completedFollowUpHistory.ts.
import type { FollowUpFile } from "../../src/followUpRequest.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type ReviewedFile,
  type StoryReview,
} from "../../src/storyReviewContract.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { lines } from "./storyReviewWorktree.ts";

export const renamedOldPath = "old/a.ts";
export const renamedNewPath = "new/a.ts";

// Twelve lines so new line 12 exists after the rename edit.
export const renamedBaselineText = lines("old", 12);
export const renamedTreeText = `${lines("old", 11)}new 11\n`;

export function fromOf(
  review: Extract<StoryReview, { kind: "published" }>,
  file: ReviewedFile,
) {
  return file.includesTrunkFrom ?? review.baseline;
}

export async function publishedReviewOf(
  dashboard: DashboardServer,
  completion: string,
) {
  const response = await fetch(
    `${dashboard.baseURL}${storyReviewEndpoint}?${new URLSearchParams({
      source: "open-dough",
      identity: queuedIdentity,
      completed: "true",
    })}`,
    { headers: { Origin: dashboard.origin } },
  );
  if (!response.ok)
    throw new Error(`Published review failed: ${response.status}`);
  const review = storyReviewSchema.parse(await response.json());
  if (review.kind !== "published")
    throw new Error(`Expected published review, got ${review.kind}`);
  if (review.completion !== completion)
    throw new Error(
      `Expected completion ${completion}, got ${review.completion}`,
    );
  return review;
}

export type PublishedReview = Awaited<ReturnType<typeof publishedReviewOf>>;

// Published-completion file facts the boundary specs send and expect.
export function fileFactsOf(
  review: PublishedReview,
  file: ReviewedFile,
  line?: { line: number; side: "old" | "new" },
): FollowUpFile & { completion: string } {
  return {
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
    baseline: fromOf(review, file),
    tree: review.tree,
    completion: review.completion,
    ...(line === undefined ? {} : line),
  };
}
