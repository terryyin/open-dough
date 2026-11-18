// SEED-248 fast-forward landing shape for Intent's CI timing comparison:
// story-first merge of main then trunk fast-forward (B and C name the tip;
// main-side parent never B). Later-story first-parent rewrite lives in
// ./storyCiComparisonLaterFastForward.ts. Shared helpers come from
// ./storyCiComparisonFixture.ts.

import { execFileSync } from "node:child_process";
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
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import {
  precedeClaimWithPlanning,
  serveActionsFor,
  wall,
  type StoryCiComparisonSetup,
} from "./storyCiComparisonFixture.ts";

function completeOnWorkspace(workspace: string, identity: string) {
  execFileSync(
    process.execPath,
    [
      path.join(
        workspace,
        ".claude/skills/dough-product-backlog/scripts/product-backlog.mjs",
      ),
      "complete",
      "--file",
      ".planning/PRODUCT-BACKLOG.md",
      "--identity",
      identity,
    ],
    { cwd: workspace },
  );
}

// Complete on the story workspace, push the branch, fast-forward trunk onto
// that tip, and remove the temporary branch/worktree.
export function landBranchByFastForwardOntoTrunk(args: {
  readonly workspace: string;
  readonly project: string;
  readonly identity: string;
  readonly profileRelativePath: string;
  readonly branch: string;
  readonly completeCommitMessage: string;
}): string {
  completeOnWorkspace(args.workspace, args.identity);
  try {
    rmSync(path.join(args.workspace, ".planning", args.profileRelativePath));
  } catch {
    // Profile may already be gone after complete.
  }
  commitAll(args.workspace, args.completeCommitMessage);
  const tip = git(args.workspace, "rev-parse", "HEAD");
  git(
    args.workspace,
    "push",
    "--quiet",
    "origin",
    `HEAD:refs/heads/${args.branch}`,
  );

  pull(args.project);
  git(args.project, "fetch", "--quiet", "origin", args.branch);
  git(args.project, "merge", "--quiet", "--ff-only", `origin/${args.branch}`);
  const completion = git(args.project, "rev-parse", "HEAD");
  if (completion !== tip) {
    throw new Error(`fast-forward tip ${completion} does not match ${tip}`);
  }
  push(args.project);
  git(args.project, "push", "--quiet", "--delete", "origin", args.branch);
  git(args.project, "worktree", "remove", "--force", args.workspace);
  git(args.project, "branch", "--delete", "--force", args.branch);
  return tip;
}

// Story Branch lands by fast-forward after a story-first merge of main: tip T
// is B and C; the main-side parent of that merge has a tempting build that
// must never appear as B. Trunk advances one revision past T unless
// `tipIsTrunkHead` leaves T as the published trunk head.
export async function publishFastForwardLandedStory(
  page: Page,
  origin: StartOrigin,
  tipIsTrunkHead = false,
): Promise<StoryCiComparisonSetup & { readonly mainSide: string }> {
  const baseline = await precedeClaimWithPlanning(origin);
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);

  const claimant = "Yui";
  const identity = agentIdentity(claimant);
  const { agent, workspace, branch } = await origin.publishTake({
    agent: claimant,
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
  });

  writeAt(
    workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "story first\n"),
  );
  writeAt(workspace, "[literal]*.txt", "delivered on another machine\n");
  commitAll(workspace, "story implementation");

  pull(origin.project);
  writeAt(origin.project, "other-story.txt", "another story\n");
  commitAll(origin.project, "another writer interleaves");
  push(origin.project);

  git(workspace, "fetch", "--quiet", "origin", "main");
  const mainSide = git(workspace, "rev-parse", "origin/main");
  git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  const storyFirstMerge = git(workspace, "rev-parse", "HEAD");
  const mergeParents = git(
    workspace,
    "rev-list",
    "--parents",
    "-1",
    storyFirstMerge,
  )
    .trim()
    .split(" ");
  if ((mergeParents[2] ?? "") !== mainSide) {
    throw new Error(
      `story-first merge second parent ${mergeParents[2] ?? ""} does not match main ${mainSide}`,
    );
  }

  const tip = landBranchByFastForwardOntoTrunk({
    workspace,
    project: origin.project,
    identity: queuedIdentity,
    profileRelativePath: identity.path,
    branch,
    completeCommitMessage: "complete the story through CLI",
  });

  if (!tipIsTrunkHead) advanceCompletedTrunk(origin);

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
      wall(baseline, 401, "2026-11-05T12:00:00Z", "2026-11-05T12:03:00Z"),
    ],
    // Tempting main-side parent of the story-first merge — never B.
    [mainSide]: [
      wall(mainSide, 498, "2026-11-05T13:30:00Z", "2026-11-05T13:40:00Z"),
    ],
    [tip]: [wall(tip, 402, "2026-11-05T14:00:00Z", "2026-11-05T14:03:20Z")],
  });
  return {
    identity: queuedIdentity,
    completion: tip,
    baseline,
    branchSide: tip,
    mainSide,
    laterWithoutBuild: 1,
    agent,
    branch,
    ...actions,
  };
}
