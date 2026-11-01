// Observes the origin target's CI for a new execution start: the newest
// result of the project's selected check at the target head or its nearest
// ancestor that has one. Pass starts without asking; every other state is
// answered for the developer to confirm. ADR 0008: observe without owning;
// nothing is kept beyond the request. GitHub Actions and command-adapter
// (ciAdapter discover) projects share one judgment rule.
import { createCommandAcquisition } from "../../src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs";
import {
  createGitHubActions,
  GitHubAcquisitionFailed,
  GitHubAcquisitionHeld,
  readGitHubActions,
} from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import { readCiConfiguration } from "../../src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { BaseCiFound, BaseCiState } from "../src/baseCiConfirmation.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  judgeNearest,
  type ListedCommit,
  type ListedRun,
  unread,
} from "./baseCiNearest.ts";
import type { ProjectFolder } from "./projectFolders.ts";

export type BaseCiJudgment =
  | {
      readonly state: "pass";
      readonly revision: string;
      readonly subject: string;
      readonly laterWithoutResult: number;
      readonly runUrl?: string;
    }
  | {
      readonly state: BaseCiState;
      readonly revision: string;
      readonly subject: string;
      readonly laterWithoutResult: number;
      readonly reason?: string;
      readonly runUrl?: string;
    };

const historyPage = 30;

function githubAcquisitionUnread(
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

async function readTargetHistory(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<ListedCommit[] | BaseCiJudgment> {
  try {
    const commits = (await readGitHubActions(
      [
        "api",
        `repos/${source.repository}/commits?sha=${encodeURIComponent(source.ref)}&per_page=${String(historyPage)}`,
      ],
      signal,
    )) as ListedCommit[];
    if (!Array.isArray(commits) || commits.length === 0)
      return unread("No commit history was returned for the origin target");
    return commits;
  } catch (error) {
    return githubAcquisitionUnread(
      error,
      "The commit history could not be read",
    );
  }
}

async function judgeWithRuns(
  source: PublishedSource,
  signal: AbortSignal,
  loadRuns: () => Promise<ListedRun[]>,
  unreadOnError: (error: unknown) => BaseCiJudgment,
): Promise<BaseCiJudgment> {
  const commits = await readTargetHistory(source, signal);
  if (!Array.isArray(commits)) return commits;
  try {
    return judgeNearest(commits, await loadRuns());
  } catch (error) {
    return unreadOnError(error);
  }
}

type CiConfiguration = {
  readonly adapter: readonly string[] | undefined;
  readonly workflow: string;
};

function ciConfiguration(folder: string): CiConfiguration {
  return readCiConfiguration(folder);
}

async function judgeGitHubActions(
  source: PublishedSource,
  folder: ProjectFolder,
  signal: AbortSignal,
): Promise<BaseCiJudgment> {
  const { workflow } = ciConfiguration(folder.path);
  const github = createGitHubActions({
    repo: source.repository,
    workflow,
  });
  return judgeWithRuns(
    source,
    signal,
    () =>
      github.listRuns(
        { branch: source.ref, created: undefined, limit: 100 },
        signal,
      ) as Promise<ListedRun[]>,
    (error) =>
      githubAcquisitionUnread(error, "The Actions runs could not be read"),
  );
}

async function judgeCommandAdapter(
  source: PublishedSource,
  folder: ProjectFolder,
  adapter: readonly string[],
  signal: AbortSignal,
): Promise<BaseCiJudgment> {
  const acquisition = createCommandAcquisition({
    command: adapter,
    repo: source.repository,
    branch: source.ref,
    root: folder.path,
  });
  return judgeWithRuns(
    source,
    signal,
    async () => {
      await acquisition.acquireRuns(signal);
      return (await acquisition.discoverAncestorCandidates()) as ListedRun[];
    },
    (error) =>
      unread(
        error instanceof Error
          ? error.message
          : "The command-adapter discover could not be read",
      ),
  );
}

// Judges the origin target's CI for `source` from the project folder's CI
// settings. Bound by the authenticated read wait. A nonempty `ciAdapter`
// uses discover attempts from the project folder; otherwise GitHub Actions.
export async function judgeBaseCi(
  source: PublishedSource,
  folder: ProjectFolder,
): Promise<BaseCiJudgment> {
  const controller = AbortSignal.timeout(readWaitLimitMs);
  try {
    const { adapter } = ciConfiguration(folder.path);
    if (adapter !== undefined)
      return await judgeCommandAdapter(source, folder, adapter, controller);
    return await judgeGitHubActions(source, folder, controller);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    )
      return unread(
        `The base's CI could not be read within ${String(readWaitLimitMs / 1000)} seconds`,
      );
    return unread(
      error instanceof Error
        ? error.message
        : "The base's CI could not be read",
    );
  }
}

// The pre-acceptance answer for a non-pass judgment.
export function baseCiFound(
  branch: string,
  judgment: Exclude<BaseCiJudgment, { state: "pass" }>,
): BaseCiFound {
  return {
    kind: "base-ci",
    branch,
    revision: judgment.revision,
    subject: judgment.subject,
    state: judgment.state,
    laterWithoutResult: judgment.laterWithoutResult,
    ...(judgment.reason === undefined ? {} : { reason: judgment.reason }),
    ...(judgment.runUrl === undefined ? {} : { runUrl: judgment.runUrl }),
  };
}
