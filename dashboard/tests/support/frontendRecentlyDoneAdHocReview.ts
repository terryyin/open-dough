// Controlled review answers and Done ad hoc records for the Recently done
// ad hoc review frontend journeys
// (../../frontend-tests/sessions/recently-done-ad-hoc-review.spec.ts).

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchLanding } from "../../src/launchLanding.ts";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { frontendReviewIds } from "./frontendStoryReview.ts";

export const landedTitle = "Open Dough session";
export const noLandingTitle = "Default session";
export const emptyTitle = "Empty session";
export const unreadableTitle = "Unreadable session";
export const landedSession = "ad-hoc-landed-review";
export const noLandingSession = "ad-hoc-no-landing-review";
export const emptySession = "ad-hoc-empty-review";
export const unreadableSession = "ad-hoc-unreadable-review";
export const launchedAt = "2026-01-02T12:00:00.000Z";
export const deliveredPath = "delivered.txt";
export const base = frontendReviewIds.baseline;
export const revision = frontendReviewIds.tree;
export const notCaptured = "This session's changes were not captured.";
export const unreadableRepo =
  "The captured landing repository is missing or unreadable.";
export const emptyComparison =
  "No changes: this session's delivered comparison is empty.";

export function landedAnswer(
  files: Extract<StoryReview, { kind: "landed" }>["files"] = [
    {
      kind: "modified",
      path: deliveredPath,
      lines: { added: 1, removed: 1 },
    },
  ],
): Extract<StoryReview, { kind: "landed" }> {
  const landing = makeMe.aLaunchLanding.comparing({ base, revision }).please();
  return {
    kind: "landed",
    baseline: base,
    tree: revision,
    files,
    landing: landedReviewContextSchema.parse({
      ...landing,
      workflow: "ad-hoc",
      launchedAt,
    }),
  };
}

export function unavailableAnswer(explanation: string): StoryReview {
  return { kind: "landing-unavailable", explanation };
}

export function doneAdHoc(
  title: string,
  sessionId: string,
  shortId: string,
  doneMsAgo: number,
  landing?: LaunchLanding,
) {
  const now = Date.now();
  let record = makeMe.aLaunchRecord
    .adHoc({ title, instruction: `${title}.` })
    .inClaudeSession({ sessionId, shortId })
    .launchedAt(new Date(now - doneMsAgo - 60_000).toISOString())
    .markedDoneAt(new Date(now - doneMsAgo).toISOString());
  if (landing !== undefined) record = record.withLanding(landing);
  return record.please();
}
