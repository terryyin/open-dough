// A landed run's review and its capture provenance.
import { isEstablishedOneShot } from "../src/launchRecord.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import {
  landedReviewContextSchema,
  reviewLandedWorkflowSchema,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { retainedCommitPairFiles } from "./retainedReviewPair.ts";

export async function landedStoryReview(
  run: ReviewLandedRun,
  signal: AbortSignal,
): Promise<StoryReview> {
  const { record } = run;
  const reference = record.request.reporting?.reference;
  const unavailable = (explanation: string): StoryReview => ({
    kind: "landing-unavailable",
    ...(reference === undefined ? {} : { reference }),
    explanation,
  });
  const landing = record.landing;
  if (landing === undefined)
    return unavailable(
      // A claimed launch is listed here once its workspace is gone, landed or not.
      isEstablishedOneShot(run.established)
        ? "This run has no captured landing comparison. Its delivered changes cannot be reconstructed from today's trunk."
        : "This run's workspace is gone and no landing comparison was captured. Its changes cannot be reconstructed from today's trunk.",
    );
  const read = await retainedCommitPairFiles(landing, signal);
  if ("missing" in read)
    return unavailable(
      {
        repository: "The captured landing repository is missing or unreadable.",
        objects:
          "The captured landing comparison objects are missing or unreadable.",
        changes: "The captured landing changes could not be read.",
      }[read.missing],
    );
  const workflow = record.request.workflow;
  if (!reviewLandedWorkflowSchema.safeParse(workflow).success)
    return unavailable("This launch's workflow has no landed review.");
  return {
    kind: "landed",
    landing: landedReviewContextSchema.parse({
      ...landing,
      workflow,
      launchedAt: record.launchedAt,
    }),
    baseline: landing.base,
    tree: landing.revision,
    files: read.files,
  };
}
