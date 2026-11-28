// REST ref resolution for readers outside the Board's verified Git check.

import { GhFailure, isNotFound, runGh } from "./ghRead.ts";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";

// Feedback maintenance and follow-up stories resolve a ref before reading
// files at that commit. The request asks for the SHA alone.
function refEndpoint(repository: string, ref: string): string {
  return `repos/${repository}/commits/${ref.split("/").map(encodeURIComponent).join("/")}`;
}

function commitNamedBy(sha: string): string {
  const revision = sha.trim();
  if (!commitShaPattern.test(revision)) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return revision;
}

// Which commit `ref` names.
export async function resolveRevisionViaGh(
  repository: string,
  ref: string,
  signal: AbortSignal,
): Promise<string> {
  return commitNamedBy(
    await runGh(["api", refEndpoint(repository, ref), "--jq", ".sha"], signal),
  );
}

// Which commit the published branch `branch` names now, or undefined when
// no such branch is published (GitHub's `404`). Only the exact branch head is
// asked for: a tag or commit spelled like the branch is never taken for it.
export async function resolveBranchHeadViaGh(
  repository: string,
  branch: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  const encoded = branch.split("/").map(encodeURIComponent).join("/");
  try {
    return commitNamedBy(
      await runGh(
        [
          "api",
          `repos/${repository}/git/ref/heads/${encoded}`,
          "--jq",
          ".object.sha",
        ],
        signal,
      ),
    );
  } catch (error) {
    if (isNotFound(error)) {
      return undefined;
    }
    throw error;
  }
}
