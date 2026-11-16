// The server's opening answer for a story, before any explicit run or
// workspace choice. Intent follows this answer directly; Review keeps its
// own selection over it (`./useStoryReviewSelection.ts`).
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReviewContract.ts";
import {
  reviewedWorkQuery,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";
import { useReviewRead } from "./useReviewRead.ts";

export function useDefaultStoryReview({
  subject,
  round,
  completed = false,
  historical = false,
  enabled = true,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly round: number;
  readonly completed?: boolean | undefined;
  readonly historical?: boolean | undefined;
  readonly enabled?: boolean;
}) {
  return useReviewRead<StoryReview>(
    storyReviewEndpoint,
    {
      ...reviewedWorkQuery(subject),
      ...(completed ? { completed: "true" } : {}),
      ...(historical ? { historical: "true" } : {}),
    },
    storyReviewSchema,
    { round, enabled },
  );
}
