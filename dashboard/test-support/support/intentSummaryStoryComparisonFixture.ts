// Done Story Branch publisher for Intent Summary CI timing comparison
// (../intent-summary-story-comparison*.spec.ts): Intent locations with nested
// test files, story changes (modified / added / removed / renamed), and three
// endpoint proofs with file breakdowns so entry and folder Summaries compare
// precise durations. Builds on ./storyCiComparisonFixture.ts. Proof
// summaries live in ./intentSummaryStoryComparisonProofs.ts.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import {
  advanceAfterCompletion,
  author,
  claimant,
  implemented,
  otherStory,
  storyBranch,
  trunkInterleaved,
  trunkWriterShared,
  yuiClaim,
} from "./completedStoryThroughInterleaving.ts";
import { landStoryBranchOntoTip } from "./completedOwnMergeHistory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, lines, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import {
  laterWithoutBuildBeforeClaim,
  precedeClaimWithPlanning,
  type ComparisonProofServe,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { publishDeclaredTrunk } from "./storyCiComparisonBaseline.ts";
import { serveSummaryComparisonStory } from "./intentSummaryStoryComparisonServing.ts";
import {
  publishSummaryComparisonTrunk,
  summaryComparisonChangeRevision,
  summaryComparisonChanges,
} from "./intentSummaryStoryComparisonShared.ts";

export {
  breakdownProofs,
  noBreakdownBaselineProofs,
  outsideLandedProofs,
} from "./intentSummaryStoryComparisonProofs.ts";
export { summaryComparisonChanges };

const agentOnly = '{"agent":"only"}\n';
const otherProfile = '{"agent":"other"}\n';
const checksBefore = lines("check");
const checksAfter = `${lines("check")}renamed\n`;
const resolvedShared = lines("line")
  .replace("line 0\n", "resolved story and trunk\n")
  .replace("line 11\n", "other last\n");
const trunkFirstShared = lines("line")
  .replace("line 0\n", "trunk first\n")
  .replace("line 11\n", "other last\n");
const changeFiles = {
  ...(summaryComparisonChangeRevision.files as Record<string, string>),
};
const changeRemove = [...(summaryComparisonChangeRevision.remove ?? [])];

function summaryComparisonCompletionOntoTip(variant?: "own-conflict-extra") {
  const storyFiles = { ...implemented, ...changeFiles };
  if (variant === "own-conflict-extra") {
    const tip = {
      ...storyFiles,
      "shared.txt": resolvedShared,
      ...otherStory,
      "profiles/only.json": agentOnly,
      "agents/other.json": otherProfile,
      "checks/after.test.mjs": checksAfter,
      "merge-resolution.txt": "integration edit\n",
      "dashboard/tests/folder/nested/c.spec.ts": `${lines("c")}merge edit\n`,
    };
    return landStoryBranchOntoTip(
      makeMe.aRepository
        .withRevision("shared", {
          files: {
            "shared.txt": lines("line"),
            "agents/only.json": agentOnly,
            "checks/before.test.mjs": checksBefore,
          },
        })
        .withRevision("claim", yuiClaim(storyBranch))
        .withRevision("implementation", {
          message: "story implementation",
          author,
          files: { ...storyFiles, "profiles/only.json": agentOnly },
          remove: ["agents/only.json", ...changeRemove],
        })
        .withRevision("interleaving", {
          parents: ["claim"],
          message: "another writer interleaves",
          files: {
            "shared.txt": trunkFirstShared,
            ...otherStory,
            "agents/other.json": otherProfile,
          },
        })
        .withRevision("integration", {
          parents: ["implementation", "interleaving"],
          message: "resolve story integration conflict",
          author,
          files: tip,
          remove: ["checks/before.test.mjs", ...changeRemove],
        }),
      "interleaving",
      {
        "shared.txt": trunkFirstShared,
        ...otherStory,
        "agents/only.json": agentOnly,
        "agents/other.json": otherProfile,
        "checks/before.test.mjs": checksBefore,
      },
      tip,
      changeRemove,
    );
  }
  const tip = {
    ...storyFiles,
    "shared.txt": lines("line")
      .replace("line 0\n", "story first\n")
      .replace("line 11\n", "other last\n"),
    ...otherStory,
  };
  return landStoryBranchOntoTip(
    makeMe.aRepository
      .withRevision("shared", { files: { "shared.txt": lines("line") } })
      .withRevision("claim", yuiClaim(storyBranch))
      .withRevision("implementation", {
        message: "story implementation",
        author,
        files: storyFiles,
        remove: changeRemove,
      })
      .withRevision("interleaving", {
        parents: ["claim"],
        message: "another writer interleaves",
        files: trunkInterleaved,
      })
      .withRevision("integration", {
        parents: ["implementation", "interleaving"],
        message: "merge trunk into the story",
        author,
        files: tip,
        remove: changeRemove,
      }),
    "interleaving",
    { "shared.txt": trunkWriterShared, ...otherStory },
    tip,
    changeRemove,
  );
}

export async function publishSummaryComparisonStory(
  page: Page,
  origin: StartOrigin,
  {
    variant,
    later,
    proofs,
  }: {
    variant?: "own-conflict-extra" | undefined;
    later?: RevisionFacts | undefined;
    proofs?: Record<number, ComparisonProofServe> | undefined;
  } = {},
): Promise<StoryCiComparisonSetup> {
  await publishSummaryComparisonTrunk(origin);
  const baseline = await precedeClaimWithPlanning(origin);
  const commits = await publishDeclaredTrunk(
    origin,
    summaryComparisonCompletionOntoTip(variant),
  );
  writeAt(
    origin.project,
    "dashboard/tests/later.spec.ts",
    "later trunk file\n",
  );
  if (later !== undefined) writeRevisionFiles(origin.project, later);
  commitAll(origin.project, "later trunk file after the story");
  push(origin.project);
  await publishDeclaredTrunk(
    origin,
    makeMe.aRepository.withRevision(
      "advance after completion",
      advanceAfterCompletion,
    ),
  );

  return serveSummaryComparisonStory(
    page,
    origin,
    {
      completion: commits.completion,
      baseline,
      branchSide: commits["branch completion"],
      laterWithoutBuild: laterWithoutBuildBeforeClaim,
      agent: claimant.agent,
      branch: storyBranch,
    },
    proofs,
  );
}
