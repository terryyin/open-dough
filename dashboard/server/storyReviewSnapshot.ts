// Ordinary Review opens a workspace or explicit captured run. Done Intent
// delegates its default to authoritative completion and validated capture recovery.
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
import { knownSource } from "./sessionAdmission.ts";
import { keptRecords } from "./launchRecordStore.ts";
import {
  isReviewedSessionSubject,
  type ReviewedSessionSubject,
} from "../src/reviewedWorkSubject.ts";
import type { KeptSessionState } from "./storyReviewSessionAdmission.ts";
import type { AdmittedStoryReview } from "./storyReviewRequest.ts";
import {
  keptStoryReview,
  type KeptStoryReview,
  type StoryReviewInput,
} from "./storyReviewRecordAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";
import { historicalStoryReview } from "./storyReviewHistorical.ts";
import { storyReviewSnapshot } from "./storyReviewWorkspaceSnapshot.ts";

export async function storyReviewResponse(
  { read }: AdmittedStoryReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  const { subject } = read;
  const input: StoryReviewInput = isReviewedSessionSubject(subject)
    ? { read: { ...read, subject }, kept: await keptSessionState(subject) }
    : { read: { ...read, subject } };
  const body = await withResponseSignal(
    res,
    (signal) => storyReview(input, signal),
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

// The adapter reads the session's kept launch records on every request; an
// unknown source is refused here, before any record is read.
async function keptSessionState(
  subject: ReviewedSessionSubject,
): Promise<KeptSessionState> {
  const source = knownSource(subject.source);
  return { records: await keptRecords(source.id) };
}

// Answers one review read for a story or an ad hoc session. A session read
// answers from the kept session state it carries. A refusal the kept state
// decides is thrown as `RefusedRequest` with its status.
export async function storyReview(
  input: StoryReviewInput,
  signal: AbortSignal,
): Promise<StoryReview> {
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
  if ("readSession" in request) return request.readSession(signal);
  let local: StoryReview;
  if ("run" in request) {
    local = await landedStoryReview(request.run, signal);
    if (request.runs.length > 0)
      local = {
        ...local,
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
}

export {
  storyReviewFileResponse,
  storyReviewFileTextResponse,
} from "./storyReviewFileResponse.ts";
