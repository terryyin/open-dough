// Done Story Branch publishers for Intent CI comparison requested-revision
// status (../intent/intent-ci-comparison-skipped.spec.ts): a planning-only
// start with paths-ignore confirmation, a cancelled start run, and a code
// start with no run. Landed equivalent-build publishers live in
// `./storyCiComparisonSkippedLandingFixture.ts` and are re-exported here.
// Baseline walk past a proofless parent lives in
// `./storyCiComparisonSkippedBaselineWalkFixture.ts`.
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import {
  claimOf,
  commitComparisonCiWorkflow,
  precedeClaimWithPlanning,
  revList,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { defaultMixedProofs } from "./storyCiComparisonEntryProofs.ts";
import { publishSummaryComparisonTrunk } from "./intentSummaryStoryComparisonShared.ts";

export type SkippedComparisonSetup = StoryCiComparisonSetup & {
  readonly storyStart: string;
};

export {
  publishCodeLandingWithoutBuild,
  publishSkippedLandingWithoutProof,
  publishSkippedPlanningLanding,
  type SkippedLandingSetup,
} from "./storyCiComparisonSkippedLandingFixture.ts";

export {
  publishSkippedBaselinePastProoflessParent,
  type SkippedBaselinePastProoflessSetup,
} from "./storyCiComparisonSkippedBaselineWalkFixture.ts";

async function publishWithPlanningStart(
  page: Page,
  origin: StartOrigin,
  withCiWorkflow: boolean,
): Promise<SkippedComparisonSetup> {
  const baseline = await precedeClaimWithPlanning(origin, {
    withCiWorkflow,
    sharedInBaseline: true,
  });
  // Planning-only tip on the story branch (SEED-236 shape): Branch has no
  // build at the tip and walks to the integrated ancestor; paths-ignore
  // confirms Skipped. Landed still uses an exact completion build.
  let branchAncestor = "";
  const story = await completedPublishedStory(
    origin,
    "story-branch",
    undefined,
    undefined,
    undefined,
    {
      sharedAlreadyReady: true,
      beforeComplete: (workspace) => {
        branchAncestor = git(workspace, "rev-parse", "HEAD");
        writeAt(workspace, ".planning/branch-wrap.md", "wrap on branch\n");
        commitAll(workspace, "planning tip before landing");
      },
    },
  );
  const { completion, agent, branch } = story;
  const claim = claimOf(origin.project, agent);
  const storyStart = git(origin.project, "rev-parse", `${claim}^`);
  const parents = git(origin.project, "rev-list", "--parents", "-1", completion)
    .trim()
    .split(" ");
  const branchSide = parents[2] ?? completion;
  if (branchAncestor === "") {
    throw new Error("planning tip did not record the branch ancestor build");
  }
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

  const actions = serveActionsFor(
    committed,
    {
      [baseline]: [
        wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
      ],
      [branchAncestor]: [
        wall(
          branchAncestor,
          102,
          "2026-11-05T13:00:00Z",
          "2026-11-05T13:03:20Z",
        ),
      ],
      [completion]: [
        wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    },
    defaultMixedProofs({
      baseline,
      branchSide: branchAncestor,
      completion,
    }),
  );
  return {
    identity: queuedIdentity,
    completion,
    baseline,
    branchSide,
    branchAncestor,
    storyStart,
    laterWithoutBuild,
    agent,
    branch,
    ...actions,
  };
}

export async function publishSkippedPlanningBaseline(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedComparisonSetup> {
  // Intent locations so the Summary's comparison labels can name Baseline's
  // status beside the ancestor SHA (ComparisonNamed's endpoint labels).
  publishSummaryComparisonTrunk(origin.project);
  return publishWithPlanningStart(page, origin, true);
}

export async function publishCancelledBaseline(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedComparisonSetup> {
  const setup = await publishWithPlanningStart(page, origin, true);
  const branchBuild = setup.branchAncestor ?? setup.branchSide;
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [setup.storyStart]: [
      wall(
        setup.storyStart,
        199,
        "2026-11-05T12:30:00Z",
        "2026-11-05T12:31:00Z",
        "cancelled",
      ),
    ],
    [branchBuild]: [
      wall(branchBuild, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
    ],
    [setup.completion]: [
      wall(
        setup.completion,
        103,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
      ),
    ],
  });
  return setup;
}

// Story start is a code commit with no run; Baseline still uses the earlier
// built ancestor, and names No build at the start with the path reason.
export async function publishCodeStartWithoutBuild(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedComparisonSetup> {
  commitComparisonCiWorkflow(origin.project);
  writeAt(origin.project, "src/built.ts", "built before story\n");
  commitAll(origin.project, "ship a built revision");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  writeAt(origin.project, "src/built.ts", "code at story start\n");
  commitAll(origin.project, "code change at story start");
  push(origin.project);

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
  const actions = serveActionsFor(
    committed,
    {
      [baseline]: [
        wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
      ],
      [branchSide]: [
        wall(branchSide, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
      ],
      [completion]: [
        wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    },
    defaultMixedProofs({ baseline, branchSide, completion }),
  );
  return {
    identity: queuedIdentity,
    completion,
    baseline,
    branchSide,
    storyStart,
    laterWithoutBuild,
    agent,
    branch,
    ...actions,
  };
}
