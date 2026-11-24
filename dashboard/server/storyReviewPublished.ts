// A completed story's immutable comparison comes from published done/profile
// history in its configured project, independently of local dashboard launches.
// Endpoint facts name the completion; attribution of commits, merge edits
// and merge conflicts stays here.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import { executionCheckout } from "./executionCheckout.ts";
import {
  publishedStoryAttribution,
  type PublishedStoryCommitEvidence,
} from "./storyCompletedCommits.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";
import { trunkLess } from "./storyPublishedCommits.ts";
import { compareOriginalTrees, listedFrom } from "./storyReviewComparison.ts";

export async function publishedStoryReview(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedCompletion?: string,
): Promise<StoryReview | undefined> {
  const unavailable = (explanation: string): StoryReview => ({
    kind: "unavailable",
    explanation,
  });
  try {
    const endpoints = await publishedStoryEndpoints(
      source,
      identity,
      signal,
      namedCompletion,
    );
    if (endpoints.kind === "absent") return undefined;
    if (endpoints.kind === "unavailable")
      return unavailable(endpoints.explanation);
    const { facts, claim } = endpoints;
    const directory = executionCheckout(source).path;
    const call: GitCall = {
      cwd: directory,
      signal,
      maxBuffer: 64 * 1024 * 1024,
    };
    const compared = await publishedStoryComparison(
      claim,
      facts.completion,
      facts.mode === "story-branch" ? facts.storyStart : undefined,
      call,
    );
    if ("explanation" in compared) return unavailable(compared.explanation);
    return {
      kind: "published",
      completion: facts.completion,
      ...(facts.mode === "trunk"
        ? { landingRevision: facts.completion }
        : facts.landing === undefined
          ? {}
          : { landingRevision: facts.landing.merge }),
      completedAt: facts.completedAt,
      agent: facts.agent,
      remote: "origin",
      target: source.ref,
      ...compared,
    };
  } catch (error) {
    return unavailable(
      `Published completion history could not be read: ${gitProblem(error)}`,
    );
  }
}

// The head and the story-owned commits yield the same comparison for live and
// completed published reviews. Owning merge conflicts keep their literal base.
export async function publishedStoryComparison(
  evidence: PublishedStoryCommitEvidence,
  head: string,
  mergedFrom: string | undefined,
  call: GitCall,
) {
  const attributed = await publishedStoryAttribution(evidence, head, call);
  if ("explanation" in attributed) return attributed;
  const less = await trunkLess(attributed.commits, head, call);
  if (less === undefined)
    return {
      explanation:
        "This machine's Git cannot separate this story's published changes from other work.",
    };
  const tree = (
    await runGit(["rev-parse", `${head}^{tree}`], call)
  ).stdout.trim();
  const mixed = new Map([...less.inseparable, ...attributed.resolutions]);
  const withMerged =
    mergedFrom === undefined
      ? undefined
      : await compareOriginalTrees(mergedFrom, tree, call);
  return {
    baseline: less.tree,
    tree,
    files: await listedFrom(less.tree, tree, mixed, less.tree, call),
    ...(withMerged === undefined ? {} : { withMerged }),
  };
}
