// Completes and publishes real CLI story history, including resolved merges.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  doneRecordFileName,
  type IntentCoverage,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { git, lines } from "./storyReviewWorktree.ts";
import { pull, push } from "./storyReviewTrunkCommits.ts";

export function installedBacklogScript(
  workspace: string,
  skillsDirectory = ".claude/skills",
) {
  return path.join(
    workspace,
    skillsDirectory,
    "dough-product-backlog/scripts/product-backlog.mjs",
  );
}

// Completes the story through the installed backlog CLI.
export function completeBacklogStory(
  workspace: string,
  {
    identity = queuedIdentity,
    skillsDirectory,
    completionArgs = [],
  }: {
    identity?: string;
    skillsDirectory?: string | undefined;
    completionArgs?: readonly string[];
  } = {},
) {
  execFileSync(
    process.execPath,
    [
      installedBacklogScript(workspace, skillsDirectory),
      "complete",
      "--identity",
      identity,
      ...completionArgs,
    ],
    { cwd: workspace, stdio: "pipe" },
  );
}

// Completes a launch workspace's story and commits that completion, answering
// its commit.
export function commitBacklogCompletion(workspace: string, message: string) {
  completeBacklogStory(workspace, { skillsDirectory: ".agents/skills" });
  return makeMe.theWorkspace(workspace).commitAll(message).please();
}

// Publishes the project's done record of the story as completed at
// `completedAt`, with the done catalog the installed backlog CLI rebuilds.
export function publishDoneStoryCompletedAt(
  project: string,
  completedAt: Date,
  identity = queuedIdentity,
) {
  const record = `.planning/done/${doneRecordFileName(identity)}`;
  const facts = JSON.parse(
    readFileSync(path.join(project, record), "utf8"),
  ) as Record<string, unknown>;
  makeMe
    .theWorkspace(project)
    .writeAt(
      record,
      `${JSON.stringify({ ...facts, completedAt: completedAt.toISOString() }, null, 2)}\n`,
    )
    .please();
  execFileSync(
    process.execPath,
    [
      installedBacklogScript(project, ".agents/skills"),
      "catalog-done",
      "--file",
      ".planning/PRODUCT-BACKLOG.md",
    ],
    { cwd: project, stdio: "pipe" },
  );
  makeMe
    .theWorkspace(project)
    .commitAll("publish the done record's completion time")
    .please();
  push(project);
}

export function resolveStoryConflict(
  workspace: string,
  mergeArguments: readonly string[],
  file: string,
  content: string,
  message: string,
) {
  try {
    execFileSync("git", [...mergeArguments], { cwd: workspace, stdio: "pipe" });
    throw new Error(`Expected merge conflict in ${file}`);
  } catch (error) {
    if (
      !git(workspace, "diff", "--name-only", "--diff-filter=U").includes(file)
    )
      throw error;
  }
  makeMe
    .theWorkspace(workspace)
    .writeAt(file, content)
    .commitAll(message)
    .please();
}

export function publishCompletedStory(
  ...publication: Parameters<typeof publishCompletedStoryLanding>
) {
  return publishCompletedStoryLanding(...publication).completion;
}

// The completion and, for a Story Branch, the branch side its owning landing
// merge integrated (the completed workspace tip).
export function publishCompletedStoryLanding(
  origin: StartOrigin,
  {
    workspace,
    branch,
    mode,
    missingAgent,
    completionConflict,
    intentCoverage,
    retainWorkspace,
    skillsDirectory,
    identity = queuedIdentity,
  }: {
    workspace: string;
    branch: string;
    mode: "trunk" | "story-branch";
    missingAgent: boolean;
    completionConflict: boolean;
    intentCoverage?: IntentCoverage | undefined;
    retainWorkspace?: boolean | undefined;
    skillsDirectory?: string | undefined;
    identity?: string;
  },
) {
  const coverageArgs: string[] = [];
  if (intentCoverage !== undefined) {
    if ("report" in intentCoverage) {
      const reportFile = path.join(origin.machine, "intent-coverage.txt");
      writeFileSync(reportFile, intentCoverage.report, "utf8");
      coverageArgs.push("--intent-coverage", reportFile);
    } else {
      coverageArgs.push(
        "--intent-coverage-unavailable",
        intentCoverage.unavailable,
      );
    }
  }
  completeBacklogStory(workspace, {
    identity,
    skillsDirectory,
    completionArgs: coverageArgs,
  });
  if (missingAgent) {
    const record = `.planning/done/${doneRecordFileName(identity)}`;
    const facts = JSON.parse(
      readFileSync(path.join(workspace, record), "utf8"),
    ) as Record<string, unknown>;
    delete facts["agent"];
    delete facts["host"];
    delete facts["model"];
    makeMe
      .theWorkspace(workspace)
      .writeAt(record, JSON.stringify(facts))
      .please();
  }
  const branchSide = makeMe
    .theWorkspace(workspace)
    .commitAll("complete the story through CLI")
    .please();
  let completion = branchSide;
  if (mode === "trunk") push(workspace);
  else {
    // Agent-authored trunk-first landing so claim history recovers it as an
    // owning merge (first parent still claims on trunk).
    const agentName = git(workspace, "config", "--worktree", "author.name");
    const agentEmail = git(workspace, "config", "--worktree", "author.email");
    git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
    pull(origin.project);
    makeMe
      .theWorkspace(origin.project)
      .writeAt("integration-other.txt", "another change before integration\n")
      .commitAll("trunk advances before story integration")
      .please();
    if (completionConflict)
      makeMe
        .theWorkspace(origin.project)
        .writeAt(
          "shared.txt",
          lines("line")
            .replace("line 0\n", "completion trunk\n")
            .replace("line 11\n", "other last\n"),
        )
        .commitAll("trunk edits the story line before completion")
        .please();
    git(origin.project, "fetch", "--quiet", "origin", branch);
    git(origin.project, "config", "user.name", agentName);
    git(origin.project, "config", "user.email", agentEmail);
    if (completionConflict) {
      resolveStoryConflict(
        origin.project,
        ["merge", "--quiet", "--no-ff", "--no-edit", `origin/${branch}`],
        "shared.txt",
        lines("line")
          .replace("line 0\n", "resolved story and trunk\n")
          .replace("line 11\n", "other last\n"),
        "resolve completion integration conflict",
      );
    } else {
      git(
        origin.project,
        "merge",
        "--quiet",
        "--no-ff",
        "--no-edit",
        `origin/${branch}`,
      );
    }
    push(origin.project);
    completion = git(origin.project, "rev-parse", "HEAD");
    git(origin.project, "push", "--quiet", "--delete", "origin", branch);
  }
  if (retainWorkspace !== true) {
    git(origin.project, "worktree", "remove", "--force", workspace);
    git(origin.project, "branch", "--delete", "--force", branch);
  }
  return { completion, branchSide };
}
