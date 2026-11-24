// A configured project's published history, read from a repository its caller
// names: the Review repository for reviews, the execution checkout for CI.
import { realpath } from "node:fs/promises";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  defaultGitOutputLimit,
  runGit,
  gitProblem,
  type GitCall,
} from "./gitRunner.ts";
import { fetchGitTarget } from "./gitTargetFetch.ts";
import { executionCheckout } from "./executionCheckout.ts";
import {
  storyCompletionEndpoints,
  type PublishedStoryEndpoints,
} from "./storyCompletionEndpoints.ts";

export type {
  PublishedStoryEndpointFacts,
  PublishedStoryEndpoints,
  StoryExecutionMode,
} from "./storyCompletionEndpoints.ts";

// A named completion must still belong to this source's published target in
// `repository`, which its caller has already brought up to date.
export async function publishedStoryEndpoints(
  source: PublishedSource,
  repository: string,
  identity: string,
  signal: AbortSignal,
  namedCompletion?: string,
): Promise<PublishedStoryEndpoints> {
  const call: GitCall = {
    cwd: repository,
    signal,
    maxBuffer: 64 * 1024 * 1024,
  };
  const git = async (...args: string[]) =>
    (await runGit(args, call)).stdout.trim();
  try {
    const published = await git(
      "rev-parse",
      "--verify",
      `origin/${source.ref}^{commit}`,
    );
    if (namedCompletion !== undefined)
      await git("merge-base", "--is-ancestor", namedCompletion, published);
    return await storyCompletionEndpoints(
      source,
      identity,
      namedCompletion ?? published,
      call,
      namedCompletion,
    );
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable(error);
  }
}

const unavailable = (error: unknown): PublishedStoryEndpoints => ({
  kind: "unavailable",
  explanation: `Published completion history could not be read: ${gitProblem(error)}`,
});

// CI reads its execution checkout after validating it and fetching its target.
export async function checkoutStoryEndpoints(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
): Promise<PublishedStoryEndpoints> {
  const directory = executionCheckout(source).path;
  const call: GitCall = {
    cwd: directory,
    signal,
    maxBuffer: defaultGitOutputLimit,
  };
  try {
    if (
      (await realpath(
        (await runGit(["rev-parse", "--show-toplevel"], call)).stdout.trim(),
      )) !== (await realpath(directory))
    )
      return {
        kind: "unavailable",
        explanation:
          "The execution checkout no longer points to this project's Git root.",
      };
    await fetchGitTarget("origin", source.ref, { ...call, signal });
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable(error);
  }
  return publishedStoryEndpoints(source, directory, identity, signal);
}
