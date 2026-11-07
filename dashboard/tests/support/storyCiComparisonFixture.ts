// Shared CI comparison fixture helpers for Intent's timing comparison
// (../intent/intent-ci-comparison.spec.ts): Actions answers by head_sha, planning
// commits before a claim, and the done Story Branch publisher. SEED-236
// lives in ./storyCiComparisonEarlierLanding.ts; SEED-248 fast-forward tip
// in ./storyCiComparisonFastForward.ts and later first-parent rewrite in
// ./storyCiComparisonLaterFastForward.ts; Taken shapes in
// ./storyCiComparisonTakenFixture.ts; entry-proof Answers in
// ./storyCiComparisonEntryProofs.ts.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import type { ReportedAttemptJob } from "../../server/ciTimeWithoutRunnerWaits.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  type CiRunAnswer,
} from "./baseCiActions.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import {
  answerComparisonProofRoute,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";
import type { CommittedOrigin } from "../committedOrigin.ts";
import type { GhCall } from "./fakeGitHub.ts";

export type { ComparisonProofServe } from "./storyCiComparisonEntryProofs.ts";
export {
  mixedEntryParts,
  mixedEntrySummary,
  proofRun,
  untimedBaselineMixedProofs,
} from "./storyCiComparisonEntryProofs.ts";

export function wall(
  headSha: string,
  id: number,
  startedAt: string,
  completedAt: string,
  conclusion: CiRunAnswer["conclusion"] = "success",
  status: CiRunAnswer["status"] = "completed",
): CiRunAnswer {
  return {
    headSha,
    id,
    attempt: 1,
    conclusion,
    status,
    createdAt: startedAt,
    startedAt,
    completedAt,
    url: `https://ci.invalid/runs/${String(id)}`,
  };
}

