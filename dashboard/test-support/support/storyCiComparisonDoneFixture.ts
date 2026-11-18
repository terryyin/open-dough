// Done Story Branch publisher for Intent's CI timing comparison
// (../../../e2e/intent/intent-ci-comparison.spec.ts): claim parent preceded only by planning
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
  laterWithoutBuildBeforeClaim,
  precedeClaimWithPlanning,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { defaultMixedProofs } from "./storyCiComparisonEntryProofs.ts";

// The real-CLI history a compared Story Branch publishes: planning-only
// predecessors of the claim, the completed story, and later trunk.
export type ComparedStoryHistory = Pick<
  StoryCiComparisonSetup,
  | "completion"
  | "baseline"
  | "branchSide"
  | "laterWithoutBuild"
  | "agent"
  | "branch"
>;

export async function completeComparedStoryHistory(
  origin: StartOrigin,
  variant?: "own-conflict-extra" | "non-owning-story-file",
): Promise<ComparedStoryHistory> {
  const baseline = await precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(origin, "story-branch", variant);
  const { completion, branchSide, agent, branch } = story;
  advanceCompletedTrunk(origin);
  return {
    completion,
    baseline,
    branchSide,
    laterWithoutBuild: laterWithoutBuildBeforeClaim,
    agent,
    branch,
  };
}

export async function publishComparedStoryBranch(
  page: Page,
  origin: StartOrigin,
  variant?: "own-conflict-extra" | "non-owning-story-file",
): Promise<StoryCiComparisonSetup> {
  return publishComparedHistory(
    page,
    origin,
    await completeComparedStoryHistory(origin, variant),
  );
}

// Publishes `origin`, which already holds `history`, with this case's own
// GitHub Actions answers for its baseline, branch and landed endpoints.
export async function publishComparedHistory(
  page: Page,
  origin: StartOrigin,
  history: ComparedStoryHistory,
): Promise<StoryCiComparisonSetup> {
  const { baseline, branchSide, completion } = history;
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
  return { identity: queuedIdentity, ...history, ...actions };
}
