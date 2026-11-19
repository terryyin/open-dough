// Done Story Branch publishers for Intent CI comparison Landed equivalent-
// build cases (../../../e2e/intent/intent-ci-comparison-skipped-landed.spec.ts): a
// planning-only landing with parent proof and the same without parent proof.
// `publishUnbuiltStoryLanding` also serves a code landing with no run
// (./missingLandedRun.ts).
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  advanceAfterCompletion,
  author,
  claimant,
  freshYuiCompletion,
  storyBranch,
  yuiClaim,
} from "./completedStoryThroughInterleaving.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";
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

function unbuiltLandingOntoTip(branchChange: "planning" | "code") {
  const completion = freshYuiCompletion();
  const branchFiles =
    branchChange === "planning"
      ? { ".planning/landing-note.md": "docs-only landing\n" }
      : { "dashboard/landed.ts": "code at landing\n" };
  return makeMe.aRepository
    .withRevision("claim", yuiClaim(storyBranch))
    .withRevision("branch tip", {
      message:
        branchChange === "planning"
          ? "planning-only branch tip"
          : "code change on branch",
      author,
      files: branchFiles,
    })
    .withRevision("trunk side", {
      parents: ["claim"],
      message: "trunk build at landing parent",
      files: { "src/built.ts": "trunk parent before landing\n" },
    })
    .withRevision("landing merge", {
      parents: ["trunk side", "branch tip"],
      message: "Merge branch into trunk",
      author,
      committer: author,
      files: {
        "src/built.ts": "trunk parent before landing\n",
        ...branchFiles,
      },
    })
    .withRevision("completion", {
      ...completion,
      parents: ["landing merge"],
      author,
    })
    .withRevision("advance after completion", advanceAfterCompletion);
}

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
  const commits = await publishDeclaredTrunk(
    origin,
    unbuiltLandingOntoTip(branchChange),
  );
  return {
    identity: queuedIdentity,
    completion: commits.completion,
    landingMerge: commits["landing merge"],
    trunkSide: commits["trunk side"],
    claim: commits.claim,
    olderBaseline,
    baseline: olderBaseline,
    branchSide: commits["branch tip"],
    laterWithoutBuild: 0,
    agent: claimant.agent,
    branch: storyBranch,
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
