// Done Story Branch publisher for Intent Summary CI timing comparison
// (../intent-summary-story-comparison*.spec.ts): Intent locations with nested
// test files, story changes (modified / added / removed / renamed), and three
// endpoint proofs with file breakdowns so entry and folder Summaries compare
// precise durations. Builds on ./storyCiComparisonDoneFixture.ts. Proof
// summaries live in ./intentSummaryStoryComparisonProofs.ts; Trunk Mode and
// Taken publishers in ./intentSummaryStoryComparisonVariantPublishers.ts.

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
  precedeClaimWithPlanning,
  revList,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { breakdownProofs } from "./intentSummaryStoryComparisonProofs.ts";
import {
  changeSummaryComparisonTests,
  publishSummaryComparisonTrunk,
  summaryComparisonChanges,
} from "./intentSummaryStoryComparisonShared.ts";

export {
  breakdownProofs,
  noBreakdownBaselineProofs,
} from "./intentSummaryStoryComparisonProofs.ts";
export { summaryComparisonChanges };
export {
  publishSummaryComparisonTrunkStory,
  publishTakenSummaryComparisonStory,
} from "./intentSummaryStoryComparisonVariantPublishers.ts";

export async function publishSummaryComparisonStory(
  page: Page,
  origin: StartOrigin,
): Promise<StoryCiComparisonSetup> {
  publishSummaryComparisonTrunk(origin.project);
  const baseline = precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(
    origin,
    "story-branch",
    undefined,
    changeSummaryComparisonTests,
  );
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

  // A file added to trunk after the story: listed in Intent, absent from the
  // compared builds' proofs.
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
        wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
      ],
      [branchSide]: [
        wall(branchSide, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
      ],
      [completion]: [
        wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    },
    breakdownProofs({ baseline, branchSide, completion }),
  );
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
