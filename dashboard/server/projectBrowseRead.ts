// Project Intent browsing through the local authenticated read boundary
// (`./authenticatedRead.ts`): every path a published revision tracks, or one
// tracked file's literal text there. Both read the project's Review
// repository (`./reviewRepositoryStorage.ts`) and admit the revision only
// when the configured target fetched there contains it; a cold read joins
// that repository's shared target sync, and a warm one fetches nothing.

import { readingPathAt } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  defaultGitOutputLimit as maxBuffer,
  gitProblem,
  isAncestor,
  runGit,
} from "./gitRunner.ts";
import { textAtTree, trackedFiles, type SideRead } from "./gitTreeFiles.ts";
import { parsePinnedIntentRead } from "./intentReadParameters.ts";
import { parseSafeRepositoryPath } from "./reachablePaths.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";
import {
  reviewRepositoryPath,
  syncedReviewRepository,
} from "./reviewRepositoryStorage.ts";

export type ProjectBrowseRead =
  | { readonly kind: "project-tree-at"; readonly revision: string }
  | {
      readonly kind: "project-file-at";
      readonly revision: string;
      readonly path: string;
    };

// The tracked paths at the revision, or why they cannot be listed now.
export type ProjectTreeAnswer =
  | {
      readonly kind: "inventory";
      readonly revision: string;
      readonly paths: readonly string[];
    }
  | {
      readonly kind: "unavailable";
      readonly revision: string;
      readonly explanation: string;
    };

// One tracked path's text at the revision: absent, text, or unavailable.
export type ProjectFileAnswer = SideRead & {
  readonly revision: string;
  readonly path: string;
};

const unpublishedRevision: Extract<Outcome, { readonly kind: "refused" }> = {
  kind: "refused",
  status: 409,
  message: "That revision is not published on this project's target.",
};

const browseRefusal =
  "A project browse names only a pinned revision and, for a file, its repository path.";

// The project browse a request names, undefined when it names none. A file
// browse also names its repository path.
export function parseProjectBrowseRead(
  params: URLSearchParams,
): ProjectBrowseRead | RefusedParameters | undefined {
  const tree = parsePinnedIntentRead(
    params,
    "project-tree",
    "project-tree-at",
    browseRefusal,
  );
  if (tree !== undefined) return tree;
  const withoutPath = new URLSearchParams(params);
  withoutPath.delete("path");
  const file = parsePinnedIntentRead(
    withoutPath,
    "project-file",
    "project-file-at",
    browseRefusal,
  );
  if (file?.kind !== "project-file-at") return file;
  const path = parseSafeRepositoryPath(params.get("path"));
  return path === undefined
    ? refused("The repository path is not usable.")
    : { ...file, path };
}

// What a project browse names as being read before it answers.
export function readingProjectBrowseOf(
  source: PublishedSource,
  read: ProjectBrowseRead,
): string {
  return read.kind === "project-file-at"
    ? readingPathAt(read.path, read.revision)
    : `the tracked files of ${source.repository} at ${read.revision}`;
}

// The revision's tree when the target last fetched into `repository`
// contains it; undefined otherwise, including before any fetch.
async function publishedTree(
  repository: string,
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  const call = { cwd: repository, signal, maxBuffer };
  const contained = await isAncestor(
    revision,
    `refs/remotes/origin/${source.ref}`,
    call,
  );
  signal.throwIfAborted();
  if (!contained) return undefined;
  return (
    await runGit(["rev-parse", "--verify", `${revision}^{tree}`], call)
  ).stdout.trim();
}

export async function performProjectBrowseRead(
  source: PublishedSource,
  read: ProjectBrowseRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const { revision } = read;
  const repository = reviewRepositoryPath(source);
  let tree: string | undefined;
  try {
    tree =
      (await publishedTree(repository, source, revision, signal)) ??
      (await syncedReviewRepository(source, signal).then((synced) =>
        publishedTree(synced, source, revision, signal),
      ));
  } catch (error) {
    signal.throwIfAborted();
    return answered({
      kind: "unavailable",
      revision,
      explanation: `The project's published files could not be read: ${gitProblem(error)}`,
    });
  }
  if (tree === undefined) return unpublishedRevision;
  if (read.kind === "project-file-at") {
    const text = await textAtTree(repository, tree, read.path, signal);
    signal.throwIfAborted();
    return answered({ ...text, revision, path: read.path });
  }
  try {
    const paths = await trackedFiles(repository, tree, signal);
    return answered({ kind: "inventory", revision, paths });
  } catch (error) {
    signal.throwIfAborted();
    return answered({
      kind: "unavailable",
      revision,
      explanation: `The project's tracked files could not be listed: ${gitProblem(error)}`,
    });
  }
}
