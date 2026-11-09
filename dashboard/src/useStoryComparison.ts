// A story's default comparison follows the server's opening answer. Review
// owns explicit run choices; Intent does not keep one over a newer default.
// An active workspace shows all changes, including uncommitted work. Done
// Intent reads the completed result even while that workspace remains.

import {
  storyComparisonShown,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import type { RequestedComparison } from "./pageStoryReviews.ts";
import type { StoryReview } from "./storyReviewContract.ts";
import { useDefaultStoryReview } from "./useDefaultStoryReview.ts";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";

// The comparison such a view reads of a workspace: all changes, with its
// uncommitted changes included as Review changes includes them at every
// opening.
export const defaultStoryComparison: RequestedComparison = {
  chosen: "all",
  includeUncommitted: true,
};

export function useStoryComparison({
  source,
  identity,
  completed,
  round,
  enabled,
}: {
  readonly source: string;
  readonly identity: string;
  readonly completed: boolean;
  // How many times the reader asked for a new read.
  readonly round: number;
  // A disabled comparison reads nothing and shows none.
  readonly enabled: boolean;
}): {
  // The review read, which explains a comparison it cannot show.
  readonly review: StoryReview | undefined;
  readonly reading: boolean;
  readonly problem: string | undefined;
  readonly shown: ShownStoryComparison | undefined;
} {
  const {
    answer: review,
    reading,
    problem,
  } = useDefaultStoryReview({
    source,
    identity,
    round,
    completed,
    enabled,
    historical: completed,
  });
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const { comparison, tree } = useStoryReviewComparison({
    source,
    identity,
    snapshot,
    ...defaultStoryComparison,
    active: enabled && !completed && review?.selectedRun === undefined,
  });
  if (!enabled)
    return {
      review: undefined,
      reading: false,
      problem: undefined,
      shown: undefined,
    };
  return {
    review,
    reading,
    problem,
    shown: storyComparisonShown({ source, identity, review, comparison, tree }),
  };
}
