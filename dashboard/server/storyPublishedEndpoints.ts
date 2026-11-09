// The configured project's published history validates its checkout and target
// before the shared completion/claim recovery operation reads any story facts.
import { realpath } from "node:fs/promises";
import type { PublishedSource } from "../src/publishedSource.ts";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import { fetchGitTarget } from "./gitTargetFetch.ts";
import { projectFolder } from "./projectFolders.ts";
import {
  storyCompletionEndpoints,
  type PublishedStoryEndpoints,
} from "./storyCompletionEndpoints.ts";

export type {
  PublishedStoryEndpointFacts,
  PublishedStoryEndpoints,
  StoryExecutionMode,
} from "./storyCompletionEndpoints.ts";

// A named completion must still belong to this source's published target.
export async function publishedStoryEndpoints(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedCompletion?: string,
): Promise<PublishedStoryEndpoints> {
  const directory = projectFolder(source).path;
  const call: GitCall = { cwd: directory, signal, maxBuffer: 64 * 1024 * 1024 };
  const git = async (...args: string[]) =>
    (await runGit(args, call)).stdout.trim();
  try {
    if (
      (await realpath(await git("rev-parse", "--show-toplevel"))) !==
      (await realpath(directory))
    )
      return {
        kind: "unavailable",
        explanation:
          "The configured project folder is no longer this project's Git checkout.",
      };
    if (namedCompletion === undefined)
      await fetchGitTarget("origin", source.ref, { ...call, signal });
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
    return {
      kind: "unavailable",
      explanation: `Published completion history could not be read: ${gitProblem(error)}`,
    };
  }
}
