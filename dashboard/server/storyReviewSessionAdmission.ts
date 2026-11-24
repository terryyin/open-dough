// A local Done entry may retain a legacy accepted delivery receipt.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ReviewRepositoryReader } from "./reviewRepository.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";

export async function legacySessionReview(
  source: PublishedSource,
  record: LaunchRecord,
  run: string | undefined,
  signal: AbortSignal,
  reader: ReviewRepositoryReader,
): Promise<StoryReview> {
  if (run !== undefined)
    throw new RefusedRequest(
      409,
      "The selected comparison does not belong to this session's published changes.",
    );
  if (record.landing !== undefined)
    return landedStoryReview({ record }, signal, source, reader);
  return {
    kind: "unavailable",
    explanation: "No published comparison is available for this session.",
  };
}
