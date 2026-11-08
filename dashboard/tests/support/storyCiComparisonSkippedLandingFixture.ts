// Done Story Branch publishers for Intent CI comparison Landed equivalent-
// build cases (../intent/intent-ci-comparison-skipped.spec.ts): a planning-
// only landing with parent proof, the same without parent proof, and a code
// landing with no run (exact-only No build).
import { execFileSync } from "node:child_process";
import path from "node:path";
import { rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { agentIdentity } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { advanceCompletedTrunk } from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import {
  commitComparisonCiWorkflow,
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
  readonly olderBaseline: string;
};

// Trunk-first landing with no run at the merge: planning-only vs first parent
// confirms Skipped and may use the parent's equivalent-build proof; a code
// landing stays unexplained No build without ancestor figures.
async function publishLandingWithoutRun(
  page: Page,
  origin: StartOrigin,
  branchChange: "planning" | "code",
  parentProof: "summary" | "none",
): Promise<SkippedLandingSetup> {
  commitComparisonCiWorkflow(origin.project);
  writeAt(origin.project, "src/built.ts", "built before story\n");
  commitAll(origin.project, "ship a built revision");
  const olderBaseline = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);

  const claimant = "Yui";
  const identity = agentIdentity(claimant);
  const { agent, workspace, branch } = await origin.publishTake({
    agent: claimant,
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
  });

  if (branchChange === "planning") {
    writeAt(workspace, ".planning/landing-note.md", "docs-only landing\n");
    commitAll(workspace, "planning-only branch tip");
  } else {
    writeAt(workspace, "dashboard/landed.ts", "code at landing\n");
    commitAll(workspace, "code change on branch");
  }
  const branchSide = git(workspace, "rev-parse", "HEAD");
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);

  pull(origin.project);
  writeAt(origin.project, "src/built.ts", "trunk parent before landing\n");
  commitAll(origin.project, "trunk build at landing parent");
  const trunkSide = git(origin.project, "rev-parse", "HEAD");
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

  execFileSync(
    process.execPath,
    [
      path.join(
        origin.project,
        ".claude/skills/dough-product-backlog/scripts/product-backlog.mjs",
      ),
      "complete",
      "--file",
      ".planning/PRODUCT-BACKLOG.md",
      "--identity",
      queuedIdentity,
    ],
    { cwd: origin.project },
  );
  try {
    rmSync(path.join(origin.project, ".planning", identity.path));
  } catch {
    // Profile may already be gone after complete.
  }
  commitAll(origin.project, "complete the story through CLI");
  const completion = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);
  git(origin.project, "push", "--quiet", "--delete", "origin", branch);
  git(origin.project, "worktree", "remove", "--force", workspace);
  git(origin.project, "branch", "--delete", "--force", branch);

  advanceCompletedTrunk(origin);
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
    identity: queuedIdentity,
    completion,
    landingMerge,
    trunkSide,
    olderBaseline,
    baseline: olderBaseline,
    branchSide,
    laterWithoutBuild: 0,
    agent,
    branch,
    ...actions,
  };
}

export async function publishSkippedPlanningLanding(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedLandingSetup> {
  return publishLandingWithoutRun(page, origin, "planning", "summary");
}

export async function publishSkippedLandingWithoutProof(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedLandingSetup> {
  return publishLandingWithoutRun(page, origin, "planning", "none");
}

export async function publishCodeLandingWithoutBuild(
  page: Page,
  origin: StartOrigin,
): Promise<SkippedLandingSetup> {
  return publishLandingWithoutRun(page, origin, "code", "summary");
}
