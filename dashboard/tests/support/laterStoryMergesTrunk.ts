// A later story by another developer whose branch started before a completed
// story's done record arrived: it merges trunk as its second parent and
// fast-forwards trunk, carrying that existing done record onto a new
// first-parent path. Completed story setup lives in ./completedPublishedStory.ts.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { authoredBy, commitAllAs, push } from "./storyReviewTrunkCommits.ts";
import { git, writeAt } from "./storyReviewWorktree.ts";

// Another developer's later story, whose branch started at `start` before
// Story A's completion, merges trunk as its second parent and fast-forwards
// trunk. Story A's existing done record then first appears on trunk's
// first-parent path at that merge, which is returned.
export function laterBranchMergesTrunkAndFastForwards(
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
  writeAt(workspace, "later-story.txt", "later story work\n");
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