export function revList(repo: string, start: string, count: number): string[] {
  return execFileSync(
    "git",
    [
      "-C",
      repo,
      "rev-list",
      "--first-parent",
      `--max-count=${String(count)}`,
      start,
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
}

export function claimOf(repo: string, agent: string): string {
  const email = `${agent.replace(/-chan$/, "").toLowerCase()}-chan@example.org`;
  return execFileSync(
    "git",
    [
      "-C",
      repo,
      "log",
      "--all",
      "--format=%H",
      `--author=<${email}>`,
      "--grep=Take queued work",
      "-1",
    ],
    { encoding: "utf8" },
  ).trim();
}

export const comparisonWorkflowPath = ".github/workflows/comparison.yml";
export const comparisonWorkflow = readFileSync(
  new URL("../../../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);

type AttemptJobs = Record<string, readonly ReportedAttemptJob[]>;

export function listedAttemptJobPages(calls: readonly GhCall[]): string[] {
  return calls
    .flatMap(({ request }) =>
      request.kind === "actions-attempt-jobs"
        ? [
            `${String(request.runId)}/${String(request.attempt)}/${String(request.page)}`,
          ]
        : [],
    )
    .sort();
}

export type StoryCiComparisonSetup = {
  readonly identity: string;
  readonly completion: string;
  // Trunk-first landing merge when it differs from completion (SEED-236 /
  // SEED-248); absent when completion is the landing.
  readonly landingMerge?: string;
  // First parent of the landing merge (trunk side before the story).
  readonly trunkSide?: string;
  readonly baseline: string;
  readonly branchSide: string;
  // First-parent ancestor of branchSide that has the branch build, when the
  // tip itself has none (SEED-236).
  readonly branchAncestor?: string;
  readonly laterWithoutBuild: number;
  readonly agent: string;
  readonly branch: string;
  readonly restoreActions: () => void;
  readonly serveRuns: (
    runsBySha: Record<string, readonly CiRunAnswer[]>,
  ) => void;
  readonly serveJobs: (jobs: AttemptJobs) => void;
  readonly serveProofs: (
    proofsByRunId: Record<number, ComparisonProofServe>,
  ) => void;
};

export function serveActionsFor(
  committed: CommittedOrigin,
  initial: Record<string, readonly CiRunAnswer[]>,
  initialProofs: Record<number, ComparisonProofServe> = {},
  // When set, branch= listings for live judgment return every served run on
  // that branch name (Taken Story Branch journeys keep JudgedBranch).
  judgedBranch?: string,
) {
  let runsBySha = initial;
  let proofsByRunId = initialProofs;
  let jobsByAttempt: AttemptJobs = {};
  const answerActions = (argv: readonly string[]): OriginAnswer | undefined => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    if (/\/actions\/workflows\/[^/?]+$/.test(route)) {
      return actionsWorkflowAnswer(comparisonWorkflowPath);
    }
    const runs = /\/actions\/workflows\/[^/]+\/runs\?(.*)$/.exec(route);
    if (runs?.[1] !== undefined) {
      const query = new URLSearchParams(runs[1]);
      const headSha = query.get("head_sha") ?? "";
      if (headSha !== "")
        return actionsRunsAnswer(runsBySha[headSha] ?? [], "main");
      const branch = query.get("branch") ?? "";
      if (judgedBranch !== undefined && branch === judgedBranch) {
        const listed = Object.values(runsBySha).flat();
        return actionsRunsAnswer(listed, judgedBranch);
      }
      if (branch === "main" || branch === "") {
        const listed = Object.values(runsBySha).flat();
        return actionsRunsAnswer(listed, branch || "main");
      }
      return actionsRunsAnswer([], branch);
    }
    const jobs = /\/actions\/runs\/(\d+)\/attempts\/(\d+)\/jobs\?/.exec(route);
    if (jobs?.[1] !== undefined && jobs[2] !== undefined) {
      const listed = jobsByAttempt[`${jobs[1]}/${jobs[2]}`];
      if (listed !== undefined)
        return {
          status: 200,
          contentType: "application/json; charset=utf-8",
          body: JSON.stringify({ jobs: listed, total_count: listed.length }),
        };
    }
    const attempt = /\/actions\/runs\/(\d+)\/attempts\/(\d+)$/.exec(route);
    if (attempt?.[1] !== undefined) {
      const runId = Number(attempt[1]);
      for (const group of Object.values(runsBySha)) {
        const found = group.find((run) => run.id === runId);
        if (found === undefined) continue;
        return {
          status: 200,
          contentType: "application/json; charset=utf-8",
          body: JSON.stringify({
            id: runId,
            run_attempt: found.attempt ?? 1,
            head_sha: found.headSha,
            head_branch: "main",
            status: found.status ?? "completed",
            conclusion: found.conclusion ?? "success",
            html_url: found.url,
            created_at: found.createdAt ?? "2026-11-05T12:00:00Z",
            run_started_at: found.startedAt,
            updated_at: found.completedAt,
          }),
        };
      }
    }
    return answerComparisonProofRoute(route, proofsByRunId, runsBySha);
  };
  const restoreActions = committed.serveActions(answerActions);
  return {
    restoreActions,
    serveRuns(next: Record<string, readonly CiRunAnswer[]>) {
      runsBySha = next;
    },
    serveJobs(next: AttemptJobs) {
      jobsByAttempt = next;
    },
    serveProofs(next: Record<number, ComparisonProofServe>) {
      proofsByRunId = next;
    },
  };
}

// Workflow file whose paths-ignore matches this repository's CI, so a fixture
// can confirm a skip at a planning-only or docs-only revision.
export const comparisonCiWorkflow = [
  "name: CI",
  "",
  "on:",
  "  push:",
  "    paths-ignore:",
  "      - '.planning/**'",
  "      - 'docs/**'",
  "  pull_request:",
  "    paths-ignore:",
  "      - '.planning/**'",
  "      - 'docs/**'",
  "  workflow_dispatch:",
  "",
  "jobs:",
  "  check:",
  "    runs-on: ubuntu-24.04",
  "    steps:",
  "      - run: echo ok",
  "",
].join("\n");

export function commitComparisonCiWorkflow(project: string): void {
  writeAt(project, ".github/workflows/ci.yml", comparisonCiWorkflow);
  commitAll(project, "add CI workflow with paths-ignore");
}

// Planning-only commits between a built trunk revision and the claim, so the
// baseline is a measured ancestor.
export function precedeClaimWithPlanning(
  origin: StartOrigin,
  options?: {
    readonly withCiWorkflow?: boolean;
    // Include shared.txt in the built baseline so a later completed story can
    // skip its initial shared commit and leave a planning-only claim parent.
    readonly sharedInBaseline?: boolean;
  },
): string {
  if (options?.withCiWorkflow === true) {
    commitComparisonCiWorkflow(origin.project);
  }
  writeAt(origin.project, "src/built.ts", "built before story\n");
  writeAt(origin.project, comparisonWorkflowPath, comparisonWorkflow);
  if (options?.sharedInBaseline === true) {
    writeAt(origin.project, "shared.txt", lines("line"));
  }
  commitAll(origin.project, "ship a built revision");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  for (const [index, name] of [
    "plan one",
    "plan two",
    "plan three",
    "plan four",
  ].entries()) {
    writeAt(origin.project, `.planning/notes-${String(index)}.md`, `${name}\n`);
    commitAll(origin.project, `planning: ${name}`);
  }
  push(origin.project);
  return baseline;
}
