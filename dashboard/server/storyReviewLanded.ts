// A fixed captured comparison reads only its original common repository and objects.
import { isEstablishedOneShot } from "../src/launchRecord.ts";
import type { StoryReview } from "../src/storyReview.ts";
import {
  landedReviewContextSchema,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { changedFrom } from "./storyReviewFiles.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { directoryState } from "./sessionWorkspace.ts";

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
  if (directoryState(landing.repository).kind !== "available")
    return unavailable(
      "The captured landing repository is missing or unreadable.",
    );
  const call: GitCall = {
    cwd: landing.repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  try {
    for (const object of [landing.base, landing.revision]) {
      if (
        (await runGit(["cat-file", "-t", object], call)).stdout.trim() !==
        "commit"
      )
        throw new Error("Missing commit");
    }
  } catch {
    return unavailable(
      "The captured landing comparison objects are missing or unreadable.",
    );
  }
  try {
    const files = await changedFrom(landing.base, landing.revision, call);
    const workflow = record.request.workflow;
    if (workflow !== "execution" && workflow !== "refinement")
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
      files,
    };
  } catch {
    return unavailable("The captured landing changes could not be read.");
  }
}
