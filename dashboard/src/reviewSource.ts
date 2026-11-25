// The story review's reads of the launch boundary (`./storyReviewContract.ts`),
// one per endpoint, each with its query and the reader's abort signal,
// answering the shared shapes or rejecting with the refusal's words. The page
// speaks to the endpoints; `useReviewRead` keeps memo, rounds and the last
// answer above whichever source it is given.

import type { z } from "zod";
import {
  reviewInitialSyncEndpoint,
  reviewInitialSyncStatusSchema,
  type ReviewInitialSyncProgress,
} from "./reviewInitialSync.ts";
import { readDeparture } from "./sharedRead.ts";
import {
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewSchema,
  type ReviewedFileDiff,
  type ReviewedFileText,
  type StoryReview,
} from "./storyReviewContract.ts";

export type ReviewQuery = Readonly<Record<string, string>>;

type ReviewReadOptions = {
  readonly onInitialSync: (status: ReviewInitialSyncProgress) => void;
  readonly retryInitialSync: boolean;
};

export type ReviewRead<Answer> = (
  query: ReviewQuery,
  signal: AbortSignal,
  options?: ReviewReadOptions,
) => Promise<Answer>;

export type ReviewSource = {
  readonly review: ReviewRead<StoryReview>;
  readonly fileDiff: ReviewRead<ReviewedFileDiff>;
  readonly fileText: ReviewRead<ReviewedFileText>;
};

function endpointRead<Answer>(
  endpoint: string,
  schema: z.ZodType<Answer>,
  method: "GET" | "POST" = "GET",
): ReviewRead<Answer> {
  return async (query, signal) => {
    const response = await fetch(
      `${endpoint}?${new URLSearchParams(query).toString()}`,
      { method, signal, cache: "no-store" },
    );
    const answer: unknown = await response.json();
    if (!response.ok) {
      const said = (answer as { error?: unknown }).error;
      throw new Error(
        typeof said === "string" ? said : "The review was refused.",
      );
    }
    return schema.parse(answer);
  };
}

const readReview = endpointRead(storyReviewEndpoint, storyReviewSchema);
const startSync = endpointRead(
  reviewInitialSyncEndpoint,
  reviewInitialSyncStatusSchema,
  "POST",
);
const readSync = endpointRead(
  reviewInitialSyncEndpoint,
  reviewInitialSyncStatusSchema,
);

async function waitForSyncPoll(signal: AbortSignal): Promise<void> {
  if (signal.aborted) throw readDeparture(signal);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, 250);
    function cancel() {
      clearTimeout(timer);
      reject(readDeparture(signal));
    }
    signal.addEventListener("abort", cancel, { once: true });
  });
}

async function reviewWithInitialSync(
  query: ReviewQuery,
  signal: AbortSignal,
  options?: ReviewReadOptions,
) {
  let review = await readReview(query, signal);
  const source = query["source"];
  let retry = options?.retryInitialSync === true;
  while (review.kind === "initial-sync-required" && source !== undefined) {
    let status = await startSync(
      retry ? { source, retry: "true" } : { source },
      signal,
    );
    retry = false;
    if (status.kind === "running") options?.onInitialSync(status);
    while (status.kind === "running") {
      await waitForSyncPoll(signal);
      status = await readSync({ source }, signal);
    }
    if (status.kind === "failed") options?.onInitialSync(status);
    if (status.kind === "idle")
      throw new Error("The initial sync is no longer running.");
    if (status.kind !== "ready") return review;
    review = await readReview(
      { ...query, initialSync: status.revision },
      signal,
    );
  }
  return review;
}

export const pageReviewSource: ReviewSource = {
  review: reviewWithInitialSync,
  fileDiff: endpointRead(storyReviewFileEndpoint, reviewedFileDiffSchema),
  fileText: endpointRead(storyReviewFileTextEndpoint, reviewedFileTextSchema),
};
