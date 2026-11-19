// The story-review service's answer buckets held through the Playwright page.
import type { Page } from "@playwright/test";
import {
  createReviewBuckets as createRuleBuckets,
  keyFor,
  type Bucket as RuleBucket,
  type ReviewBuckets as RuleBuckets,
} from "./frontendStoryReviewRule.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

export { keyFor };
export type Bucket<T> = RuleBucket<T, AnswerHold>;
export type ReviewBuckets = RuleBuckets<AnswerHold>;

export const createReviewBuckets = (initial: StoryReview): ReviewBuckets =>
  createRuleBuckets<AnswerHold>(initial);

export function controls<T>(page: Page, bucket: Bucket<T>) {
  return {
    answerNext: (body: T, key?: string) => {
      bucket.next.set(keyFor(key), body);
    },
    holdNext: (key?: string): HeldAnswer => {
      const { held, hold } = holdAnswer(page);
      bucket.holds.set(keyFor(key), hold);
      return held;
    },
  };
}
