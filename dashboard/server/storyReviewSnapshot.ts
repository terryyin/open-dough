// Ordinary Review opens a workspace or explicit captured run. Done Intent
// delegates its default to authoritative completion and validated capture recovery.
// Every path shares the response's bounded cancellation signal.
import type { ServerResponse } from "node:http";
import {
  storyReviewWaitMs,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { reviewRunChoice, reviewRunKey } from "../src/storyReviewLandedRun.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { agentProfileDirectoryOf } from "./recordsBesideBacklog.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { knownSource } from "./sessionAdmission.ts";
import type { AdmittedStoryReview } from "./storyReviewAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { reviewMark } from "./storyReviewMarks.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";
import { historicalStoryReview } from "./storyReviewHistorical.ts";
import { storyReviewSnapshot } from "./storyReviewWorkspaceSnapshot.ts";

export async function storyReviewResponse(
  request: AdmittedStoryReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const choices =
    request.runs.length === 0
      ? {}
      : { runs: request.runs.map(reviewRunChoice) };
  const mark =
    "established" in request
      ? await reviewMark(request.sourceId, request.identity)
      : undefined;
  const body = await withResponseSignal(
    res,
    async (signal): Promise<StoryReview> => {
      if ("historical" in request)
        return historicalStoryReview(
          request.historical,
          request.identity,
          request.runs,
          signal,
        );
      if ("published" in request)
        return (
          (await publishedStoryReview(
            request.published,
            request.identity,
            signal,
          )) ?? {
            kind: "unavailable",
            explanation:
              "No published completion record is available for this story, so its historical changes cannot be identified.",
          }
        );
      if ("explanation" in request)
        return { kind: "unavailable", explanation: request.explanation };
      let local: StoryReview;
      if ("run" in request) {
        local = {
          ...(await landedStoryReview(request.run, signal)),
          selectedRun: reviewRunKey(request.run.record),
        };
      } else {
        const { sourceId, identity, established, shown } = request;
        local = await storyReviewSnapshot(
          established,
          {
            identity,
            profileDirectory: agentProfileDirectoryOf(knownSource(sourceId)),
          },
          shown,
          mark,
          signal,
        );
        if (local.kind === "unavailable" && request.fallback !== undefined)
          local = {
            ...(await landedStoryReview(request.fallback, signal)),
            selectedRun: reviewRunKey(request.fallback.record),
          };
      }
      if (
        local.kind !== "snapshot" &&
        local.kind !== "landed" &&
        request.publishedFallback !== undefined
      ) {
        const { source, identity } = request.publishedFallback;
        const published = await publishedStoryReview(source, identity, signal);
        if (published !== undefined) return published;
      }
      return local;
    },
    storyReviewWaitMs,
  );
  return { status: 200, body: { ...body, ...choices } };
}

export {
  storyReviewFileResponse,
  storyReviewFileTextResponse,
} from "./storyReviewFileResponse.ts";
