// Admit a story’s named or retained landing, or its published completion.
import {
  preferredReviewRun,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { namedReviewRun } from "./storyReviewRunAdmission.ts";
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
      readonly source: PublishedSource;
      readonly runs: readonly ReviewLandedRun[];
    };

export async function keptStoryReview(
  read: StoryReviewRead & { readonly subject: ReviewedStorySubject },
): Promise<KeptStoryReview> {
  const found = await namedReviewRun(
    read.subject.source,
    read.subject.identity,
    read,
  );
  if (found.run !== undefined)
    return {
      kind: "story-review",
      run: found.run,
      source: found.source,
      runs: found.runs,
    };
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
    : { kind: "story-review", run: fallback, source, runs };
}
