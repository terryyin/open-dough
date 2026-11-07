// SEED-236 / SEED-248 shape for Intent's CI timing comparison: code lands in
// an earlier trunk-first owning merge M with its own build; completion is a
// later single-parent trunk commit D with a different build. Branch uses a
// measured ancestor of M's story side; Landed uses M exactly — never D, a
// later trunk build, or M's trunk-side parent. Shared helpers come from
// ./storyCiComparisonFixture.ts.

import { execFileSync } from "node:child_process";
import path from "node:path";
import { rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  agentIdentity,
  agentNameOf,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { advanceCompletedTrunk } from "./completedPublishedStory.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import {
  comparisonWorkflowPath,
  precedeClaimWithPlanning,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";

export async function publishCodeLandedBeforeCompletion(
  page: Page,
  origin: StartOrigin,
  workflowRemovedBeforeLanding = false,
): Promise<StoryCiComparisonSetup> {
  const baseline = precedeClaimWithPlanning(origin);
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);
  const agent = await origin.takenByAnotherAgent();
  const workspace = path.join(origin.machine, "another-agent-workspace");
  const branch = "claude/another-agent";
  const name = agentNameOf(agent);
  if (name === undefined) throw new Error(`unknown agent ${agent}`);
  const identity = agentIdentity(name);

  writeAt(
    workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "story first\n"),
  );
  writeAt(workspace, "[literal]*.txt", "delivered on another machine\n");
  commitAll(workspace, "story implementation");
  const branchAncestor = git(workspace, "rev-parse", "HEAD");
  // Planning-only tip: CI ignores .planning/**, so the merge's branch side
  // has no build.
  writeAt(workspace, ".planning/branch-wrap.md", "wrap on branch\n");
  commitAll(workspace, "planning tip before landing");
  const branchSide = git(workspace, "rev-parse", "HEAD");
  git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);

  pull(origin.project);
  writeAt(origin.project, "other-story.txt", "another story\n");
  if (workflowRemovedBeforeLanding) {
    rmSync(path.join(origin.project, comparisonWorkflowPath));
  }
  commitAll(origin.project, "another writer interleaves");
  push(origin.project);

  // Take already published the claim on trunk. An agent-authored landing
  // merge whose first parent still claims is recovered as owning.
  git(origin.project, "fetch", "--quiet", "origin", branch);
  git(origin.project, "config", "user.name", identity.agent);
  git(origin.project, "config", "user.email", identity.email);
  const trunkSide = git(origin.project, "rev-parse", "HEAD");
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

  // Later single-parent completion on trunk (done record only).
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

  const parents = git(
    origin.project,
    "rev-list",
    "--parents",
    "-1",
    landingMerge,
  )
    .trim()
    .split(" ");
  expectBranchSide(parents[2] ?? "", branchSide);
  if ((parents[1] ?? "") !== trunkSide) {
    throw new Error(
      `landing trunk side ${parents[1] ?? ""} does not match ${trunkSide}`,
    );
  }

  advanceCompletedTrunk(origin);
  // A later trunk build that must not stand in for Branch or Landed.
  writeAt(origin.project, "later-ci.txt", "later built trunk\n");
  commitAll(origin.project, "later trunk build after completion");
  const laterTrunk = git(origin.project, "rev-parse", "HEAD");
  push(origin.project);

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
    // Trunk-side parent of M: a tempting build that must never become C.
    [trunkSide]: [
      wall(trunkSide, 398, "2026-11-05T13:30:00Z", "2026-11-05T13:40:00Z"),
    ],
    [landingMerge]: [
      wall(landingMerge, 303, "2026-11-05T14:00:00Z", "2026-11-05T14:04:00Z"),
    ],
    // Completion D and later trunk must not replace M as Landed.
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
    laterWithoutBuild: 1,
    agent,
    branch,
    ...actions,
  };
}

function expectBranchSide(actual: string, expected: string) {
  if (actual !== expected) {
    throw new Error(
      `landing branch side ${actual} does not match tip ${expected}`,
    );
  }
}

// SEED-236 / SEED-248 gap journeys: same A/B/tempting builds as the happy
// path, with Landed at M overridden (failed or cancelled) while completion D
// and the trunk-side parent keep builds that must not become C.
export function serveEarlierLandingWithLandedOutcome(
  setup: StoryCiComparisonSetup,
  landedConclusion: "failure" | "cancelled",
): void {
  const landed = setup.landingMerge ?? setup.completion;
  const branchBuild = setup.branchAncestor ?? setup.branchSide;
  setup.serveRuns({
    [setup.baseline]: [
      wall(setup.baseline, 301, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    [branchBuild]: [
      wall(branchBuild, 302, "2026-11-05T13:00:00Z", "2026-11-05T13:03:20Z"),
    ],
    [setup.branchSide]: [],
    ...(setup.trunkSide === undefined
      ? {}
      : {
          [setup.trunkSide]: [
            wall(
              setup.trunkSide,
              398,
              "2026-11-05T13:30:00Z",
              "2026-11-05T13:40:00Z",
            ),
          ],
        }),
    [landed]: [
      wall(
        landed,
        303,
        "2026-11-05T14:00:00Z",
        "2026-11-05T14:04:00Z",
        landedConclusion,
      ),
    ],
    [setup.completion]: [
      wall(
        setup.completion,
        304,
        "2026-11-05T14:30:00Z",
        "2026-11-05T14:08:00Z",
      ),
    ],
  });
}
