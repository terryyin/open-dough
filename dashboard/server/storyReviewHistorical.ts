// Done Intent follows the completed story, independently of whichever launch
// happened to retain a readable first-publication capture.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import {
  reviewRunKey,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { landingCompletesStory } from "./completedStoryCapture.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";

// A capture proves a first delivery. Only complete claim/completion recovery
// at its exact result can also establish that it is this story's Done result.
async function completedCapture(
  source: PublishedSource,
  identity: string,
  run: ReviewLandedRun,
  signal: AbortSignal,
): Promise<StoryReview | undefined> {
  const { record, established } = run;
  const landing = record.landing;
  if (
    record.request.workflow !== "execution" ||
    record.request.source !== source.id ||
    landing === undefined
  )
    return undefined;
  const match = await landingCompletesStory(
    source,
    identity,
    landing,
    established,
    signal,
  );
  if (match !== "matched") return undefined;
  const review = await landedStoryReview(run, signal);
  return review.kind === "landed"
    ? { ...review, selectedRun: reviewRunKey(record) }
    : undefined;
}

export async function historicalStoryReview(
  source: PublishedSource,
  identity: string,
  runs: readonly ReviewLandedRun[],
  signal: AbortSignal,
): Promise<StoryReview> {
  const published = await publishedStoryReview(source, identity, signal);
  if (published?.kind === "published") return published;
  for (const run of runs) {
    signal.throwIfAborted();
    const captured = await completedCapture(source, identity, run, signal);
    if (captured !== undefined) return captured;
  }
  return (
    published ?? {
      kind: "unavailable",
      explanation:
        "No published completion record is available for this story, so its historical changes cannot be identified.",
    }
  );
}
