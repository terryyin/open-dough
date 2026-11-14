// Trunk Mode and Taken Story Branch publishers for Intent Summary CI timing
// comparison gap journeys (../intent/intent-summary-story-comparison-gaps.spec.ts).
// Shares trunk setup and proof builders with
// ./intentSummaryStoryComparisonFixture.ts.

import type { Page } from "@playwright/test";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import {
  claimOf,
  precedeClaimWithPlanning,
  revList,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import {
  breakdownProofs,
  trunkModeProofs,
} from "./intentSummaryStoryComparisonProofs.ts";
import {
  changeSummaryComparisonTests,
  publishSummaryComparisonTrunk,
} from "./intentSummaryStoryComparisonShared.ts";

export async function publishSummaryComparisonTrunkStory(
  page: Page,
  origin: StartOrigin,
): Promise<StoryCiComparisonSetup> {
  publishSummaryComparisonTrunk(origin.project);
  writeAt(origin.project, "src/built.ts", "built before claim\n");
  commitAll(origin.project, "ship a built revision");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    changeSummaryComparisonTests,
  );
  const { completion, agent, branch } = story;
  const implementation = git(
    origin.project,
    "log",
    "--format=%H",
    "--grep=^story implementation$",
    "-1",
    completion,
  );
  pull(origin.project);
  writeAt(
    origin.project,
    "dashboard/tests/later.spec.ts",
    "later trunk file\n",
  );
  commitAll(origin.project, "later trunk file after the story");
  push(origin.project);
  advanceCompletedTrunk(origin);
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
        wall(baseline, 200, "2026-11-05T11:00:00Z", "2026-11-05T11:03:00Z"),
      ],
      [implementation]: [
        wall(
          implementation,
          201,
          "2026-11-05T12:00:00Z",
          "2026-11-05T12:03:00Z",
        ),
      ],
    },
    trunkModeProofs({ baseline, implementation }),
  );
  return {
    identity: queuedIdentity,
    completion,
    baseline,
    branchSide: implementation,
    laterWithoutBuild: 0,
    agent,
    branch,
    ...actions,
  };
}

export async function publishTakenSummaryComparisonStory(
  page: Page,
  origin: StartOrigin,
  mode: "story-branch" | "trunk" = "story-branch",
): Promise<{
  readonly identity: string;
  readonly title: string;
  readonly baseline: string;
  readonly branchTip: string;
  readonly laterWithoutBuild: number;
  readonly agent: string;
  readonly branch: string;
  readonly restoreActions: () => void;
  readonly serveRuns: StoryCiComparisonSetup["serveRuns"];
  readonly serveProofs: StoryCiComparisonSetup["serveProofs"];
}> {
  publishSummaryComparisonTrunk(origin.project);
  const baseline = await precedeClaimWithPlanning(origin);
  const { agent, workspace, branch } = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    ...(mode === "trunk" ? { mode, slug: "taken-summary-ci" } : { mode }),
  });
  changeSummaryComparisonTests(workspace);
  writeAt(workspace, "src/story.ts", "taken story work\n");
  commitAll(workspace, "story implementation on the branch");
  if (mode === "trunk") push(workspace);
  else git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
  const branchTip = git(workspace, "rev-parse", "HEAD");
  const claim = claimOf(origin.project, agent);
  const storyStart = git(origin.project, "rev-parse", `${claim}^`);
  const fromStart = revList(origin.project, storyStart, 20);
  const baselineIndex = fromStart.indexOf(baseline);
  const laterWithoutBuild = baselineIndex < 0 ? 0 : baselineIndex;

  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const takenProofs = breakdownProofs({
    baseline,
    branchSide: branchTip,
    completion: branchTip,
  });
  const baselineProof = takenProofs[101];
  const branchProof = takenProofs[102];
  if (baselineProof === undefined || branchProof === undefined) {
    throw new Error("taken summary comparison proofs missing runs 101/102");
  }
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
    {
      101: baselineProof,
      102: branchProof,
    },
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
