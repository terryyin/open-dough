// Observes the origin target's CI for a new execution start: the newest
// result of the project's selected check at the target head or its nearest
// ancestor that has one. Pass starts without asking; every other state is
// answered for the developer to confirm. ADR 0008: observe without owning;
// nothing is kept beyond the request. Slice 1 covers GitHub Actions; a
// command-adapter project is judged in a later slice.
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

type ListedCommit = {
  readonly sha?: unknown;
  readonly commit?: { readonly message?: unknown };
};

type ListedRun = {
  readonly headSha?: string;
  readonly status?: string;
  readonly conclusion?: string | null;
  readonly url?: string;
  readonly createdAt?: string;
};

const historyPage = 30;

type CiConfiguration = {
  readonly adapter: readonly string[] | undefined;
  readonly workflow: string;
};

function ciConfiguration(folder: string): CiConfiguration {
  return readCiConfiguration(folder);
}

function subjectOf(message: unknown): string {
  if (typeof message !== "string" || message.trim() === "")
    return "(no subject)";
  return message.split(/\r?\n/, 1)[0] ?? "(no subject)";
}

function judgeAttempt(
  status: string | undefined,
  conclusion: string | null | undefined,
): "pass" | BaseCiState | undefined {
  if (
    status === "queued" ||
    status === "in_progress" ||
    status === "pending" ||
    status === "waiting" ||
    status === "requested"
  )
    return "running";
  if (status !== "completed") return undefined;
  if (conclusion === "success") return "pass";
  return "failed";
}

// Newest listed run for `sha`, by creation time then listing order.
function newestRunFor(
  runs: readonly ListedRun[],
  sha: string,
): ListedRun | undefined {
  let newest: ListedRun | undefined;
  let newestAt = Number.NEGATIVE_INFINITY;
  for (const run of runs) {
    if (run.headSha !== sha) continue;
    const at = Date.parse(run.createdAt ?? "");
    const stamp = Number.isFinite(at) ? at : Number.NEGATIVE_INFINITY;
    if (newest === undefined || stamp >= newestAt) {
      newest = run;
      newestAt = stamp;
    }
  }
  return newest;
}

function unread(reason: string): BaseCiJudgment {
  return {
    state: "unread",
    revision: "unavailable",
    subject: "(unavailable)",
    laterWithoutResult: 0,
    reason,
  };
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
  let commits: ListedCommit[];
  try {
    commits = (await readGitHubActions(
      [
        "api",
        `repos/${source.repository}/commits?sha=${encodeURIComponent(source.ref)}&per_page=${String(historyPage)}`,
      ],
      signal,
    )) as ListedCommit[];
  } catch (error) {
    if (error instanceof GitHubAcquisitionHeld)
      return unread(
        `GitHub directed a wait of ${String(error.waitSeconds)} s before the next request`,
      );
    if (error instanceof GitHubAcquisitionFailed) return unread(error.message);
    return unread(
      error instanceof Error
        ? error.message
        : "The commit history could not be read",
    );
  }
  if (!Array.isArray(commits) || commits.length === 0)
    return unread("No commit history was returned for the origin target");

  let runs: ListedRun[];
  try {
    runs = (await github.listRuns(
      { branch: source.ref, created: undefined, limit: 100 },
      signal,
    )) as ListedRun[];
  } catch (error) {
    if (error instanceof GitHubAcquisitionHeld)
      return unread(
        `GitHub directed a wait of ${String(error.waitSeconds)} s before the next request`,
      );
    if (error instanceof GitHubAcquisitionFailed) return unread(error.message);
    return unread(
      error instanceof Error
        ? error.message
        : "The Actions runs could not be read",
    );
  }

  let skipped = 0;
  for (const commit of commits) {
    if (typeof commit.sha !== "string" || commit.sha === "") {
      skipped += 1;
      continue;
    }
    const run = newestRunFor(runs, commit.sha);
    if (run === undefined) {
      skipped += 1;
      continue;
    }
    const state = judgeAttempt(run.status, run.conclusion);
    if (state === undefined) {
      skipped += 1;
      continue;
    }
    return {
      state,
      revision: commit.sha,
      subject: subjectOf(commit.commit?.message),
      laterWithoutResult: skipped,
      ...(typeof run.url === "string" && run.url !== ""
        ? { runUrl: run.url }
        : {}),
    };
  }
  return unread(
    "No result of the selected check was found in the readable history",
  );
}

// Judges the origin target's CI for `source` from the project folder's CI
// settings. Bound by the authenticated read wait. Command-adapter projects
// are unread until their slice lands.
export async function judgeBaseCi(
  source: PublishedSource,
  folder: ProjectFolder,
): Promise<BaseCiJudgment> {
  const controller = AbortSignal.timeout(readWaitLimitMs);
  try {
    const { adapter } = ciConfiguration(folder.path);
    if (adapter !== undefined)
      return unread("Command-adapter base CI is not yet judged for this start");
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
