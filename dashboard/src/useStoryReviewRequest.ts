// A story review's (`./StoryReview.tsx`) selection for its request
// (`./pageStoryReviews.ts`). A request naming a comparison, as Intent's does,
// opens the review on it; asked again while shown, the review returns to it
// from any choice, a landed run chosen in the review included. A workspace
// answer that falls back to a landed run (its workspace gone, its landing
// captured) is what Intent shows too, so the review returns to that run.
// Without one the review opens on its own default
// (`./useStoryReviewSelection.ts`).
import { useState } from "react";
import type { StoryReviewRequest } from "./pageStoryReviews.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";

export function useStoryReviewRequest(
  request: StoryReviewRequest,
  // How many times Refresh asked for a new snapshot.
  round: number,
) {
  const { subject, completed, historical, comparison: asked } = request;
  const selection = useStoryReviewSelection({
    subject,
    round,
    completed,
    initial: asked?.chosen,
    includesUncommitted: asked?.includeUncommitted,
    historical,
  });
  const [answered, setAnswered] = useState(request);
  if (answered !== request) {
    setAnswered(request);
    const own = selection.answerRun;
    if (asked !== undefined && own !== undefined) selection.onRun(own);
    else if (asked !== undefined) {
      selection.onWorkspace(asked.chosen);
      selection.setIncludeUncommitted(asked.includeUncommitted);
    }
  }
  return selection;
}
