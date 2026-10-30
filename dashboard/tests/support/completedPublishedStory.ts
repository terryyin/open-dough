// Real CLI claim and completion, with Git publication and workspace retirement.
// No dashboard launch or comparison is supplied by this setup.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { rmSync } from "node:fs";
import {
  agentIdentity,
  agentNameOf,
  renderAgentProfile,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  publishCompletedStory,
  resolveStoryConflict,
} from "./completedStoryPublication.ts";
import { keepLaunchRecords, storyALaunchRecord } from "./storyLaunchRecord.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { randomUUID } from "node:crypto";
import type { StartOrigin } from "./startOrigin.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";

export async function completedPublishedStory(
  origin: StartOrigin,
  mode: "trunk" | "story-branch" = "trunk",
  variant?:
    | "takeover"
    | "returned"
    | "returned-takeover"
    | "missing-agent"
    | "own-conflict"
    | "own-conflict-extra"
    | "completion-conflict"
    | "ambiguous-merge"
    | "inseparable"
    | "unrelated-merge",
) {
  const ownConflict =
    variant === "own-conflict" || variant === "own-conflict-extra";
  writeAt(origin.project, "shared.txt", lines("line"));
  commitAll(origin.project, "initial shared file");
  push(origin.project);
  const start =
    mode === "trunk"
      ? await origin.takenInTrunkMode("completed-a")
      : {
          agent: await origin.takenByAnotherAgent(),
          workspace: path.join(origin.machine, "another-agent-workspace"),
          branch: "claude/another-agent",
        };
  const { workspace, branch } = start;
  writeAt(
    workspace,
    "shared.txt",
    lines("line").replace("line 0\n", "story first\n"),
  );
  writeAt(workspace, "[literal]*.txt", "delivered on another machine\n");
  commitAll(workspace, "story implementation");
  if (mode === "trunk") push(workspace);
  pull(origin.project);
  writeAt(origin.project, "other-story.txt", "another story\n");
  const shared =
    mode === "trunk"
      ? lines("line").replace("line 0\n", "story first\n")
      : lines("line");
  writeAt(
    origin.project,
    "shared.txt",
    shared
      .replace("line 11\n", "other last\n")
      .replace("line 0\n", ownConflict ? "trunk first\n" : "line 0\n"),
  );
  commitAll(origin.project, "another writer interleaves");
  if (variant === "unrelated-merge") {
    git(origin.project, "checkout", "--quiet", "-b", "unrelated");
    writeAt(origin.project, "unrelated.txt", "other branch\n");
    commitAll(origin.project, "another story's branch work");
    git(origin.project, "checkout", "--quiet", "main");
    writeAt(origin.project, "unrelated.txt", "other trunk\n");
    commitAll(origin.project, "another story's trunk work");
    resolveStoryConflict(
      origin.project,
      ["merge", "--quiet", "--no-ff", "--no-edit", "unrelated"],
      "unrelated.txt",
      "other story's resolution\n",
      "resolve another story's conflict",
    );
    git(origin.project, "branch", "--delete", "--force", "unrelated");
  }
  push(origin.project);
  git(workspace, "fetch", "--quiet", "origin", "main");
  if (ownConflict) {
    resolveStoryConflict(
      workspace,
      ["merge", "--quiet", "--no-edit", "origin/main"],
      "shared.txt",
      lines("line")
        .replace("line 0\n", "resolved story and trunk\n")
        .replace("line 11\n", "other last\n"),
      "resolve story integration conflict",
    );
  } else {
    git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  }
  if (variant === "ambiguous-merge" || variant === "own-conflict-extra") {
    writeAt(workspace, "merge-resolution.txt", "unattributed resolution\n");
    git(workspace, "add", "--all");
    git(workspace, "commit", "--quiet", "--amend", "--no-edit");
  }
  if (variant === "takeover" || variant === "returned-takeover") {
    const previous = agentIdentity(agentNameOf(start.agent) ?? "Yui");
    const name = start.agent === "Yui-chan" ? "Akiho" : "Yui";
    const next = agentIdentity(name);
    rmSync(path.join(workspace, ".planning", previous.path));
    writeAt(
      workspace,
      `.planning/${next.path}`,
      renderAgentProfile({ name, identity: queuedIdentity, mode, branch }),
    );
    git(workspace, "config", "--worktree", "author.name", next.agent);
    git(workspace, "config", "--worktree", "author.email", next.email);
    commitAll(workspace, "take over the story");
    writeAt(workspace, "takeover.txt", "second agent work\n");
    commitAll(workspace, "finish after takeover");
  }
  if (variant === "inseparable") {
    push(workspace);
    pull(origin.project);
    writeAt(
      origin.project,
      "shared.txt",
      lines("line")
        .replace("line 0\n", "other rewrites story\n")
        .replace("line 11\n", "other last\n"),
    );
    commitAll(origin.project, "rewrite story line");
    push(origin.project);
    git(workspace, "fetch", "--quiet", "origin", "main");
    git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  }
  if (variant === "returned" || variant === "returned-takeover") {
    execFileSync(
      process.execPath,
      [
        path.join(
          workspace,
          ".claude/skills/dough-product-backlog/scripts/product-backlog.mjs",
        ),
        "place",
        "--identity",
        queuedIdentity,
        "--return",
        "--position",
        "first",
      ],
      { cwd: workspace },
    );
    const owner = agentIdentity(
      agentNameOf(git(workspace, "config", "--worktree", "author.name")) ??
        "Yui",
    );
    rmSync(path.join(workspace, ".planning", owner.path));
    commitAll(workspace, "return the story and release its execution profile");
  }
  const completion = publishCompletedStory(origin, {
    workspace,
    branch,
    mode,
    missingAgent: variant === "missing-agent",
    completionConflict: variant === "completion-conflict",
  });
  return { completion, agent: start.agent, workspace, branch };
}

export function advanceCompletedTrunk(origin: StartOrigin) {
  pull(origin.project);
  writeAt(origin.project, "later.txt", "later trunk\n");
  writeAt(origin.project, "[literal]*.txt", "later rewrite\n");
  commitAll(origin.project, "advance after completion");
  push(origin.project);
}

// A retained comparison whose original common repository has gone away is
// only the starting precondition; published review still comes from real Git.
export async function keepUnusableCompletedCapture(
  dashboard: DashboardServer,
  origin: StartOrigin,
  story: { readonly workspace: string; readonly completion: string },
) {
  const record = storyALaunchRecord(story.workspace);
  record.landing = {
    reference: randomUUID(),
    delivery: randomUUID(),
    receipt: randomUUID(),
    repository: `${origin.machine}/missing-capture`,
    identity: queuedIdentity,
    remote: "origin",
    target: "refs/heads/main",
    base: git(origin.project, "rev-parse", `${story.completion}^`),
    revision: story.completion,
    receivedAt: new Date().toISOString(),
  };
  await keepLaunchRecords(dashboard, [record]);
}
