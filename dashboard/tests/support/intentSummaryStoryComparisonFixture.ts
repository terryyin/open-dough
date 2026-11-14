// Done Story Branch publisher for Intent Summary CI timing comparison
// (../intent-summary-story-comparison*.spec.ts): Intent locations with nested
// test files, story changes (modified / added / removed / renamed), and three
// endpoint proofs with file breakdowns so entry and folder Summaries compare
// precise durations. Builds on ./storyCiComparisonDoneFixture.ts. Proof
// summaries live in ./intentSummaryStoryComparisonProofs.ts; Trunk Mode and
// Taken publishers in ./intentSummaryStoryComparisonVariantPublishers.ts.

import type { Page } from "@playwright/test";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import {
  claimOf,
  precedeClaimWithPlanning,
  revList,
  type ComparisonProofServe,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { serveSummaryComparisonStory } from "./intentSummaryStoryComparisonServing.ts";
import {
  changeSummaryComparisonTests,
  editSummaryComparisonTestInMerge,
  publishSummaryComparisonTrunk,
  summaryComparisonChanges,
} from "./intentSummaryStoryComparisonShared.ts";

export {
  breakdownProofs,
  noBreakdownBaselineProofs,
  outsideLandedProofs,
} from "./intentSummaryStoryComparisonProofs.ts";
export { summaryComparisonChanges };
export {
  publishSummaryComparisonTrunkStory,
  publishTakenSummaryComparisonStory,
} from "./intentSummaryStoryComparisonVariantPublishers.ts";

export async function publishSummaryComparisonStory(
  page: Page,
  origin: StartOrigin,
  {
    variant,
    later,
    proofs,
  }: {
    // Owning merge-resolution edits, with an Intent test file edited by the
    // story's integration merge.
    variant?: "own-conflict-extra" | undefined;
    // Later published facts never become the Done story's source or diff.
    later?: RevisionFacts | undefined;
    // Collectors replacing these proofs pass `{}` to omit unused summaries.
    proofs?: Record<number, ComparisonProofServe> | undefined;
  } = {},
): Promise<StoryCiComparisonSetup> {
  publishSummaryComparisonTrunk(origin.project);
  const baseline = await precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(
    origin,
    "story-branch",
    variant,
    changeSummaryComparisonTests,
    variant === undefined ? undefined : editSummaryComparisonTestInMerge,
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

  // A file added to trunk after the story: absent from the Done browser
  // and from the compared builds' proofs.
  writeAt(
    origin.project,
    "dashboard/tests/later.spec.ts",
    "later trunk file\n",
  );
  if (later !== undefined) writeRevisionFiles(origin.project, later);
  commitAll(origin.project, "later trunk file after the story");
  push(origin.project);

  advanceCompletedTrunk(origin);

  return serveSummaryComparisonStory(
    page,
    origin,
    {
      completion,
      baseline,
      branchSide,
      laterWithoutBuild,
      agent,
      branch,
    },
    proofs,
  );
}
