// Done Story Branch publisher for Intent's CI timing comparison
// (../intent/intent-ci-comparison.spec.ts): claim parent preceded only by planning
// commits, with baseline / branch / landed Actions runs and default mixed
// entry proofs. Shared helpers come from ./storyCiComparisonFixture.ts.

import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";
import {
  claimOf,
  precedeClaimWithPlanning,
  revList,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { defaultMixedProofs } from "./storyCiComparisonEntryProofs.ts";

export async function publishComparedStoryBranch(
  page: Page,
  origin: StartOrigin,
  variant?: "own-conflict-extra" | "non-owning-story-file",
): Promise<StoryCiComparisonSetup> {
  const baseline = precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(origin, "story-branch", variant);
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
    laterWithoutBuild,
    agent,
    branch,
    ...actions,
  };
}
