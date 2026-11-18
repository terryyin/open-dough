// Done Story Branch publishers for Intent CI comparison Landed equivalent-
// build cases (../../../e2e/intent/intent-ci-comparison-skipped-landed.spec.ts): a
// planning-only landing with parent proof and the same without parent proof.
// `publishUnbuiltStoryLanding` also serves a code landing with no run
// (./missingLandedRun.ts).
import path from "node:path";
import { rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import {
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { advanceCompletedTrunk } from "./completedPublishedStory.ts";
import { completeBacklogStory } from "./completedStoryPublication.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import {
  aComparisonCiTrunk,
  publishDeclaredTrunk,
} from "./storyCiComparisonBaseline.ts";
import {
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";
import {
  mixedEntrySummary,
  proofRun,
  type ComparisonProofServe,
} from "./storyCiComparisonEntryProofs.ts";

export type SkippedLandingSetup = StoryCiComparisonSetup & {
  readonly landingMerge: string;
  readonly trunkSide: string;
  readonly claim: string;
  readonly olderBaseline: string;
};

// Trunk-first landing with no run at the merge: planning-only vs first parent
// confirms Skipped and may use the parent's equivalent-build proof; a code
// landing stays unexplained No build without ancestor figures.
export async function publishUnbuiltStoryLanding(
  origin: StartOrigin,
  branchChange: "planning" | "code",
) {
  const { "built baseline": olderBaseline } = await publishDeclaredTrunk(
    origin,
    aComparisonCiTrunk().withRevision("built baseline", {
      message: "ship a built revision",
      files: { "src/built.ts": "built before story\n" },
    }),
  );

  const claimant = "Yui";
  const identity = agentIdentity(claimant);
  const { agent, workspace, branch, claim } = await origin.publishTake({
    agent: claimant,
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
  });

  if (branchChange === "planning")
    writeAt(workspace, ".planning/landing-note.md", "docs-only landing\n");
  else writeAt(workspace, "dashboard/landed.ts", "code at landing\n");
  const branchSide = commitAll(
    workspace,
    branchChange === "planning"
      ? "planning-only branch tip"
      : "code change on branch",
  );
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);

  pull(origin.project);
  writeAt(origin.project, "src/built.ts", "trunk parent before landing\n");
  const trunkSide = commitAll(origin.project, "trunk build at landing parent");
  push(origin.project);

  git(origin.project, "fetch", "--quiet", "origin", branch);
  git(origin.project, "config", "user.name", identity.agent);
  git(origin.project, "config", "user.email", identity.email);
  git(
    origin.project,
    "merge",
    "--quiet",
    "--no-ff",
    "--no-edit",
    `origin/${branch}`,
  );
  const landingMerge = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);

  completeBacklogStory(origin.project);
  try {
    rmSync(path.join(origin.project, ".planning", identity.path));
  } catch {
    // Profile may already be gone after complete.
  }
  const completion = commitAll(
    origin.project,
    "complete the story through CLI",
  );
  push(origin.project);
  git(origin.project, "push", "--quiet", "--delete", "origin", branch);
  git(origin.project, "worktree", "remove", "--force", workspace);
  git(origin.project, "branch", "--delete", "--force", branch);

  advanceCompletedTrunk(origin);
  return {
    identity: queuedIdentity,
    completion,
    landingMerge,
    trunkSide,
    claim,
    olderBaseline,
    baseline: olderBaseline,
    branchSide,
    laterWithoutBuild: 0,
    agent,
    branch,
  };
}

async function publishLandingWithoutRun(
  page: Page,
  origin: StartOrigin,
  parentProof: "summary" | "none",
): Promise<SkippedLandingSetup> {
  const setup = await publishUnbuiltStoryLanding(origin, "planning");
  const { olderBaseline, trunkSide, branchSide, landingMerge, completion } =
    setup;
  const published = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });

  const parentProofServe: ComparisonProofServe =
    parentProof === "summary"
      ? {
          kind: "summary",
          artifactId: 1201,
          summary: mixedEntrySummary(proofRun(201, trunkSide), "landed"),
        }
      : { kind: "none" };

  const actions = serveActionsFor(
    committed,
    {
      [olderBaseline]: [
        wall(
          olderBaseline,
          101,
          "2026-11-05T12:00:00Z",
          "2026-11-05T12:03:00Z",
        ),
      ],
      [trunkSide]: [
        wall(trunkSide, 201, "2026-11-05T13:30:00Z", "2026-11-05T13:35:00Z"),
      ],
      [branchSide]: [
        wall(branchSide, 102, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
      ],
      [landingMerge]: [],
      [completion]: [
        wall(completion, 103, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
      ],
    },
    {
      101: {
        kind: "summary",
        artifactId: 1001,
        summary: mixedEntrySummary(proofRun(101, olderBaseline), "baseline"),
      },
      102: {
        kind: "summary",
        artifactId: 1002,
        summary: mixedEntrySummary(proofRun(102, branchSide), "branch"),
      },
      201: parentProofServe,
      103: {
        kind: "summary",
        artifactId: 1003,
        summary: mixedEntrySummary(proofRun(103, completion), "landed"),
      },
    },
  );
  return {
    ...setup,
    ...actions,
  };
}

export async function publishSkippedPlanningLanding(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedLandingSetup> {
  return publishLandingWithoutRun(page, origin, "summary");
}

export async function publishSkippedLandingWithoutProof(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedLandingSetup> {
  return publishLandingWithoutRun(page, origin, "none");
}
