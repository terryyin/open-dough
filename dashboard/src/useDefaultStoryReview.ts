// The server's opening answer for a story, before any explicit run or
// workspace choice. Intent follows this answer directly; Review keeps its
// own selection over it (`./useStoryReviewSelection.ts`).
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReviewContract.ts";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";
import { storyReviewQuery } from "./storyReviewRead.ts";
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
    storyReviewQuery({ subject, completed, historical }),
    storyReviewSchema,
    { round, enabled },
  );
}
