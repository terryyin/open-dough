// Done review opens authoritative completion, with verified capture recovery.
// Active stories and explicit captured runs have their own admitted reads.
// The handler admits a typed read against the kept records and answers under
// the caller's signal; the response adapter bounds that signal.
import type { ServerResponse } from "node:http";
import {
  storyReviewWaitMs,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { reviewRunChoice, reviewRunKey } from "../src/storyReviewLandedRun.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { agentProfileDirectoryOf } from "./recordsBesideBacklog.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";
import { reviewInput, type StoryReviewInput } from "./storyReviewInput.ts";
import type { AdmittedStoryReview } from "./storyReviewRequest.ts";
import {
  keptStoryReview,
  type KeptStoryReview,
} from "./storyReviewRecordAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { publishedSessionReview } from "./publishedSessionReview.ts";
import { publishedTakenReview } from "./storyReviewPublishedTaken.ts";
import { historicalStoryReview } from "./storyReviewHistorical.ts";
import { storyReviewSnapshot } from "./storyReviewWorkspaceSnapshot.ts";

export async function storyReviewResponse(
  { read }: AdmittedStoryReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    async (signal) => storyReview(await reviewInput(read, signal), signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

// Answer one review read for a story or an ad hoc session. A local session
// uses its admitted launch record. A published session uses its fetched
// project source. Refusals carry their status in `RefusedRequest`.
export async function storyReview(
  input: StoryReviewInput,
  signal: AbortSignal,
): Promise<StoryReview> {
  if ("published" in input)
    return publishedSessionReview(
      input.published,
      input.read.subject.published,
      input.read.run,
      input.now,
      signal,
    );
  if ("subject" in input.read && input.read.taken === true) {
    if (
      input.read.completed === true ||
      input.read.run !== undefined ||
      input.read.reference !== undefined
    )
      throw new RefusedRequest(400, "The Taken review request is malformed.");
    const { source, identity } = input.read.subject;
    const published = await publishedTakenReview(
      knownSource(source),
      identity,
      signal,
    );
    if (published !== undefined) return published;
  }
  const request = await keptStoryReview(input);
  const choices =
    request.runs.length === 0
      ? {}
      : { runs: request.runs.map(reviewRunChoice) };
  return { ...(await answered(request, signal)), ...choices };
}

async function answered(
  request: KeptStoryReview,
  signal: AbortSignal,
): Promise<StoryReview> {
  if ("completed" in request)
    return historicalStoryReview(
      request.completed,
      request.identity,
      request.runs,
      signal,
    );
  if ("explanation" in request)
    return {
      kind: "unavailable",
      ambiguousWorktrees: true,
      explanation: request.explanation,
    };
  if ("readSession" in request) return request.readSession(signal);
  if ("run" in request)
    return {
      ...(await landedStoryReview(request.run, signal)),
      selectedRun: reviewRunKey(request.run.record),
    };
  const { sourceId, identity, established, shown, fallback } = request;
  const workspace = await storyReviewSnapshot(
    established,
    {
      identity,
      profileDirectory: agentProfileDirectoryOf(knownSource(sourceId)),
    },
    shown,
    signal,
  );
  return workspace.kind === "unavailable" && fallback !== undefined
    ? {
        ...(await landedStoryReview(fallback, signal)),
        selectedRun: reviewRunKey(fallback.record),
      }
    : workspace;
}

export {
  storyReviewFileResponse,
  storyReviewFileTextResponse,
} from "./storyReviewFileResponse.ts";
