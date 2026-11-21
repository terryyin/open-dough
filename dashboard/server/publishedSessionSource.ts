// The adapter's read of where a published session record lives: the
// configured project's checkout at its freshly fetched trunk. An unknown
// project is refused before any Git read.
import type { PublishedSource } from "../src/publishedSource.ts";
import { fetchGitTarget } from "./gitTargetFetch.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { projectFolder } from "./projectFolders.ts";
import type { PublishedSessionSource } from "./publishedSessionReview.ts";

export async function fetchedPublishedSessionSource(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<PublishedSessionSource> {
  const repository = projectFolder(source).path;
  const call: GitCall = { cwd: repository, signal, maxBuffer: 1024 * 1024 };
  try {
    await fetchGitTarget("origin", source.ref, { ...call, signal });
  } catch {
    // Unreachable origin: the last fetched trunk still names published records.
  }
  try {
    const revision = (
      await runGit(
        ["rev-parse", "--verify", `origin/${source.ref}^{commit}`],
        call,
      )
    ).stdout.trim();
    return { repository, revision, backlogPath: source.backlogPath };
  } catch {
    throw new RefusedRequest(
      404,
      "This machine has not fetched this project's published trunk.",
    );
  }
}
