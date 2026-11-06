// GitHub Actions revision lookup for story CI comparison: lists runs with
// `head_sha=`, reads earlier attempts of a cancelled latest, and subjects from
// local Git. Slot wrappers stay in `./baseCiRevisionLookup.ts`.
import {
  createGitHubActions,
  observedRun,
  readGitHubActions,
} from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import { runGit, type GitCall } from "./gitRunner.ts";

export async function firstParentChain(
  start: string,
  call: GitCall,
  limit: number,
): Promise<string[]> {
  return (
    await runGit(
      ["rev-list", "--first-parent", `--max-count=${String(limit)}`, start],
      call,
    )
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
}

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
  return {
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
    async subjectOf(sha) {
      try {
        const subject = (
          await runGit(["log", "-1", "--format=%s", sha], call)
        ).stdout.trim();
        return subject === "" ? "(no subject)" : subject;
      } catch {
        return "(no subject)";
      }
    },
  };
}
