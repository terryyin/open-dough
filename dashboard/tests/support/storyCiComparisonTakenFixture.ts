// Taken-story shapes for Intent's provisional CI timing comparison
// (../intent/intent-ci-comparison-taken.spec.ts): Story Branch keeps a live tip
// labelled provisional with Landed not yet; Trunk Mode puts the tip in the
// Provisional row beside Branch N/A. Shared helpers come from
// ./storyCiComparisonFixture.ts.

import type { Page } from "@playwright/test";
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import { observedFirstAttempts } from "./storyCiObservedJobs.ts";
import {
  claimOf,
  precedeClaimWithPlanning,
  revList,
  serveActionsFor,
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
  readonly initialRuns: Record<string, readonly CiRunAnswer[]>;
  readonly serveRuns: (
    runsBySha: Record<string, readonly CiRunAnswer[]>,
  ) => void;
  readonly serveJobs: ReturnType<typeof serveActionsFor>["serveJobs"];
}> {
  const baseline = await precedeClaimWithPlanning(origin);
  const { agent, workspace, branch } = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
  });
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
  const firstAttempts = observedFirstAttempts(baseline, branchTip, 102);
  const actions = serveActionsFor(committed, firstAttempts.runs, {}, branch);
  actions.serveJobs(firstAttempts.jobs);
  return {
    identity: queuedIdentity,
    title: "Story A",
    baseline,
    branchTip,
    laterWithoutBuild,
    agent,
    branch,
    initialRuns: firstAttempts.runs,
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
  const baseline = await precedeClaimWithPlanning(origin);
  const { agent, workspace } = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "trunk",
    slug: "taken-trunk-ci",
  });
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
  const firstAttempts = observedFirstAttempts(baseline, trunkTip, 201);
  const actions = serveActionsFor(committed, firstAttempts.runs);
  actions.serveJobs(firstAttempts.jobs);
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
