// The story review's reads of the launch boundary (`./storyReviewContract.ts`),
// one per endpoint, each with its query and the reader's abort signal,
// answering the shared shapes or rejecting with the refusal's words. The page
// speaks to the endpoints; `useReviewRead` keeps memo, rounds and the last
// answer above whichever source it is given.

import { createContext } from "react";
import type { z } from "zod";
import {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewRangeEndpoint,
  storyReviewSchema,
  type ReviewedFileDiff,
  type ReviewedFileText,
  type ReviewRange,
  type StoryReview,
} from "./storyReviewContract.ts";

export type ReviewQuery = Readonly<Record<string, string>>;

export type ReviewRead<Answer> = (
  query: ReviewQuery,
  signal: AbortSignal,
) => Promise<Answer>;

export type ReviewSource = {
  readonly review: ReviewRead<StoryReview>;
  readonly range: ReviewRead<ReviewRange>;
  readonly fileDiff: ReviewRead<ReviewedFileDiff>;
  readonly fileText: ReviewRead<ReviewedFileText>;
};

function endpointRead<Answer>(
  endpoint: string,
  schema: z.ZodType<Answer>,
): ReviewRead<Answer> {
  return async (query, signal) => {
    const response = await fetch(
      `${endpoint}?${new URLSearchParams(query).toString()}`,
      { signal, cache: "no-store" },
    );
    const answer: unknown = await response.json();
    if (!response.ok) {
      const said = (answer as { error?: unknown }).error;
      throw new Error(
        typeof said === "string" ? said : "The review was refused.",
      );
    }
    return schema.parse(answer);
  };
}

export const pageReviewSource: ReviewSource = {
  review: endpointRead(storyReviewEndpoint, storyReviewSchema),
  range: endpointRead(storyReviewRangeEndpoint, reviewRangeSchema),
  fileDiff: endpointRead(storyReviewFileEndpoint, reviewedFileDiffSchema),
  fileText: endpointRead(storyReviewFileTextEndpoint, reviewedFileTextSchema),
};

export const ReviewSourceOnPage = createContext<ReviewSource>(pageReviewSource);
