// A completed story's immutable comparison comes from published done/profile
// history in its configured project, independently of local dashboard launches.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import { projectFolder } from "./projectFolders.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";
import { trunkLess } from "./storyPublishedCommits.ts";
import { listedFrom } from "./storyReviewComparison.ts";

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
    const { facts } = endpoints;
    const directory = projectFolder(source).path;
    const call: GitCall = {
      cwd: directory,
      signal,
      maxBuffer: 64 * 1024 * 1024,
    };
    const git = async (...args: string[]) =>
      (await runGit(args, call)).stdout.trim();
    const less = await trunkLess(facts.commits, facts.completion, call);
    if (less === undefined)
      return unavailable(
        "This machine's Git cannot separate this story's published changes from other work.",
      );
    const tree = await git("rev-parse", `${facts.completion}^{tree}`);
    // A resolved integration file includes both writers, regardless of whether
    // reversing single-parent story commits could otherwise hide that file.
    const mixed = new Map([...less.inseparable, ...facts.resolutions]);
    return {
      kind: "published",
      completion: facts.completion,
      completedAt: facts.completedAt,
      agent: facts.agent,
      remote: "origin",
      target: source.ref,
      baseline: less.tree,
      tree,
      files: await listedFrom(less.tree, tree, mixed, facts.completion, call),
    };
  } catch (error) {
    return unavailable(
      `Published completion history could not be read: ${gitProblem(error)}`,
    );
  }
}
