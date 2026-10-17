// Invoke Dough Land's production CLI boundaries as an agent would. These
// adapters preserve exit status and JSON output without modelling their rules.
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

async function runJsonCommand(command, args) {
  const path = fileURLToPath(new URL(command, import.meta.url));
  try {
    const { stdout } = await promisify(execFile)("node", [path, ...args]);
    return { code: 0, result: JSON.parse(stdout) };
  } catch (error) {
    if (error.code !== 1) throw error;
    return { code: 1, result: JSON.parse(error.stdout) };
  }
}

export async function runClosureCheckCommand({
  checkout,
  remote = "origin",
  targetRef = "refs/heads/main",
}) {
  return runJsonCommand("../../dough-land/scripts/queued-closure-check.mjs", [
    "check",
    "--checkout",
    checkout,
    "--remote",
    remote,
    "--target-ref",
    targetRef,
  ]);
}

export async function checkPlannedCompletion(plan) {
  const { result } = await runJsonCommand(
    "../../dough-execute-plan/scripts/story-obligations.mjs",
    ["check", "--plan", plan, "--planned-completion"],
  );
  return result;
}

// A retained worktree exits 1; callers inspect the unchanged command result.
export async function runRetirementCommand({
  repository,
  worktree,
  branch,
  remote = "origin",
  targetRef = "refs/heads/main",
  identity,
  createdForWork,
  remoteBranch,
  contained = [],
}) {
  const args = ["retire", "--repository", repository];
  args.push("--worktree", worktree, "--branch", branch, "--remote", remote);
  args.push("--target-ref", targetRef);
  if (identity) args.push("--identity", identity);
  if (createdForWork) args.push("--created-for-work");
  if (remoteBranch) args.push("--remote-branch", remoteBranch);
  for (const sha of contained) args.push("--contained", sha);
  return runJsonCommand(
    "../../dough-land/scripts/worktree-retirement.mjs",
    args,
  );
}
