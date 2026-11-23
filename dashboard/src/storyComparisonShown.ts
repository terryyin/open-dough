// The comparison a story's diff reads (`./StoryReviewFileDiff.tsx`), as one
// derivation for every view that shows a story's changes: the story reviewed,
// the comparison's *from* tree and changed files, and the tree it reaches. A
// published completion can show the story's contribution or its full branch
// interval. A landed run, a published session or a session's kept commits
// show their fixed comparison; a workspace snapshot shows the
// comparison chosen for it (`./useStoryReviewComparison.ts`), once that is
// known. A changed file's diff runs from its own tree when it includes trunk's
// changes, else from the comparison's *from* tree (`diffStartOf`), in Review
// changes and Intent alike.

import type { ReviewedWork } from "./reviewedFileRead.ts";
import type {
  ReviewComparison,
  ReviewedFile,
  StoryReview,
} from "./storyReviewContract.ts";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";

export type ShownStoryComparison = {
  readonly reviewed: ReviewedWork;
  readonly comparison: ReviewComparison;
  readonly tree: string;
  readonly includesMergedChanges?: true;
};

export function storyComparisonShown({
  subject,
  review,
  comparison,
  tree,
  includeMergedChanges = false,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly review: StoryReview | undefined;
  // A snapshot's chosen comparison and the tree it reaches.
  readonly comparison: ReviewComparison | undefined;
  readonly tree: string | undefined;
  readonly includeMergedChanges?: boolean;
}): ShownStoryComparison | undefined {
  if (
    includeMergedChanges &&
    review?.kind === "published" &&
    review.withMerged !== undefined
  )
    return {
      reviewed: { subject, completion: review.completion },
      comparison: review.withMerged,
      tree: review.tree,
      includesMergedChanges: true,
    };
  if (
    review?.kind === "published" ||
    review?.kind === "landed" ||
    review?.kind === "session-commits" ||
    review?.kind === "published-session" ||
    review?.kind === "branch-result"
  )
    return {
      reviewed: { subject, ...fixedComparisonName(review) },
      comparison: { from: review.baseline, files: review.files },
      tree: review.tree,
    };
  if (
    review?.kind === "snapshot" &&
    comparison !== undefined &&
    tree !== undefined
  )
    return { reviewed: { subject }, comparison, tree };
  return undefined;
}

// What names a fixed comparison beside its subject: a published completion,
// or a landed run's reference. A session's kept run is named by its pair
// alone.
function fixedComparisonName(
  review: Extract<
    StoryReview,
    {
      kind:
        | "published"
        | "landed"
        | "session-commits"
        | "published-session"
        | "branch-result";
    }
  >,
) {
  if (review.kind === "published") return { completion: review.completion };
  if (review.kind === "landed") return { reference: review.landing.reference };
  return {};
}

// The tree a changed file's diff runs from in `comparison`; without a file,
// the comparison's *from* tree.
export function diffStartOf(
  comparison: ReviewComparison,
  file: ReviewedFile | undefined,
): string {
  return file?.includesTrunkFrom ?? comparison.from;
}
