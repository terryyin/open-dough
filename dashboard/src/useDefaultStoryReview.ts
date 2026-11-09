// The server's opening answer for a story, before any explicit run or
// workspace choice. Intent follows this answer directly; Review keeps its
// own selection over it (`./useStoryReviewSelection.ts`).
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type StoryReview,
} from "./storyReviewContract.ts";
import { useReviewRead } from "./useReviewRead.ts";

export function useDefaultStoryReview({
  source,
  identity,
  round,
  completed = false,
  historical = false,
  enabled = true,
}: {
  readonly source: string;
  readonly identity: string;
  readonly round: number;
  readonly completed?: boolean | undefined;
  readonly historical?: boolean | undefined;
  readonly enabled?: boolean;
}) {
  return useReviewRead<StoryReview>(
    storyReviewEndpoint,
    {
      source,
      identity,
      ...(completed ? { completed: "true" } : {}),
      ...(historical ? { historical: "true" } : {}),
    },
    storyReviewSchema,
    { round, enabled },
  );
}
