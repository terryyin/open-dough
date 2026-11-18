// How the story-review service substitute answers one request: snapshot,
// range, file diff and file text answers, each staged by key, otherwise
// settled from the defaults, and the hold taken for that answer. Both the
// Playwright route substitute and the mounted fetch answers call it, so it
// imports neither Playwright nor Node; `Hold` is whatever the caller holds an
// answer with.
import {
  reviewedFileTextSchema,
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewRangeEndpoint,
  type ReviewedFileDiff,
  type ReviewedFileText,
  type ReviewRange,
  type StoryReview,
} from "../../src/storyReviewContract.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
} from "./frontendStoryReviewFixtures.ts";

export type Bucket<T, Hold> = {
  readonly next: Map<string, T>;
  readonly holds: Map<string, Hold>;
  settle: () => T;
};

export const keyFor = (value: string | undefined) => value ?? "*";

function takeQueued<T>(map: Map<string, T>, key: string) {
  const staged = map.get(key) ?? map.get("*");
  if (map.has(key)) map.delete(key);
  else if (staged !== undefined) map.delete("*");
  return staged;
}

// One ask of a story-review endpoint, with the query it named.
export type ReviewAsk = {
  readonly endpoint: string;
  readonly query: Readonly<Record<string, string>>;
};

export type ReviewBuckets<Hold> = {
  readonly asked: ReviewAsk[];
  snapshot: StoryReview;
  readonly snapshots: Bucket<StoryReview, Hold>;
  readonly historicalSnapshots: Map<string, StoryReview>;
  // The answer for an ask naming `run`, by that run.
  readonly runSnapshots: Map<string, StoryReview>;
  readonly ranges: Bucket<ReviewRange, Hold>;
  readonly files: Bucket<ReviewedFileDiff, Hold>;
  readonly texts: Bucket<ReviewedFileText, Hold>;
  readonly fileByPath: Map<string, ReviewedFileDiff>;
  readonly textByPath: Map<string, ReviewedFileText>;
};

const emptyBucket = <T, Hold>(settle: () => T): Bucket<T, Hold> => ({
  next: new Map(),
  holds: new Map(),
  settle,
});

const defaultFileText = () =>
  reviewedFileTextSchema.parse({
    kind: "text",
    baseline: null,
    tree: "story\n",
  });

export function createReviewBuckets<Hold>(
  initial: StoryReview,
): ReviewBuckets<Hold> {
  const asked: ReviewAsk[] = [];
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
    historicalSnapshots: new Map(),
    runSnapshots: new Map(),
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
    texts: emptyBucket(defaultFileText),
    fileByPath: new Map(),
    textByPath: new Map(),
  };
}

export type StoryReviewRuleAnswer<Hold> = {
  // Settles the body; a held answer calls it once the hold is released.
  readonly body: () => unknown;
  readonly hold: Hold | undefined;
};

function answerFrom<T, Hold>(
  bucket: Bucket<T, Hold>,
  key: string,
  settle: () => T = () => bucket.settle(),
): StoryReviewRuleAnswer<Hold> {
  const planned = takeQueued(bucket.next, key);
  const hold = takeQueued(bucket.holds, key);
  return { body: () => planned ?? settle(), hold };
}

// How each story-review endpoint answers an ask.
type EndpointAnswer = <Hold>(
  state: ReviewBuckets<Hold>,
  params: URLSearchParams,
) => StoryReviewRuleAnswer<Hold>;

const endpointAnswers = new Map<string, EndpointAnswer>([
  [
    storyReviewEndpoint,
    (state, params) => {
      const identity = params.get("identity") ?? "";
      return answerFrom(state.snapshots, identity, () =>
        params.get("historical") === "true"
          ? (state.historicalSnapshots.get(identity) ?? state.snapshot)
          : (state.runSnapshots.get(params.get("run") ?? "") ?? state.snapshot),
      );
    },
  ],
  [storyReviewRangeEndpoint, (state) => answerFrom(state.ranges, "*")],
  [
    storyReviewFileEndpoint,
    (state, params) => {
      const path = params.get("path") ?? "";
      return answerFrom(
        state.files,
        path,
        () =>
          state.fileByPath.get(path) ??
          state.fileByPath.get("*") ??
          frontendFileDiff(path || "story.txt", ["+story"]),
      );
    },
  ],
  [
    storyReviewFileTextEndpoint,
    (state, params) => {
      const path = params.get("path") ?? "";
      return answerFrom(
        state.texts,
        path,
        () =>
          state.textByPath.get(path) ??
          state.textByPath.get("*") ??
          defaultFileText(),
      );
    },
  ],
]);

// The paths the story-review service answers.
export const storyReviewPaths: ReadonlySet<string> = new Set(
  endpointAnswers.keys(),
);

// Records the ask and answers it, or returns undefined for a path that is not
// a story-review endpoint.
export function answerStoryReview<Hold>(
  state: ReviewBuckets<Hold>,
  pathname: string,
  params: URLSearchParams,
): StoryReviewRuleAnswer<Hold> | undefined {
  const answer = endpointAnswers.get(pathname);
  if (!answer) return undefined;
  state.asked.push({ endpoint: pathname, query: Object.fromEntries(params) });
  return answer(state, params);
}
