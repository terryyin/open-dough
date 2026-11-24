// A landed run's review and its capture provenance.
import { landingReportingReference } from "../src/launchLanding.ts";
import {
  isEstablishedOneShot,
  type LaunchRecord,
} from "../src/launchRecord.ts";
import type {
  ReviewSyncFailure,
  StoryReview,
} from "../src/storyReviewContract.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  landedReviewContextSchema,
  reviewLandedWorkflowSchema,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { retainedCommitPairFiles } from "./retainedReviewPair.ts";
import {
  checkAncestry,
  defaultGitOutputLimit,
  gitProblem,
} from "./gitRunner.ts";
import {
  reviewRepositoryRead,
  ReviewSyncFailed,
  withSyncFailure,
} from "./reviewRepository.ts";

export type LandingReviewSource = {
  readonly record: LaunchRecord;
  readonly established?: ReviewLandedRun["established"] | undefined;
};

export async function landedStoryReview(
  run: LandingReviewSource,
  signal: AbortSignal,
  source: PublishedSource,
): Promise<StoryReview> {
  const { record } = run;
  const reference = landingReportingReference(record);
  const unavailable = (explanation: string): StoryReview => ({
    kind: "landing-unavailable",
    ...(reference === undefined ? {} : { reference }),
    explanation,
  });
  const landing = record.landing;
  if (landing === undefined)
    return unavailable(
      // A claimed launch is listed here once its workspace is gone, landed or not.
      run.established !== undefined && isEstablishedOneShot(run.established)
        ? "This run has no captured landing comparison. Its delivered changes cannot be reconstructed from today's trunk."
        : "This run's workspace is gone and no landing comparison was captured. Its changes cannot be reconstructed from today's trunk.",
    );
  if (
    landing.remote !== "origin" ||
    landing.target !== `refs/heads/${source.ref}`
  )
    return unavailable(
      "The landing does not name the project's configured origin target.",
    );
  let repository: string;
  let syncFailure: ReviewSyncFailure | undefined;
  try {
    ({ repository, syncFailure } = await reviewRepositoryRead(source, signal));
    const call = { cwd: repository, signal, maxBuffer: defaultGitOutputLimit };
    if (!(await checkAncestry(landing.revision, `origin/${source.ref}`, call)))
      return unavailable(
        "The configured origin target does not contain this accepted landing.",
      );
    if (!(await checkAncestry(landing.base, landing.revision, call)))
      return unavailable(
        "Published history does not confirm this landing's comparison base.",
      );
  } catch (error) {
    if (signal.aborted) throw error;
    if (error instanceof ReviewSyncFailed) return unavailable(error.message);
    return unavailable(
      `Published history could not verify this accepted landing: ${gitProblem(error)}`,
    );
  }
  const read = await retainedCommitPairFiles(
    { ...landing, repository },
    signal,
  );
  if ("missing" in read)
    return unavailable(
      "The accepted landing comparison could not be read from published history.",
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
    ...withSyncFailure(syncFailure),
  };
}
