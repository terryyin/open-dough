// Mid-test Git and capture actions around a declared completed story: a trunk
// advance after the first review read, an unusable retained capture, and a
// later developer's merge that carries the done record onto trunk's
// first-parent path. Declared histories live in ./completedStoryHistory.ts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { storyALaunchRecord } from "./storyLaunchRecord.ts";
import {
  authoredBy,
  commitAllAs,
  pull,
  push,
} from "./storyReviewTrunkCommits.ts";
import { git } from "./storyReviewWorktree.ts";

export function advanceCompletedTrunk(origin: StartOrigin) {
  pull(origin.project);
  const advanced = makeMe
    .theWorkspace(origin.project)
    .writeAt("later.txt", "later trunk\n")
    .writeAt("[literal]*.txt", "later rewrite\n")
    .commitAll("advance after completion")
    .please();
  push(origin.project);
  return advanced;
}

// A retained comparison whose original common repository has gone away is
// only the starting precondition; published review still comes from real Git.
// Callers name the completion and its first parent (baseline); no rev-parse.
export function keepUnusableCompletedCapture(
  dashboard: DashboardServer,
  origin: StartOrigin,
  story: {
    readonly workspace: string;
    readonly completion: string;
    readonly baseline: string;
  },
) {
  const record = storyALaunchRecord(story.workspace);
  const comparison = makeMe.aPublishedComparison
    .with({
      base: story.baseline,
      revision: story.completion,
    })
    .please();
  record.landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: `${origin.machine}/missing-capture`,
      identity: queuedIdentity,
    })
    .comparing(comparison)
    .please();
  keepLaunchRecords(dashboard, [record]);
}

// Another developer's later story, whose branch started from Story A's
// completion's first parent, merges trunk as its second parent and
// fast-forwards trunk so the existing done record first appears on trunk's
// first-parent path at that merge.
export function laterDeveloperCarriesDoneRecord(
  origin: StartOrigin,
  completion: string,
) {
  return laterBranchMergesTrunkAndFastForwards(
    origin,
    git(origin.project, "rev-parse", `${completion}^1`),
  );
}

function laterBranchMergesTrunkAndFastForwards(
  origin: StartOrigin,
  start: string,
) {
  const developer = { agent: "Rin", email: "rin@example.org" };
  const workspace = path.join(origin.machine, "later-story-workspace");
  git(
    origin.project,
    "worktree",
    "add",
    "--quiet",
    "--detach",
    workspace,
    start,
  );
  makeMe
    .theWorkspace(workspace)
    .writeAt("later-story.txt", "later story work\n")
    .please();
  commitAllAs(
    workspace,
    "later story work started before completion",
    developer,
  );
  git(workspace, "fetch", "--quiet", "origin", "main");
  execFileSync(
    "git",
    ["merge", "--quiet", "--no-ff", "--no-edit", "origin/main"],
    {
      cwd: workspace,
      env: authoredBy(developer),
    },
  );
  push(workspace);
  const merge = git(workspace, "rev-parse", "HEAD");
  git(origin.project, "worktree", "remove", "--force", workspace);
  const done = `.planning/done/${doneRecordFileName(queuedIdentity)}`;
  const carried = git(
    origin.origin,
    "log",
    "--first-parent",
    "-1",
    "--format=%H",
    "main",
    "--",
    done,
  );
  if (carried !== merge)
    throw new Error(
      `later merge ${merge} does not carry the done record onto trunk's first-parent path (${carried})`,
    );
  return merge;
}
