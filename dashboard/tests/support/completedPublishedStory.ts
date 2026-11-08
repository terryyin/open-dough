// Real CLI claim and completion, with Git publication and workspace retirement.
// No dashboard launch or comparison is supplied by this setup. A journey may
// add its own changes (`change`) to the story's implementation commit.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { rmSync } from "node:fs";
import {
  agentIdentity,
  agentNameOf,
  renderAgentProfile,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { IntentCoverage } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import {
  publishCompletedStory,
  resolveStoryConflict,
} from "./completedStoryPublication.ts";
import {
  addIntegrationEdit,
  addTrunkAgentProfile,
  amendIntegrationMerge,
  editIntegrationMerge,
  foreignOctopusMerge,
  moveAgentsFolder,
  ownOctopusIntegration,
  placeMergeEditFiles,
  resolveForeignMerge,
} from "./completedStoryMerges.ts";
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
    | "own-conflict-extra"
    | "completion-conflict"
    | "merge-edit"
    | "inseparable"
    | "unrelated-merge"
    | "non-owning-story-file"
    | "foreign-octopus"
    | "own-octopus",
  change?: (workspace: string) => void,
  // More edits the story's integration merge makes, after the variant's own.
  integrate?: (workspace: string) => void,
  // When the caller already committed `shared.txt` as lines("line") on the
  // claim parent (for example a planning-only start after a built baseline),
  // skip the usual initial shared commit so that parent stays unchanged.
  options?: {
    readonly sharedAlreadyReady?: boolean;
    readonly intentCoverage?: IntentCoverage | undefined;
  },
) {
  const ownConflict = variant === "own-conflict-extra";
  if (options?.sharedAlreadyReady !== true) {
    writeAt(origin.project, "shared.txt", lines("line"));
    if (ownConflict) placeMergeEditFiles(origin.project);
    commitAll(origin.project, "initial shared file");
    push(origin.project);
  }
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
  change?.(workspace);
  if (ownConflict) moveAgentsFolder(workspace);
  commitAll(workspace, "story implementation");
  if (mode === "trunk") push(workspace);
  pull(origin.project);
  writeAt(origin.project, "other-story.txt", "another story\n");
  const shared =
    mode === "trunk"
      ? lines("line").replace("line 0\n", "story first\n")
      : lines("line");
  const interleaved = shared.replace("line 11\n", "other last\n");
  writeAt(
    origin.project,
    "shared.txt",
    interleaved.replace("line 0\n", ownConflict ? "trunk first\n" : "line 0\n"),
  );
  if (ownConflict) addTrunkAgentProfile(origin.project);
  commitAll(origin.project, "another writer interleaves");
  if (variant === "unrelated-merge" || variant === "non-owning-story-file")
    resolveForeignMerge(origin.project, variant, interleaved);
  if (variant === "foreign-octopus") foreignOctopusMerge(origin.project);
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
  } else if (variant === "own-octopus") {
    ownOctopusIntegration(workspace);
  } else {
    git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  }
  if (ownConflict) editIntegrationMerge(workspace);
  if (variant === "merge-edit") addIntegrationEdit(workspace);
  if (integrate !== undefined) amendIntegrationMerge(workspace, integrate);
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
    intentCoverage: options?.intentCoverage,
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
