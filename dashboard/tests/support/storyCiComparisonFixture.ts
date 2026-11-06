// Combined done-story + CI fixture for Intent's CI timing comparison
// (../intent-ci-comparison.spec.ts): publishes a completed Story Branch
// story whose claim parent is preceded only by planning commits, and serves
// Actions runs by head_sha for baseline (3:00), branch (3:20) and landed
// (4:00) wall times. The SEED-236 earlier-landing shape lives in
// ./storyCiComparisonEarlierLanding.ts.

import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
  type CiRunAnswer,
} from "./baseCiActions.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

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
    startedAt,
    completedAt,
    url: `https://ci.invalid/runs/${String(id)}`,
  };
}

function revList(repo: string, start: string, count: number): string[] {
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

function claimOf(repo: string, agent: string): string {
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

export type StoryCiComparisonSetup = {
  readonly identity: string;
  readonly completion: string;
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
};

export function serveActionsFor(
  committed: Awaited<ReturnType<typeof publishCommittedOrigin>>,
  initial: Record<string, readonly CiRunAnswer[]>,
) {
  let runsBySha = initial;
  const answerActions = (argv: readonly string[]): OriginAnswer | undefined => {
    const route = argv.find((argument) => argument.startsWith("repos/")) ?? "";
    if (/\/actions\/workflows\/[^/?]+$/.test(route)) {
      return actionsWorkflowAnswer();
    }
    const runs = /\/actions\/workflows\/[^/]+\/runs\?(.*)$/.exec(route);
    if (runs?.[1] !== undefined) {
      const query = new URLSearchParams(runs[1]);
      const headSha = query.get("head_sha") ?? "";
      return actionsRunsAnswer(runsBySha[headSha] ?? [], "main");
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
            created_at: "2026-11-05T12:00:00Z",
            run_started_at: found.startedAt,
            updated_at: found.completedAt,
          }),
        };
      }
    }
    return undefined;
  };
  const restoreActions = committed.serveActions(answerActions);
  return {
    restoreActions,
    serveRuns(next: Record<string, readonly CiRunAnswer[]>) {
      runsBySha = next;
    },
  };
}

// Planning-only commits between a built trunk revision and the claim, so the
// baseline is a measured ancestor.
export function precedeClaimWithPlanning(origin: StartOrigin): string {
  writeAt(origin.project, "src/built.ts", "built before story\n");
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

export async function publishComparedStoryBranch(
  page: Page,
  origin: StartOrigin,
): Promise<StoryCiComparisonSetup> {
  const baseline = precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(origin, "story-branch");
  const { completion, agent, branch } = story;
  const claim = claimOf(origin.project, agent);
  const storyStart = git(origin.project, "rev-parse", `${claim}^`);
  const parents = git(origin.project, "rev-list", "--parents", "-1", completion)
    .trim()
    .split(" ");
  const branchSide = parents[2] ?? completion;
  const fromStart = revList(origin.project, storyStart, 20);
  const baselineIndex = fromStart.indexOf(baseline);
  const laterWithoutBuild = baselineIndex < 0 ? 0 : baselineIndex;

  advanceCompletedTrunk(origin);

  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });

  const actions = serveActionsFor(committed, {
    [baseline]: [
      wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [branchSide]: [
      wall(branchSide, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
    ],
    [completion]: [
      wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
    ],
  });
  return {
    identity: queuedIdentity,
    completion,
    baseline,
    branchSide,
    laterWithoutBuild,
    agent,
    branch,
    ...actions,
  };
}
