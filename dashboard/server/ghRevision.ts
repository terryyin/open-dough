// Which commit a name resolves to, for the local authenticated read boundary
// (`./authenticatedRead.ts`): the commit a catalog source's ref names, the
// conditional check that asks only whether it still names the same commit,
// and which commit a published story branch's head names. How `gh` runs and
// fails is `./ghRead.ts`.

import {
  classify,
  execGh,
  GhFailure,
  isNotFound,
  runGh,
  type GhFailureReason,
} from "./ghRead";
import { parseIncluded, type IncludedAnswer } from "./includedAnswer";
import { directedWaitSeconds } from "./rateLimitDirection";
import { commitShaPattern } from "../src/authenticatedReadRules";

// The one GitHub endpoint that says which commit a ref names; both the
// resolving read and the conditional check ask it for `.sha` alone.
function refEndpoint(repository: string, ref: string): string {
  return `repos/${repository}/commits/${ref}`;
}

function commitNamedBy(sha: string): string {
  const revision = sha.trim();
  if (!commitShaPattern.test(revision)) {
    throw new GhFailure({ kind: "no-commit" });
  }
  return revision;
}

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

// A refused answer that says when to ask again is a rate limit, whatever
// else `gh` printed: GitHub directs a wait with `Retry-After`, or with
// `X-RateLimit-Reset` once `X-RateLimit-Remaining` reaches zero, on its `403`
// and `429` answers. Only the validated wait leaves this module.
function limitedAsDirected(
  answer: IncludedAnswer | undefined,
): GhFailureReason | undefined {
  if (answer?.status !== 403 && answer?.status !== 429) {
    return undefined;
  }
  const waitSeconds = directedWaitSeconds(answer.headers, Date.now());
  return waitSeconds === undefined
    ? undefined
    : { kind: "rate-limited", status: answer.status, waitSeconds };
}

// A commit a ref named, and the entity tag GitHub gave that answer.
export type RevisionAnswer = {
  readonly revision: string;
  readonly etag: string | undefined;
};

// Asks GitHub which commit `ref` names now, conditionally on an earlier
// answer. GitHub answers `304 Not Modified` when that answer still holds,
// which `gh api` reports by exiting 1; that status is recognized from the
// included status line before the exit is ever treated as a failure, and
// every other non-success is classified as any read failure is.
export async function checkRevisionViaGh(
  repository: string,
  ref: string,
  earlier: RevisionAnswer | undefined,
  signal: AbortSignal,
): Promise<RevisionAnswer> {
  const conditional =
    earlier?.etag === undefined ? [] : ["-H", `If-None-Match: ${earlier.etag}`];
  const { error, stdout, stderr } = await execGh(
    [
      "api",
      "--include",
      ...conditional,
      refEndpoint(repository, ref),
      "--jq",
      ".sha",
    ],
    signal,
  );
  const answer = signal.aborted ? undefined : parseIncluded(stdout);
  if (answer?.status === 304 && earlier?.etag !== undefined) {
    return earlier;
  }
  if (error || answer?.status !== 200) {
    throw new GhFailure(
      limitedAsDirected(answer) ??
        (error ? classify(error, stderr) : { kind: "failed" }),
    );
  }
  return {
    revision: commitNamedBy(answer.body),
    etag: answer.headers.get("etag"),
  };
}
