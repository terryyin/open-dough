// A story review's (`./StoryReview.tsx`) selection for its request
// (`./pageStoryReviews.ts`), with whether it includes its workspace's
// uncommitted changes. A request naming a comparison, as Intent's does,
// opens the review on it; asked again while shown, the review returns its
// workspace to it unless a captured run is shown. Without one the review
// opens on its own default (`./useStoryReviewSelection.ts`).
import { useState } from "react";
import type { StoryReviewRequest } from "./pageStoryReviews.ts";
import { defaultStoryComparison } from "./useStoryComparison.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";

export function useStoryReviewRequest(
  request: StoryReviewRequest,
  // How many times Refresh asked for a new snapshot.
  round: number,
) {
  const { source, identity, completed, comparison: asked } = request;
  const selection = useStoryReviewSelection(
    source,
    identity,
    round,
    completed,
    true,
    asked?.chosen,
  );
  const [includeUncommitted, setIncludeUncommitted] = useState(
    (asked ?? defaultStoryComparison).includeUncommitted,
  );
  const [answered, setAnswered] = useState(request);
  if (answered !== request) {
    setAnswered(request);
    if (asked !== undefined && selection.selectedRun === undefined) {
      selection.onWorkspace(asked.chosen);
      setIncludeUncommitted(asked.includeUncommitted);
    }
  }
  // A snapshot without uncommitted changes offers no check; the next that
  // holds some offers it on.
  const workspace = selection.snapshot;
  if (!includeUncommitted && workspace !== undefined && !workspace.committed)
    setIncludeUncommitted(true);
  return { ...selection, includeUncommitted, setIncludeUncommitted };
}
