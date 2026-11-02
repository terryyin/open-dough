// A story's default comparison, read as Review changes reads it
// (`./useStoryReviewSelection.ts`, `./useStoryReviewComparison.ts`) for a
// view beside the story review: the run the review opens on, or a
// workspace's all changes, including uncommitted ones. Whether a story has a
// comparison to read follows `storyComparisonOffered`
// (`./storyReviewWorkspace.ts`).

import {
  storyComparisonShown,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";

// The comparison such a view reads of a workspace: all changes, with its
// uncommitted changes included as Review changes includes them at every
// opening.
export const defaultStoryComparison: {
  readonly chosen: ShownComparison;
  readonly includeUncommitted: boolean;
} = { chosen: "all", includeUncommitted: true };

export function useStoryComparison({
  source,
  identity,
  completed = false,
  round = 0,
}: {
  readonly source: string;
  readonly identity: string;
  readonly completed?: boolean;
  // How many times the reader asked for a new read.
  readonly round?: number;
}): {
  // The review read, which explains a comparison it cannot show.
  readonly review: StoryReview | undefined;
  readonly reading: boolean;
  readonly problem: string | undefined;
  readonly shown: ShownStoryComparison | undefined;
} {
  const { review, reading, problem, snapshot, selectedRun } =
    useStoryReviewSelection(source, identity, round, completed);
  const { comparison, tree } = useStoryReviewComparison({
    source,
    identity,
    snapshot,
    ...defaultStoryComparison,
    active: selectedRun === undefined,
  });
  return {
    review,
    reading,
    problem,
    shown: storyComparisonShown({ source, identity, review, comparison, tree }),
  };
}
