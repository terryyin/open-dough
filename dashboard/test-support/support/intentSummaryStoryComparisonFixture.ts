// Done Story Branch publisher for Intent Summary CI timing comparison
// (../intent-summary-story-comparison*.spec.ts): Intent locations with nested
// test files, story changes (modified / added / removed / renamed), and three
// endpoint proofs with file breakdowns so entry and folder Summaries compare
// precise durations. Builds on ./storyCiComparisonFixture.ts. Proof
// summaries live in ./intentSummaryStoryComparisonProofs.ts.

import type { Page } from "@playwright/test";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import {
  laterWithoutBuildBeforeClaim,
  precedeClaimWithPlanning,
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
  await publishSummaryComparisonTrunk(origin);
  const baseline = await precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(
    origin,
    "story-branch",
    variant,
    changeSummaryComparisonTests,
    variant === undefined ? undefined : editSummaryComparisonTestInMerge,
  );
  const { completion, branchSide, agent, branch } = story;

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
      laterWithoutBuild: laterWithoutBuildBeforeClaim,
      agent,
      branch,
    },
    proofs,
  );
}
