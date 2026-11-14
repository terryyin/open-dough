// Completes and publishes real CLI story history, including resolved merges.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  doneRecordFileName,
  type IntentCoverage,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
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
  writeAt(workspace, file, content);
  commitAll(workspace, message);
}

export function publishCompletedStory(
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
  execFileSync(
    process.execPath,
    [
      installedBacklogScript(workspace, skillsDirectory),
      "complete",
      "--file",
      ".planning/PRODUCT-BACKLOG.md",
      "--identity",
      identity,
      ...coverageArgs,
    ],
    { cwd: workspace },
  );
  if (missingAgent) {
    const record = `.planning/done/${doneRecordFileName(identity)}`;
    const facts = JSON.parse(
      readFileSync(path.join(workspace, record), "utf8"),
    ) as Record<string, unknown>;
    delete facts["agent"];
    delete facts["host"];
    delete facts["model"];
    writeAt(workspace, record, JSON.stringify(facts));
  }
  commitAll(workspace, "complete the story through CLI");
  let completion = git(workspace, "rev-parse", "HEAD");
  if (mode === "trunk") push(workspace);
  else {
    // Agent-authored trunk-first landing so claim history recovers it as an
    // owning merge (first parent still claims on trunk).
    const agentName = git(workspace, "config", "--worktree", "author.name");
    const agentEmail = git(workspace, "config", "--worktree", "author.email");
    git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
    pull(origin.project);
    writeAt(
      origin.project,
      "integration-other.txt",
      "another change before integration\n",
    );
    commitAll(origin.project, "trunk advances before story integration");
    if (completionConflict) {
      writeAt(
        origin.project,
        "shared.txt",
        lines("line")
          .replace("line 0\n", "completion trunk\n")
          .replace("line 11\n", "other last\n"),
      );
      commitAll(origin.project, "trunk edits the story line before completion");
    }
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
  return completion;
}
