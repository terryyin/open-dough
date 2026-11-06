// Taken-story shapes for Intent's provisional CI timing comparison
// (../intent-ci-comparison-taken.spec.ts): Story Branch keeps a live tip
// labelled provisional with Landed not yet; Trunk Mode puts the tip in the
// Provisional row beside Branch N/A. Shared helpers come from
// ./storyCiComparisonFixture.ts.

import path from "node:path";
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import {
  claimOf,
  precedeClaimWithPlanning,
  revList,
  serveActionsFor,
  wall,
} from "./storyCiComparisonFixture.ts";

// Taken Story Branch with a completed branch tip build and the same
// pre-story baseline as done journeys. Leaves the story Taken (no wrap-up).
export async function publishTakenComparedStoryBranch(
  page: Page,
  origin: StartOrigin,
): Promise<{
  readonly identity: string;
  readonly title: string;
  readonly baseline: string;
  readonly branchTip: string;
  readonly laterWithoutBuild: number;
  readonly agent: string;
  readonly branch: string;
  readonly restoreActions: () => void;
  readonly serveRuns: (
    runsBySha: Record<string, readonly CiRunAnswer[]>,
  ) => void;
}> {
  const baseline = precedeClaimWithPlanning(origin);
  const agent = await origin.takenByAnotherAgent();
  const workspace = path.join(origin.machine, "another-agent-workspace");
  const branch = "claude/another-agent";
  writeAt(workspace, "src/story.ts", "taken story work\n");
  commitAll(workspace, "story implementation on the branch");
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  const branchTip = git(workspace, "rev-parse", "HEAD");
  const claim = claimOf(origin.project, agent);
  const storyStart = git(origin.project, "rev-parse", `${claim}^`);
  const fromStart = revList(origin.project, storyStart, 20);
  const baselineIndex = fromStart.indexOf(baseline);
  const laterWithoutBuild = baselineIndex < 0 ? 0 : baselineIndex;

  pull(origin.project);
  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const actions = serveActionsFor(
    committed,
    {
      [baseline]: [
        wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
      ],
      [branchTip]: [
        wall(branchTip, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
      ],
    },
    {},
    branch,
  );
  return {
    identity: queuedIdentity,
    title: "Story A",
    baseline,
    branchTip,
    laterWithoutBuild,
    agent,
    branch,
    ...actions,
  };
}

// Taken Trunk Mode with a provisional trunk tip build against the same
// pre-story baseline. Branch stays not applicable; Landed is not yet.
export async function publishTakenComparedTrunk(
  page: Page,
  origin: StartOrigin,
): Promise<{
  readonly identity: string;
  readonly title: string;
  readonly baseline: string;
  readonly trunkTip: string;
  readonly laterWithoutBuild: number;
  readonly agent: string;
  readonly restoreActions: () => void;
}> {
  const baseline = precedeClaimWithPlanning(origin);
  const { agent, workspace } = await origin.takenInTrunkMode("taken-trunk-ci");
  writeAt(workspace, "src/trunk-story.ts", "taken trunk work\n");
  commitAll(workspace, "story implementation on trunk");
  push(workspace);
  const trunkTip = git(origin.origin, "rev-parse", "main");
  const claim = claimOf(origin.project, agent);
  const storyStart = git(origin.project, "rev-parse", `${claim}^`);
  const fromStart = revList(origin.project, storyStart, 20);
  const baselineIndex = fromStart.indexOf(baseline);
  const laterWithoutBuild = baselineIndex < 0 ? 0 : baselineIndex;

  pull(origin.project);
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: trunkTip,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const actions = serveActionsFor(committed, {
    [baseline]: [
      wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [trunkTip]: [
      wall(trunkTip, 201, "2026-11-05T13:00:00Z", "2026-11-05T13:03:40Z"),
    ],
  });
  return {
    identity: queuedIdentity,
    title: "Story A",
    baseline,
    trunkTip,
    laterWithoutBuild,
    agent,
    ...actions,
  };
}
