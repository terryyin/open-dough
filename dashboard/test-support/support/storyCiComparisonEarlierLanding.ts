// SEED-236 / SEED-248 shape for Intent's CI timing comparison: code lands in
// an earlier trunk-first owning merge M with its own build; completion is a
// later single-parent trunk commit D with a different build. Branch uses a
// measured ancestor of M's story side; Landed uses M exactly — never D, a
// later trunk build, or M's trunk-side parent. Failed and cancelled Landed
// outcomes are served by ./storyCiComparisonLandedOutcome.ts; shared helpers
// come from ./storyCiComparisonFixture.ts.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceAfterCompletion,
  author,
  claimant,
  freshYuiCompletion,
  implemented,
  otherStory,
  storyBranch,
  trunkWriterShared,
  yuiClaim,
} from "./completedStoryThroughInterleaving.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { git, lines } from "./storyReviewWorktree.ts";
import { publishDeclaredTrunk } from "./storyCiComparisonBaseline.ts";
import {
  comparisonWorkflowPath,
  precedeClaimWithPlanning,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";

function earlierLandingCompletionOntoTip(
  workflowRemovedBeforeLanding: boolean,
) {
  const completion = freshYuiCompletion();
  return makeMe.aRepository
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision("claim", yuiClaim(storyBranch))
    .withRevision("implementation", {
      message: "story implementation",
      author,
      files: implemented,
    })
    .withRevision("branch wrap", {
      message: "planning tip before landing",
      author,
      files: { ".planning/branch-wrap.md": "wrap on branch\n" },
    })
    .withRevision("interleaving", {
      parents: ["claim"],
      message: "another writer interleaves",
      files: {
        "shared.txt": trunkWriterShared,
        ...otherStory,
      },
      ...(workflowRemovedBeforeLanding
        ? { remove: [comparisonWorkflowPath] }
        : {}),
    })
    .withRevision("landing merge", {
      parents: ["interleaving", "branch wrap"],
      message: "Merge branch into trunk",
      author,
      committer: author,
      files: {
        ...implemented,
        "shared.txt": trunkWriterShared,
        ...otherStory,
        ".planning/branch-wrap.md": "wrap on branch\n",
      },
    })
    .withRevision("completion", {
      ...completion,
      parents: ["landing merge"],
      author,
    })
    .withRevision("advance after completion", advanceAfterCompletion)
    .withRevision("later trunk build", {
      message: "later trunk build after completion",
      files: { "later-ci.txt": "later built trunk\n" },
    });
}

export async function publishCodeLandedBeforeCompletion(
  page: Page,
  origin: StartOrigin,
  workflowRemovedBeforeLanding = false,
): Promise<
  StoryCiComparisonSetup &
    Required<
      Pick<
        StoryCiComparisonSetup,
        "landingMerge" | "trunkSide" | "branchAncestor"
      >
    > & {
      // The trunk advance after completion, parent of the later trunk build.
      readonly advanced: string;
    }
> {
  const baseline = await precedeClaimWithPlanning(origin);
  const commits = await publishDeclaredTrunk(
    origin,
    earlierLandingCompletionOntoTip(workflowRemovedBeforeLanding),
  );
  const branchAncestor = commits.implementation;
  const branchSide = commits["branch wrap"];
  const trunkSide = commits.interleaving;
  const landingMerge = commits["landing merge"];
  const completion = commits.completion;
  const advanced = commits["advance after completion"];
  const laterTrunk = commits["later trunk build"];

  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  const actions = serveActionsFor(committed, {
    [baseline]: [
      wall(baseline, 301, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [branchAncestor]: [
      wall(branchAncestor, 302, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
    ],
    [branchSide]: [],
    [trunkSide]: [
      wall(trunkSide, 398, "2026-11-05T13:30:00Z", "2026-11-05T13:40:00Z"),
    ],
    [landingMerge]: [
      wall(landingMerge, 303, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
    ],
    [completion]: [
      wall(completion, 304, "2026-11-05T14:30:00Z", "2026-11-05T14:08:00Z"),
    ],
    [laterTrunk]: [
      wall(laterTrunk, 399, "2026-11-05T15:00:00Z", "2026-11-05T15:10:00Z"),
    ],
  });
  return {
    identity: queuedIdentity,
    completion,
    landingMerge,
    trunkSide,
    baseline,
    branchSide,
    branchAncestor,
    advanced,
    laterWithoutBuild: 1,
    agent: claimant.agent,
    branch: storyBranch,
    ...actions,
  };
}
