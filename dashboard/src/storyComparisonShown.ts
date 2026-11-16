// The comparison a story's diff reads (`./StoryReviewFileDiff.tsx`), as one
// derivation for every view that shows a story's changes: the story reviewed,
// the comparison's *from* tree and changed files, and the tree it reaches. A
// published completion or a landed run shows its fixed comparison; a workspace
// snapshot shows the comparison chosen for it
// (`./useStoryReviewComparison.ts`), once that is known. A changed file's diff
// runs from its own tree when it includes trunk's changes, else from the
// comparison's *from* tree (`diffStartOf`), in Review changes and Intent alike.

import type { ReviewedWork } from "./StoryReviewFileDiff.tsx";
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
};

export function storyComparisonShown({
  subject,
  review,
  comparison,
  tree,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly review: StoryReview | undefined;
  // A snapshot's chosen comparison and the tree it reaches.
  readonly comparison: ReviewComparison | undefined;
  readonly tree: string | undefined;
}): ShownStoryComparison | undefined {
  if (review?.kind === "published" || review?.kind === "landed")
    return {
      reviewed: {
        subject,
        ...(review.kind === "published"
          ? { completion: review.completion }
          : { reference: review.landing.reference }),
      },
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

// The tree a changed file's diff runs from in `comparison`; without a file,
// the comparison's *from* tree.
export function diffStartOf(
  comparison: ReviewComparison,
  file: ReviewedFile | undefined,
): string {
  return file?.includesTrunkFrom ?? comparison.from;
}
