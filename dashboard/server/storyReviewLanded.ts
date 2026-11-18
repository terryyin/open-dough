// A fixed captured comparison reads only its original common repository and objects.
import { isEstablishedOneShot } from "../src/launchRecord.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import {
  landedReviewContextSchema,
  reviewLandedWorkflowSchema,
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
  const read = await retainedPairFiles(landing, signal);
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

// A retained pair's changed files, read from its own repository's objects
// alone, or what of the pair could not be read.
export async function retainedPairFiles(
  pair: {
    readonly repository: string;
    readonly base: string;
    readonly revision: string;
  },
  signal: AbortSignal,
): Promise<
  | { readonly files: Awaited<ReturnType<typeof changedFrom>> }
  | { readonly missing: "repository" | "objects" | "changes" }
> {
  if (directoryState(pair.repository).kind !== "available")
    return { missing: "repository" };
  const call: GitCall = {
    cwd: pair.repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  try {
    for (const object of [pair.base, pair.revision]) {
      if (
        (await runGit(["cat-file", "-t", object], call)).stdout.trim() !==
        "commit"
      )
        throw new Error("Missing commit");
    }
  } catch {
    return { missing: "objects" };
  }
  try {
    return { files: await changedFrom(pair.base, pair.revision, call) };
  } catch {
    return { missing: "changes" };
  }
}
