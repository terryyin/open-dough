// Admit a named or retained landing, published completion, or kept session.
import {
  preferredReviewRun,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { namedReviewRun } from "./storyReviewRunAdmission.ts";
import {
  admittedSessionReview,
  type AdmittedSessionReview,
} from "./storyReviewSessionAdmission.ts";
import type { KeptStoryReviewInput } from "./storyReviewInput.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewedStorySubject } from "../src/reviewedWorkSubject.ts";
import type { StoryReviewRead } from "../src/storyReviewRead.ts";

export type KeptStoryReview =
  | {
      readonly kind: "story-review";
      readonly completed: PublishedSource;
      readonly identity: string;
      readonly runs: readonly ReviewLandedRun[];
    }
  | {
      readonly kind: "story-review";
      readonly explanation: string;
      readonly runs: readonly ReviewLandedRun[];
    }
  | {
      readonly kind: "story-review";
      readonly run: ReviewLandedRun;
      readonly runs: readonly ReviewLandedRun[];
    }
  | AdmittedSessionReview;

async function admittedIdentityReview(
  read: StoryReviewRead & { readonly subject: ReviewedStorySubject },
): Promise<KeptStoryReview> {
  const found = await namedReviewRun(
    read.subject.source,
    read.subject.identity,
    read,
  );
  if (found.run !== undefined)
    return { kind: "story-review", run: found.run, runs: found.runs };
  const { source, identity, runs } = found;
  if (read.completed === true)
    return {
      kind: "story-review",
      completed: source,
      identity,
      runs,
    };
  const fallback = preferredReviewRun(runs, ({ record }) => record.landing);
  return fallback === undefined
    ? {
        kind: "story-review",
        explanation: "No published comparison is available for this story.",
        runs,
      }
    : { kind: "story-review", run: fallback, runs };
}

// Admit a story read or select a comparison from the admitted session record.
export async function keptStoryReview(
  input: KeptStoryReviewInput,
): Promise<KeptStoryReview> {
  if ("record" in input)
    return admittedSessionReview(input.record, input.read.run);
  return admittedIdentityReview(input.read);
}
