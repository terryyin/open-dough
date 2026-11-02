// Fake GitHub answers for base-CI judgment: Actions workflow lookup and push
// runs of the selected check, plus the empty-path commit listing shape the
// judgment reads. `../committedOrigin.ts` and `./publishedRepository.ts`
// share these so the default passing head and journey overrides stay one rule.

import { execFileSync } from "node:child_process";
import type { OriginAnswer } from "../originAnswers.ts";
import type { GhCall } from "./fakeGitHub.ts";

// Default published head when a journey has not served its own origin yet
// (SEED-210): every-repository and owned-GitHub defaults answer this revision.
export const defaultBaseCiRevision = "ab".repeat(20);

export type CiRunAnswer = {
  readonly headSha: string;
  readonly conclusion?: "success" | "failure" | "cancelled" | "timed_out";
  readonly status?: "completed" | "in_progress" | "queued";
  readonly id?: number;
  readonly url?: string;
};

export function actionsWorkflowAnswer(): OriginAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({ id: 7001, name: "CI", state: "active" }),
  };
}

export function actionsRunsAnswer(
  runs: readonly CiRunAnswer[],
  branch = "main",
): OriginAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify({
      workflow_runs: runs.map((run, index) => {
        const status = run.status ?? "completed";
        return {
          id: run.id ?? index + 1,
          run_attempt: 1,
          head_sha: run.headSha,
          head_branch: branch,
          event: "push",
          status,
          conclusion:
            run.conclusion ?? (status === "completed" ? "success" : null),
          html_url:
            run.url ?? `https://ci.invalid/${String(run.id ?? index + 1)}`,
          created_at: `2026-10-01T00:${String(index).padStart(2, "0")}:00Z`,
        };
      }),
    }),
  };
}

// Passing Actions for a published head so execution-start journeys are not
// asked about base CI unless a test overrides with `actionsForRuns`.
export function passingActionsAnswer(
  kind: "actions-workflow" | "actions-runs",
  headSha: string,
  branch = "main",
): OriginAnswer {
  if (kind === "actions-workflow") return actionsWorkflowAnswer();
  return actionsRunsAnswer([{ headSha, conclusion: "success" }], branch);
}

// Default Actions / empty-path commit-list answers for a published head so
// execution starts are not asked about base CI unless a journey overrides.
export function defaultPassingBaseCi(
  request: { readonly kind: string; readonly path?: string },
  headSha: string | undefined,
  branch = "main",
): OriginAnswer | undefined {
  if (headSha === undefined || headSha === "") return undefined;
  if (request.kind === "actions-workflow" || request.kind === "actions-runs") {
    return passingActionsAnswer(request.kind, headSha, branch);
  }
  if (request.kind === "commit-list" && request.path === "") {
    return headCommitListAnswer([{ sha: headSha, message: "Published head" }]);
  }
  return undefined;
}

export function actionsForRuns(
  runs: readonly CiRunAnswer[],
  branch = "main",
): (argv: readonly string[], headSha: string) => OriginAnswer | undefined {
  return (argv) => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    if (/\/actions\/workflows\/[^/?]+$/.test(route)) {
      return actionsWorkflowAnswer();
    }
    if (/\/actions\/workflows\/[^/]+\/runs(?:\?|$)/.test(route)) {
      return actionsRunsAnswer(runs, branch);
    }
    return undefined;
  };
}

// Answers the judgment's calls a journey serves itself; undefined leaves a
// call to the repository's other answers.
export type CiAnswerer = (
  call: GhCall,
) => OriginAnswer | Promise<OriginAnswer> | undefined;

// The calls a judgment asks: the selected check's Actions workflow and runs,
// and a branch's history listed by its name (no path, not a pinned sha).
export function isCiJudgmentCall({ request }: GhCall): boolean {
  return (
    request.kind === "actions-workflow" ||
    request.kind === "actions-runs" ||
    (request.kind === "commit-list" &&
      request.path === "" &&
      !/^[0-9a-f]{40}$/.test(request.revision))
  );
}

// Commit listing body the judgment reads for the origin target (no path).
export function headCommitListAnswer(
  commits: readonly {
    readonly sha: string;
    readonly message: string;
    readonly parents?: readonly string[];
  }[],
): OriginAnswer {
  return {
    status: 200,
    contentType: "application/json; charset=utf-8",
    body: JSON.stringify(
      commits.map(({ sha, message, parents }) => ({
        parents: parents?.map((parent) => ({ sha: parent })),
        sha,
        commit: {
          message,
          committer: {
            name: "Fixture Committer",
            date: "2026-10-01T00:00:00Z",
          },
        },
      })),
    ),
  };
}

// Real commits of `revision` in `repoDir`, newest first, for a followed origin.
export function targetHistoryAnswer(
  repoDir: string,
  revision: string,
  perPage: number | undefined,
): OriginAnswer {
  const limit = perPage ?? 30;
  const lines = execFileSync(
    "git",
    [
      "-C",
      repoDir,
      "log",
      `--max-count=${String(limit)}`,
      "--format=%H%x00%s%x00%P",
      revision,
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  return headCommitListAnswer(
    lines.map((line) => {
      const [sha, subject, parents] = line.split("\0");
      return {
        sha: sha ?? "",
        message: subject ?? "",
        parents: parents?.split(" ").filter(Boolean) ?? [],
      };
    }),
  );
}
