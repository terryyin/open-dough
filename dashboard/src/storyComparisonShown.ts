// The fixed comparison shown in Intent or session review, with exact file baselines.

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
  includeMergedChanges = false,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly review: StoryReview | undefined;
  readonly includeMergedChanges?: boolean;
}): ShownStoryComparison | undefined {
  const show = (
    reviewed: ReviewedWork,
    comparison: ReviewComparison,
    tree: string,
    wider?: ReviewComparison,
  ): ShownStoryComparison => {
    const merged = includeMergedChanges ? wider : undefined;
    return {
      reviewed,
      comparison: merged ?? comparison,
      tree,
      ...(merged === undefined ? {} : { includesMergedChanges: true }),
    };
  };
  if (
    review?.kind === "published" ||
    review?.kind === "published-taken" ||
    review?.kind === "landed" ||
    review?.kind === "published-session"
  )
    return show(
      { subject, ...fixedComparisonName(review) },
      { from: review.baseline, files: review.files },
      review.tree,
      review.kind === "published" || review.kind === "published-taken"
        ? review.withMerged
        : undefined,
    );
  return undefined;
}

// Fixed comparison facts beside the subject, including the story associated
// with a published session when its Git record names one.
function fixedComparisonName(
  review: Extract<
    StoryReview,
    {
      kind: "published" | "published-taken" | "landed" | "published-session";
    }
  >,
) {
  if (review.kind === "published") return { completion: review.completion };
  if (review.kind === "published-taken") return { publishedHead: review.head };
  if (review.kind === "landed") return { reference: review.landing.reference };
  if (review.session.story !== undefined)
    return { publishedStory: review.session.story };
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
