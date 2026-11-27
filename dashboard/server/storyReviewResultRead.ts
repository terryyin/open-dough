// A story's named comparison determines the only Git tree a browse can read.
import type { ServerResponse } from "node:http";
import { storyReviewWaitMs } from "../src/storyReviewContract.ts";
import type {
  StoryReviewResult,
  StoryReviewResultRead,
} from "../src/storyReviewResult.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { textAtTree, trackedFiles } from "./gitTreeFiles.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { reviewRepositoryPath } from "./reviewRepository.ts";
import { knownSource } from "./sessionAdmission.ts";
import { readNamedLandedReview } from "./storyReviewLandedAdmission.ts";
import {
  requirePublishedCompletion,
  requirePublishedHead,
} from "./storyReviewPublishedAdmission.ts";
import { resultAnswer, resultRevision } from "./storyReviewResultAnswer.ts";
import type { AdmittedStoryReviewResult } from "./storyReviewResultRequest.ts";

export async function storyReviewResultResponse(
  { read }: AdmittedStoryReviewResult,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    (signal) => readStoryReviewResult(read, signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

async function namedComparison(
  read: StoryReviewResultRead,
  signal: AbortSignal,
) {
  const { identity, source: project } = read.subject;
  const source = knownSource(project);
  const comparison =
    "completion" in read
      ? await requirePublishedCompletion(
          source,
          identity,
          read.completion,
          signal,
        )
      : "publishedHead" in read
        ? await requirePublishedHead(
            source,
            identity,
            read.publishedHead,
            signal,
          )
        : await readNamedLandedReview(source, identity, read.reference, signal);
  return { repository: reviewRepositoryPath(source), comparison };
}

async function readStoryReviewResult(
  read: StoryReviewResultRead,
  signal: AbortSignal,
): Promise<StoryReviewResult> {
  const { repository, comparison } = await namedComparison(read, signal);
  const revision = resultRevision(comparison, read.tree);
  const answer = await resultAnswer(
    {
      revision,
      paths: () => trackedFiles(repository, read.tree, signal),
      text: (path) => textAtTree(repository, read.tree, path, signal),
    },
    read.path,
  );
  signal.throwIfAborted();
  return answer;
}
