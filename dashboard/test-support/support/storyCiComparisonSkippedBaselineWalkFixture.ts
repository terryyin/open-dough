// Baseline walk past a timed parent without usable proof
// (../intent/intent-ci-comparison-skipped.spec.ts): planning-only start whose
// parent build serves no proof and whose grandparent serves proof, so Baseline
// uses the grandparent and counts two revisions passed over.
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceCompletedTrunk,
  completedPublishedStory,
} from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import {
  claimOf,
  commitComparisonCiWorkflow,
  revList,
  serveActionsFor,
  wall,
} from "./storyCiComparisonFixture.ts";
import {
  mixedEntrySummary,
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";
import type { StoryCiComparisonSetup } from "./storyCiComparisonFixture.ts";

export type SkippedBaselinePastProoflessSetup = StoryCiComparisonSetup & {
  readonly storyStart: string;
  readonly prooflessParent: string;
};

export async function publishSkippedBaselinePastProoflessParent(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedBaselinePastProoflessSetup> {
  commitComparisonCiWorkflow(origin.project);
  writeAt(origin.project, "src/built.ts", "grandparent built\n");
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "ship a built grandparent");
  const baseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);

  writeAt(origin.project, "src/built.ts", "parent built without proof\n");
  commitAll(origin.project, "ship a built parent without proof");
  const prooflessParent = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);

  await origin.publishRevision({
    message: "planning: story start",
    files: { ".planning/story-start.md": "planning at start\n" },
  });

  const story = await completedPublishedStory(
    origin,
    "story-branch",
    undefined,
    undefined,
    undefined,
    { sharedAlreadyReady: true },
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

  advanceCompletedTrunk(origin);
  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });

  const proofs: Record<number, ComparisonProofServe> = {
    100: {
      kind: "summary",
      artifactId: 1000,
      summary: mixedEntrySummary(proofRun(100, baseline), "baseline"),
    },
    101: { kind: "none" },
    102: {
      kind: "summary",
      artifactId: 1002,
      summary: mixedEntrySummary(proofRun(102, branchSide), "branch"),
    },
    103: {
      kind: "summary",
      artifactId: 1003,
      summary: mixedEntrySummary(proofRun(103, completion), "landed"),
    },
  };
  const actions = serveActionsFor(
    committed,
    {
      [baseline]: [
        wall(baseline, 100, "2026-11-05T11:00:00Z", "2026-11-05T11:03:00Z"),
      ],
      [prooflessParent]: [
        wall(
          prooflessParent,
          101,
          "2026-11-05T11:30:00Z",
          "2026-11-05T11:33:00Z",
        ),
      ],
      [branchSide]: [
        wall(branchSide, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
      ],
      [completion]: [
        wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    },
    proofs,
  );
  return {
    identity: queuedIdentity,
    completion,
    baseline,
    branchSide,
    storyStart,
    prooflessParent,
    laterWithoutBuild,
    agent,
    branch,
    ...actions,
  };
}
