// Route install helpers for ./frontendStoryReview.ts.

import type { Page, Route } from "@playwright/test";
import {
  markReviewedAnswerSchema,
  markReviewedRequestSchema,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewMarkEndpoint,
  storyReviewRangeEndpoint,
  storyReviewSchema,
  type MarkReviewedAnswer,
  type ReviewedFileDiff,
  type ReviewedFileText,
  type ReviewRange,
  type StoryReview,
} from "../../src/storyReviewContract.ts";

export {
  markReviewedAnswerSchema,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  reviewRangeSchema,
  storyReviewSchema,
};
import {
  frontendFileDiff,
  frontendReviewIds,
} from "./frontendStoryReviewFixtures.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
  type AnswerHold,
  type HeldAnswer,
} from "./frontendSubstituteAnswers.ts";

export type Bucket<T> = {
  readonly next: Map<string, T>;
  readonly holds: Map<string, AnswerHold>;
  settle: () => T;
};

export const keyFor = (value: string | undefined) => value ?? "*";

export function takeQueued<T>(map: Map<string, T>, key: string) {
  const staged = map.get(key) ?? map.get("*");
  if (map.has(key)) map.delete(key);
  else if (staged !== undefined) map.delete("*");
  return staged;
}

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

async function answerBucket<T>(
  route: Route,
  asked: string[],
  endpoint: string,
  key: string,
  bucket: Bucket<T>,
  settle: () => T = () => bucket.settle(),
) {
  asked.push(endpoint);
  const planned = takeQueued(bucket.next, key);
  const hold = takeQueued(bucket.holds, key);
  await answerHeld(hold, async () => {
    await fulfillJson(route, planned ?? settle());
  });
}

export type ReviewBuckets = {
  readonly asked: string[];
  snapshot: StoryReview;
  readonly snapshots: Bucket<StoryReview>;
  readonly ranges: Bucket<ReviewRange>;
  readonly files: Bucket<ReviewedFileDiff>;
  readonly texts: Bucket<ReviewedFileText>;
  readonly marks: Bucket<MarkReviewedAnswer>;
  readonly fileByPath: Map<string, ReviewedFileDiff>;
  readonly textByPath: Map<string, ReviewedFileText>;
  markAnswer: MarkReviewedAnswer | undefined;
};

const emptyBucket = <T>(settle: () => T): Bucket<T> => ({
  next: new Map(),
  holds: new Map(),
  settle,
});

export function createReviewBuckets(initial: StoryReview): ReviewBuckets {
  const asked: string[] = [];
  let snapshot = initial;
  return {
    asked,
    get snapshot() {
      return snapshot;
    },
    set snapshot(value) {
      snapshot = value;
    },
    snapshots: emptyBucket(() => snapshot),
    ranges: emptyBucket(() => ({
      kind: "comparison" as const,
      from: frontendReviewIds.baseline,
      tree: frontendReviewIds.tree,
      files:
        snapshot.kind === "snapshot"
          ? snapshot.files
          : [
              {
                kind: "added" as const,
                path: "story.txt",
                lines: { added: 1, removed: 0 },
              },
            ],
      trunkIntegrated: false,
    })),
    files: emptyBucket(() => frontendFileDiff("story.txt", ["+story"])),
    texts: emptyBucket(() =>
      reviewedFileTextSchema.parse({
        kind: "text",
        baseline: null,
        tree: "story\n",
      }),
    ),
    marks: emptyBucket(() => {
      throw new Error("mark settle unused");
    }),
    fileByPath: new Map(),
    textByPath: new Map(),
    markAnswer: undefined,
  };
}

export async function installReviewRoutes(page: Page, state: ReviewBuckets) {
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    (route) =>
      answerBucket(
        route,
        state.asked,
        storyReviewEndpoint,
        new URL(route.request().url()).searchParams.get("identity") ?? "",
        state.snapshots,
      ),
  );
  await page.route(
    (url) => url.pathname === storyReviewRangeEndpoint,
    (route) =>
      answerBucket(
        route,
        state.asked,
        storyReviewRangeEndpoint,
        "*",
        state.ranges,
      ),
  );
  await page.route(
    (url) => url.pathname === storyReviewFileEndpoint,
    (route) => {
      const path =
        new URL(route.request().url()).searchParams.get("path") ?? "";
      return answerBucket(
        route,
        state.asked,
        storyReviewFileEndpoint,
        path,
        state.files,
        () =>
          state.fileByPath.get(path) ??
          state.fileByPath.get("*") ??
          frontendFileDiff(path || "story.txt", ["+story"]),
      );
    },
  );
  await page.route(
    (url) => url.pathname === storyReviewFileTextEndpoint,
    (route) => {
      const path =
        new URL(route.request().url()).searchParams.get("path") ?? "";
      return answerBucket(
        route,
        state.asked,
        storyReviewFileTextEndpoint,
        path,
        state.texts,
        () =>
          state.textByPath.get(path) ??
          state.textByPath.get("*") ??
          reviewedFileTextSchema.parse({
            kind: "text",
            baseline: null,
            tree: "story\n",
          }),
      );
    },
  );
  await page.route(
    (url) => url.pathname === storyReviewMarkEndpoint,
    async (route) => {
      state.asked.push(storyReviewMarkEndpoint);
      const planned = takeQueued(state.marks.next, "*");
      const hold = takeQueued(state.marks.holds, "*");
      await answerHeld(hold, async () => {
        const request = markReviewedRequestSchema.parse(
          route.request().postDataJSON(),
        );
        const body =
          planned ??
          state.markAnswer ??
          markReviewedAnswerSchema.parse({
            kind: "marked",
            mark: {
              tree: request.tree,
              baseline: request.baseline,
              markedAt: "2026-01-01T00:00:00.000Z",
            },
          });
        if (body.kind === "marked" && state.snapshot.kind === "snapshot") {
          // Object.assign keeps no-param-reassign clean on the accessor.
          Object.assign(state, {
            snapshot: { ...state.snapshot, mark: body.mark },
          });
        }
        await fulfillJson(route, body);
      });
    },
  );
}
