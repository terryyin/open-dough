// Shared CI comparison fixture helpers for Intent's timing comparison
// (../../../e2e/intent/intent-ci-comparison.spec.ts): Actions answers by head_sha, planning
// commits before a claim, and the done Story Branch publisher. SEED-236
// lives in ./storyCiComparisonEarlierLanding.ts; Taken shapes in
// ./storyCiComparisonTakenFixture.ts; entry-proof Answers in
// ./storyCiComparisonEntryProofs.ts; the declared pre-claim baseline in
// ./storyCiComparisonBaseline.ts and workflow files in
// ./storyCiComparisonWorkflows.ts, re-exported here; the GitHub requests a
// comparison read asked in ./storyCiComparisonRequests.ts.

import type { ReportedAttemptJob } from "../../server/ciTimeWithoutRunnerWaits.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import {
  apiJob,
  apiRun,
} from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { observedRunForApi } from "../../../Distribution/tests/support/ciRunTestData.mjs";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  type CiRunAnswer,
} from "./baseCiActions.ts";
import {
  answerComparisonProofRoute,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";
import type { ActionsAnswerer, CommittedOrigin } from "../committedOrigin.ts";
import { comparisonWorkflowPath } from "./storyCiComparisonWorkflows.ts";

export type { ComparisonProofServe } from "./storyCiComparisonEntryProofs.ts";
export {
  laterWithoutBuildBeforeClaim,
  precedeClaimWithPlanning,
  withPlanningBeforeClaim,
} from "./storyCiComparisonBaseline.ts";
export {
  comparisonCiWorkflow,
  comparisonWorkflow,
  comparisonWorkflowPath,
} from "./storyCiComparisonWorkflows.ts";
export {
  mixedEntrySummary,
  proofRun,
  untimedBaselineMixedProofs,
} from "./storyCiComparisonEntryProofs.ts";

// Timed comparison run: MakeMe owns construction; call sites keep the same
// identity and wall-time facts (including deliberately reversed bounds).
export function wall(
  headSha: string,
  id: number,
  startedAt: string,
  completedAt: string,
  conclusion: CiRunAnswer["conclusion"] = "success",
  status: CiRunAnswer["status"] = "completed",
): CiRunAnswer {
  return makeMe.aCiRun
    .with({
      headSha,
      databaseId: id,
      attempt: 1,
      conclusion,
      status,
      createdAt: startedAt,
      startedAt,
      completedAt,
      url: `https://ci.invalid/runs/${String(id)}`,
    })
    .please();
}

type AttemptJobs = Record<string, readonly ReportedAttemptJob[]>;

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
  // Sees every Actions request first; its answer replaces the served one,
  // and undefined falls through to it.
  readonly interceptActions: (answerer: ActionsAnswerer) => void;
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
  let intercept: ActionsAnswerer | undefined;
  const answerActions: ActionsAnswerer = (argv) =>
    intercept?.(argv) ?? answerServed(argv);
  const answerServed = (argv: readonly string[]): OriginAnswer | undefined => {
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
          body: JSON.stringify({
            jobs: listed.map(apiJob),
            total_count: listed.length,
          }),
        };
    }
    const attempt = /\/actions\/runs\/(\d+)\/attempts\/(\d+)$/.exec(route);
    if (attempt?.[1] !== undefined) {
      const runId = Number(attempt[1]);
      for (const group of Object.values(runsBySha)) {
        const found = group.find((run) => (run.databaseId ?? run.id) === runId);
        if (found === undefined) continue;
        return {
          status: 200,
          contentType: "application/json; charset=utf-8",
          body: JSON.stringify(
            apiRun(observedRunForApi(found, found.headBranch ?? "main", 0)),
          ),
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
    interceptActions(answerer: ActionsAnswerer) {
      intercept = answerer;
    },
  };
}
