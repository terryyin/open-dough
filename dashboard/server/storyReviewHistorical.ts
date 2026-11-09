// Done Intent follows the completed story, independently of whichever launch
// happened to retain a readable first-publication capture.
import path from "node:path";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import {
  reviewRunKey,
  type ReviewLandedRun,
} from "../src/storyReviewLandedRun.ts";
import { isAncestor, runGit, type GitCall } from "./gitRunner.ts";
import { doneRecordDirectoryOf } from "./recordsBesideBacklog.ts";
import { storyCompletionEndpoints } from "./storyCompletionEndpoints.ts";
import { landedStoryReview } from "./storyReviewLanded.ts";
import { publishedStoryReview } from "./storyReviewPublished.ts";

// A capture proves a first delivery. Only complete claim/completion recovery
// at its exact result can also establish that it is this story's Done result.
async function completedCapture(
  source: PublishedSource,
  identity: string,
  run: ReviewLandedRun,
  signal: AbortSignal,
): Promise<StoryReview | undefined> {
  const { record, established } = run;
  const landing = record.landing;
  if (
    record.request.workflow !== "execution" ||
    record.request.source !== source.id ||
    landing === undefined ||
    landing.identity !== identity ||
    landing.target !== `refs/heads/${source.ref}` ||
    landing.target !== `refs/heads/${established.target}` ||
    landing.remote !== established.remote
  )
    return undefined;
  const call: GitCall = {
    cwd: landing.repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  try {
    if (!(await isAncestor(landing.base, landing.revision, call)))
      return undefined;
    const file = path.posix.join(
      doneRecordDirectoryOf(source),
      doneRecordFileName(identity),
    );
    if (
      (
        await runGit(["ls-tree", "--name-only", landing.base, "--", file], call)
      ).stdout.trim() !== ""
    )
      return undefined;
    const completed = await storyCompletionEndpoints(
      source,
      identity,
      landing.revision,
      call,
      landing.revision,
    );
    if (
      completed.kind !== "facts" ||
      completed.facts.completion !== landing.revision
    )
      return undefined;
    const review = await landedStoryReview(run, signal);
    return review.kind === "landed"
      ? { ...review, selectedRun: reviewRunKey(record) }
      : undefined;
  } catch (error) {
    if (signal.aborted) throw error;
    return undefined;
  }
}

export async function historicalStoryReview(
  source: PublishedSource,
  identity: string,
  runs: readonly ReviewLandedRun[],
  signal: AbortSignal,
): Promise<StoryReview> {
  const published = await publishedStoryReview(source, identity, signal);
  if (published?.kind === "published") return published;
  for (const run of runs) {
    signal.throwIfAborted();
    const captured = await completedCapture(source, identity, run, signal);
    if (captured !== undefined) return captured;
  }
  return (
    published ?? {
      kind: "unavailable",
      explanation:
        "No published completion record is available for this story, so its historical changes cannot be identified.",
    }
  );
}
