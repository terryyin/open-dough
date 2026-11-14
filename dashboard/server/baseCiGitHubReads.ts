// The GitHub reads of a branch CI judgment (`./baseCiJudgment.ts`): a failed
// acquisition as an unread judgment that says why, and the judged branch's
// commit history, marked unpublished when GitHub has no story branch of that
// name.
import {
  GitHubAcquisitionFailed,
  GitHubAcquisitionHeld,
  readGitHubActions,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  type BaseCiJudgment,
  type ListedCommit,
  unread,
} from "./baseCiNearest.ts";

const historyPage = 30;

export function githubAcquisitionUnread(
  error: unknown,
  fallback: string,
): BaseCiJudgment {
  if (error instanceof GitHubAcquisitionHeld)
    return unread(
      `GitHub directed a wait of ${String(error.waitSeconds)} s before the next request`,
    );
  if (error instanceof GitHubAcquisitionFailed) return unread(error.message);
  return unread(error instanceof Error ? error.message : fallback);
}

// Whether GitHub answered that it has no such thing (`404`).
function isNotFound(error: unknown): error is GitHubAcquisitionFailed {
  if (!(error instanceof GitHubAcquisitionFailed)) return false;
  const { failure } = error as {
    readonly failure?: { readonly kind?: unknown; readonly status?: unknown };
  };
  return failure?.kind === "http" && failure.status === 404;
}

// The branch's history, newest first; an unread judgment when it could not
// be listed, marked unpublished when GitHub has no story branch of that
// name. The configured ref is never unpublished: GitHub answers the same
// `404` for a repository it does not have or cannot show, so the trunk's
// `404` is unread with GitHub's reason.
export async function readBranchHistory(
  source: PublishedSource,
  branch: string,
  signal: AbortSignal,
): Promise<ListedCommit[] | BaseCiJudgment> {
  try {
    const commits = (await readGitHubActions(
      [
        "api",
        `repos/${source.repository}/commits?sha=${encodeURIComponent(branch)}&per_page=${String(historyPage)}`,
      ],
      signal,
    )) as ListedCommit[];
    if (!Array.isArray(commits) || commits.length === 0)
      return unread(`No commit history was returned for ${branch}`);
    return commits;
  } catch (error) {
    if (branch !== source.ref && isNotFound(error))
      return { ...unread(error.message), unpublished: true };
    return githubAcquisitionUnread(
      error,
      "The commit history could not be read",
    );
  }
}
