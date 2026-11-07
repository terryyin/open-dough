// GitHub Actions revision lookup for story CI comparison: lists runs with
// `head_sha=`, reads earlier attempts of a cancelled latest, and subjects from
// local Git. Slot wrappers stay in `./baseCiRevisionLookup.ts`.
import {
  createGitHubActions,
  observedRun,
  readGitHubActions,
} from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  timeWithoutRunnerWaits,
  type ReportedAttemptJob,
} from "./ciTimeWithoutRunnerWaits.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import { revisionSubject } from "./baseCiRevisionGit.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import { runGit, type GitCall } from "./gitRunner.ts";
import { rememberedByKey } from "./rememberedByKey.ts";

const rememberedAttemptJobs = rememberedByKey<readonly ReportedAttemptJob[]>();

function asListedRun(run: {
  readonly databaseId?: number;
  readonly attempt?: number;
  readonly headSha?: string;
  readonly status?: string;
  readonly conclusion?: string | null;
  readonly url?: string;
  readonly createdAt?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly headBranch?: string;
}): ListedRun {
  return {
    ...(typeof run.databaseId === "number"
      ? { databaseId: run.databaseId }
      : {}),
    ...(typeof run.attempt === "number" ? { attempt: run.attempt } : {}),
    ...(typeof run.headSha === "string" ? { headSha: run.headSha } : {}),
    ...(typeof run.status === "string" ? { status: run.status } : {}),
    ...(run.conclusion !== undefined ? { conclusion: run.conclusion } : {}),
    ...(typeof run.url === "string" ? { url: run.url } : {}),
    ...(typeof run.createdAt === "string" ? { createdAt: run.createdAt } : {}),
    ...(typeof run.startedAt === "string" ? { startedAt: run.startedAt } : {}),
    ...(typeof run.completedAt === "string"
      ? { completedAt: run.completedAt }
      : {}),
    ...(typeof run.headBranch === "string" && run.headBranch !== ""
      ? { branch: run.headBranch }
      : {}),
  };
}

// Lookup that answers one revision's runs through the selected workflow's
// `head_sha` listing and attempt endpoints.
export function githubRevisionLookup(
  source: PublishedSource,
  workflow: string,
  call: GitCall,
  signal: AbortSignal,
): RevisionCiLookup {
  const github = createGitHubActions({
    repo: source.repository,
    workflow,
  });
  // Slots in one comparison can name the same attempt and share its signal.
  const pendingAttemptJobs = new Map<
    string,
    Promise<readonly ReportedAttemptJob[]>
  >();
  const repository = source.repository.toLowerCase();
  function jobsOf(runId: number, attempt: number) {
    const key = `${repository}#${String(runId)}#${String(attempt)}`;
    const remembered = rememberedAttemptJobs.get(key);
    if (remembered !== undefined) return Promise.resolve(remembered);
    const pending = pendingAttemptJobs.get(key);
    if (pending !== undefined) return pending;
    const read = github
      .attemptJobs(runId, attempt, signal)
      .then((jobs: readonly ReportedAttemptJob[]) => {
        rememberedAttemptJobs.set(key, jobs);
        return jobs;
      })
      .finally(() => {
        pendingAttemptJobs.delete(key);
      });
    pendingAttemptJobs.set(key, read);
    return read;
  }

  return {
    async timeWithoutRunnerWaitsOf({ revision, runId, runAttempt, state }) {
      if (runId === undefined || runAttempt === undefined)
        return {
          reason: "The build has no reported run and attempt identity.",
        };
      let workflowText: string;
      try {
        const { path } = (await github.workflow(signal)) as { path?: unknown };
        if (
          typeof path !== "string" ||
          !/^\.github\/workflows\/[^/\r\n]+\.ya?ml$/.test(path)
        ) {
          return { reason: "The selected workflow has no readable file path." };
        }
        workflowText = (await runGit(["show", `${revision}:${path}`], call))
          .stdout;
      } catch {
        return {
          reason:
            "The workflow file could not be read at this build's revision.",
        };
      }
      let jobs: readonly ReportedAttemptJob[];
      try {
        jobs = await jobsOf(runId, runAttempt);
      } catch {
        return { reason: "The build's attempt jobs could not be read." };
      }
      return timeWithoutRunnerWaits(workflowText, jobs, state === "failed");
    },
    async listRunsAt(sha) {
      const { id, name } = (await github.workflow(signal)) as {
        readonly id: number;
        readonly name: string;
      };
      const query = new URLSearchParams({
        head_sha: sha,
        per_page: "10",
        page: "1",
      });
      const { workflow_runs: runs = [] } = (await readGitHubActions(
        [
          "api",
          `repos/${source.repository}/actions/workflows/${id}/runs?${query}`,
        ],
        signal,
      )) as { workflow_runs?: readonly Record<string, unknown>[] };
      return runs.map((run) => {
        const observed = observedRun(run, name) as {
          readonly databaseId?: number;
          readonly attempt?: number;
          readonly headSha?: string;
          readonly status?: string;
          readonly conclusion?: string | null;
          readonly url?: string;
          readonly createdAt?: string;
          readonly startedAt?: string;
          readonly completedAt?: string;
          readonly headBranch?: string;
        };
        return asListedRun(observed);
      });
    },
    async earlierAttemptsOf(runId, latestAttempt) {
      const earlier: ListedRun[] = [];
      for (let attempt = latestAttempt - 1; attempt >= 1; attempt -= 1) {
        try {
          const body = (await readGitHubActions(
            [
              "api",
              `repos/${source.repository}/actions/runs/${String(runId)}/attempts/${String(attempt)}`,
            ],
            signal,
          )) as Record<string, unknown>;
          earlier.push(
            asListedRun({
              databaseId: runId,
              attempt,
              ...(typeof body.head_sha === "string"
                ? { headSha: body.head_sha }
                : {}),
              ...(typeof body.status === "string"
                ? { status: body.status }
                : {}),
              ...(body.conclusion === undefined
                ? {}
                : { conclusion: body.conclusion as string | null }),
              ...(typeof body.html_url === "string"
                ? { url: body.html_url }
                : {}),
              ...(typeof body.created_at === "string"
                ? { createdAt: body.created_at }
                : {}),
              ...(typeof body.run_started_at === "string"
                ? { startedAt: body.run_started_at }
                : {}),
              ...(typeof body.updated_at === "string"
                ? { completedAt: body.updated_at }
                : {}),
              ...(typeof body.head_branch === "string"
                ? { headBranch: body.head_branch }
                : {}),
            }),
          );
        } catch {
          break;
        }
      }
      return earlier;
    },
    subjectOf: (sha) => revisionSubject(sha, call),
  };
}
