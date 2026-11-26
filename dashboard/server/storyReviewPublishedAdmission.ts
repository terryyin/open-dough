// A named published comparison, shared by the result and literal-file reads.
import type { PublishedSource } from "../src/publishedSource.ts";
import { RefusedRequest } from "./localOrigin.ts";
import {
  admissionBound,
  throwIfRequestAborted,
} from "./storyReviewAdmissionBound.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";
import { publishedTakenReview } from "./storyReviewPublishedTaken.ts";

export async function requirePublishedCompletion(
  source: PublishedSource,
  identity: string,
  completion: string,
  signal?: AbortSignal,
) {
  const review = await publishedStoryReview(
    source,
    identity,
    admissionBound(signal),
    { completion },
  );
  throwIfRequestAborted(signal);
  if (review?.kind !== "published")
    throw new RefusedRequest(
      409,
      review?.kind === "unavailable"
        ? review.explanation
        : "Published comparison unavailable.",
    );
  return review;
}

export async function requirePublishedHead(
  source: PublishedSource,
  identity: string,
  head: string,
  signal: AbortSignal,
) {
  const review = await publishedTakenReview(source, identity, signal, { head });
  signal.throwIfAborted();
  if (review.kind !== "published-taken")
    throw new RefusedRequest(409, review.explanation);
  return review;
}
