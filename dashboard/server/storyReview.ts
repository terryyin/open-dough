// Done review opens the published completion. Active stories and accepted
// landings have their own admitted reads.
// The handler admits a typed read against the kept records and answers under
// the caller's signal; the response adapter bounds that signal.
import type { ServerResponse } from "node:http";
import { isSessionId } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  storyReviewWaitMs,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { reviewRunChoice, reviewRunKey } from "../src/storyReviewLandedRun.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ReviewInitialSync } from "./reviewInitialSync.ts";
import { knownSource } from "./sessionAdmission.ts";
import {
  openSyncDeadline,
  reviewInput,
  type StoryReviewInput,
} from "./storyReviewInput.ts";
import {
  reviewRepositoryRead,
  ReviewSyncDeadline,
} from "./reviewRepository.ts";
import type { AdmittedStoryReview } from "./storyReviewRequest.ts";
import {
  keptStoryReview,
  type KeptStoryReview,
} from "./storyReviewRecordAdmission.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { legacySessionReview } from "./storyReviewSessionAdmission.ts";
import {
  publishedSessionReview,
  unsyncedSessionReview,
} from "./publishedSessionReview.ts";
import { publishedTakenReview } from "./storyReviewPublishedTaken.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";
import {
  recordedLandingChoices,
  recordedLandingReview,
} from "./storyReviewPublishedLanding.ts";

export async function storyReviewResponse(
  { read }: AdmittedStoryReview,
  res: ServerResponse,
  initialSync?: ReviewInitialSync,
): Promise<AgentLaunchAnswer> {
  const body = await withResponseSignal(
    res,
    async (signal) => {
      const syncDeadline = openSyncDeadline(read);
      return storyReview(
        await reviewInput(read, signal, syncDeadline),
        signal,
        syncDeadline,
        initialSync,
      );
    },
    storyReviewWaitMs,
  );
  return { status: 200, body };
}

// Answer one review read for a story or an ad hoc session. A local session
// uses its admitted launch record. A published session uses its fetched
// project source, or names the sync that failed to bring its record.
// Refusals carry their status in `RefusedRequest`. Every sync of the open
// shares its deadline, so the answer keeps within the response bound.
export async function storyReview(
  input: StoryReviewInput,
  signal: AbortSignal,
  syncDeadline: ReviewSyncDeadline = new ReviewSyncDeadline(),
  initialSync?: ReviewInitialSync,
): Promise<StoryReview> {
  const reader = reviewRepositoryRead(syncDeadline);
  if ("syncFailed" in input) return unsyncedSessionReview(input.syncFailed);
  if ("published" in input)
    return publishedSessionReview(
      input.published,
      input.read.subject.published,
      input.read.run,
      input.now,
      signal,
    );
  if ("record" in input)
    return legacySessionReview(
      input.source,
      input.record,
      input.read.run,
      signal,
      reader,
    );
  const handoff = async (source: PublishedSource) => {
    if (initialSync === undefined || input.read.initialSync === undefined)
      return false;
    const observed = await initialSync.forReview(
      source,
      signal,
      input.read.initialSync,
    );
    if (observed === "verified") syncDeadline.reuseVerifiedTrunk(source);
    return observed === "pending";
  };
  const pending = { kind: "initial-sync-required" } as const;
  if ("subject" in input.read && input.read.taken === true) {
    if (
      input.read.completed === true ||
      input.read.run !== undefined ||
      input.read.reference !== undefined
    )
      throw new RefusedRequest(400, "The Taken review request is malformed.");
    const { source, identity } = input.read.subject;
    const project = knownSource(source);
    if (await handoff(project)) return pending;
    return publishedTakenReview(project, identity, signal, {
      syncDeadline,
    });
  }
  if ("subject" in input.read) {
    const { subject, run, reference } = input.read;
    const named = run ?? reference;
    if (named !== undefined) {
      const project = knownSource(subject.source);
      if (isSessionId(named) && (await handoff(project))) return pending;
      const recorded = await recordedLandingReview(
        project,
        subject.identity,
        named,
        signal,
        reader,
      );
      if (recorded !== undefined) return recorded;
    }
  }
  const request = await keptStoryReview(input.read);
  if ("completed" in request && (await handoff(request.completed)))
    return pending;
  if (
    "run" in request &&
    request.run.record.landing?.remote === "origin" &&
    request.run.record.landing.target === `refs/heads/${request.source.ref}` &&
    (await handoff(request.source))
  )
    return pending;
  const review = await answered(request, signal, syncDeadline);
  const kept = request.runs.map(reviewRunChoice);
  const recorded =
    "completed" in request && review.kind === "published"
      ? await recordedLandingChoices(
          request.completed,
          request.identity,
          review.landingRevision,
          signal,
        )
      : [];
  const runs = [
    ...recorded,
    ...kept.filter(
      (run) =>
        !recorded.some(
          (published) =>
            published.key === run.key ||
            (published.comparison?.base === run.comparison?.base &&
              published.comparison?.revision === run.comparison?.revision),
        ),
    ),
  ];
  return { ...review, ...(runs.length === 0 ? {} : { runs }) };
}

async function answered(
  request: KeptStoryReview,
  signal: AbortSignal,
  syncDeadline: ReviewSyncDeadline,
): Promise<StoryReview> {
  if ("completed" in request)
    return (
      (await publishedStoryReview(request.completed, request.identity, signal, {
        syncDeadline,
      })) ?? {
        kind: "unavailable",
        explanation:
          "No published completion record is available for this story, so its historical changes cannot be identified.",
      }
    );
  if ("explanation" in request)
    return {
      kind: "unavailable",
      explanation: request.explanation,
    };
  return {
    ...(await landedStoryReview(
      request.run,
      signal,
      request.source,
      reviewRepositoryRead(syncDeadline),
    )),
    selectedRun: reviewRunKey(request.run.record),
  };
}

export {
  storyReviewFileResponse,
  storyReviewFileTextResponse,
} from "./storyReviewFileResponse.ts";
