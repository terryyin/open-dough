// SEED-248 later fast-forward that rewrites first-parent history while an
// earlier trunk-first landing stays selected, and SEED-253's later branch that
// started before a Trunk Mode completion and carries its done record onto a
// new first-parent path. Shared fast-forward landing helper comes from
// ./storyCiComparisonFastForward.ts.

import type { Page } from "@playwright/test";
import { storyB } from "../../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { otherQueuedIdentity, queuedIdentity } from "./startOrigin.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import {
  precedeClaimWithPlanning,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import { publishCodeLandedBeforeCompletion } from "./storyCiComparisonEarlierLanding.ts";
import { completedPublishedStory } from "./completedPublishedStory.ts";
import { laterBranchMergesTrunkAndFastForwards } from "./laterStoryMergesTrunk.ts";
import { landBranchByFastForwardOntoTrunk } from "./storyCiComparisonFastForward.ts";

// First story lands at trunk-first M; a second story merges trunk and
// fast-forwards. Selecting the first story still names M and M's story side;
// its baseline A is unchanged.
export async function publishEarlierLandingThenLaterFastForward(
  page: Page,
  origin: StartOrigin,
): Promise<
  StoryCiComparisonSetup & {
    readonly firstBaseline: string;
    readonly firstBranchSide: string;
    readonly firstLandingMerge: string;
  }
> {
  const first = await publishCodeLandedBeforeCompletion(page, origin);
  first.restoreActions();

  const firstBaseline = first.baseline;
  const firstBranchSide = first.branchAncestor ?? first.branchSide;
  const firstLandingMerge = first.landingMerge ?? first.completion;

  // Second story: story-first merge of main (rewrites first-parent of the
  // first done record), then fast-forward onto trunk.
  writeAt(origin.project, "shared-b.txt", lines("bline"));
  commitAll(origin.project, "shared file for story B");
  push(origin.project);

  // Story A is done, so Story B is all that the Backlog list held.
  const claimant = "Yui";
  const profile = agentIdentity(claimant);
  const { workspace, branch } = await origin.publishTake({
    agent: claimant,
    story: storyB,
    queued: [],
    mode: "story-branch",
  });

  writeAt(workspace, "story-b.txt", "second story work\n");
  commitAll(workspace, "story B implementation");

  pull(origin.project);
  writeAt(origin.project, "trunk-b.txt", "trunk advances for B\n");
  commitAll(origin.project, "trunk advances before story B merges");
  push(origin.project);

  git(workspace, "fetch", "--quiet", "origin", "main");
  git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  const tipB = landBranchByFastForwardOntoTrunk({
    workspace,
    project: origin.project,
    identity: otherQueuedIdentity,
    profileRelativePath: profile.path,
    branch,
    completeCommitMessage: "complete story B through CLI",
  });

  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const actions = serveActionsFor(committed, {
    [firstBaseline]: [
      wall(firstBaseline, 301, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [firstBranchSide]: [
      wall(
        firstBranchSide,
        302,
        "2026-11-05T13:00:00Z",
        "2026-11-05T13:03:20Z",
      ),
    ],
    [first.branchSide]: [],
    ...(first.trunkSide === undefined
      ? {}
      : {
          [first.trunkSide]: [
            wall(
              first.trunkSide,
              398,
              "2026-11-05T13:30:00Z",
              "2026-11-05T13:40:00Z",
            ),
          ],
        }),
    [firstLandingMerge]: [
      wall(
        firstLandingMerge,
        303,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
      ),
    ],
    [first.completion]: [
      wall(
        first.completion,
        304,
        "2026-11-05T14:30:00Z",
        "2026-11-05T14:08:00Z",
      ),
    ],
    // Second story tip must not replace the first story's A/B/C.
    [tipB]: [wall(tipB, 501, "2026-11-05T16:00:00Z", "2026-11-05T16:10:00Z")],
  });
  return {
    identity: queuedIdentity,
    completion: first.completion,
    landingMerge: firstLandingMerge,
    ...(first.trunkSide === undefined ? {} : { trunkSide: first.trunkSide }),
    baseline: firstBaseline,
    branchSide: first.branchSide,
    ...(first.branchAncestor === undefined
      ? {}
      : { branchAncestor: first.branchAncestor }),
    firstBaseline,
    firstBranchSide,
    firstLandingMerge,
    laterWithoutBuild: first.laterWithoutBuild,
    agent: first.agent,
    branch: first.branch,
    ...actions,
  };
}

// Trunk Mode Story A completes at C with its own build; another developer's
// branch, started before C, merges trunk and fast-forwards it with a build at
// that merge. Selecting Story A still names C as Landed, never the merge.
export async function publishTrunkCompletionThenEarlierBranchFastForward(
  page: Page,
  origin: StartOrigin,
) {
  const baseline = await precedeClaimWithPlanning(origin);
  const story = await completedPublishedStory(origin, "trunk");
  const later = laterBranchMergesTrunkAndFastForwards(
    origin,
    git(origin.project, "rev-parse", `${story.completion}^1`),
  );
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  serveActionsFor(committed, {
    [baseline]: [
      wall(baseline, 101, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [story.completion]: [
      wall(
        story.completion,
        103,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
      ),
    ],
    [later]: [wall(later, 501, "2026-11-05T16:00:00Z", "2026-11-05T16:10:00Z")],
  });
  return {
    identity: queuedIdentity,
    baseline,
    completion: story.completion,
    later,
  };
}
