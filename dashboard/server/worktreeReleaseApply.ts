// Invokes the existing whole-payload release updater for one launch worktree.
// Reuses `open-dough-release.sh apply` with `--target` set to that worktree:
// recorded SOURCE, baseline checks, both native skill roots, refusal without
// automatic `--force`. Incomplete-install recovery text comes from the helper.
import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { AgentLaunchRequest } from "../src/agentLaunch.ts";

const exec = promisify(execFile);

const defaultHelper = fileURLToPath(
  new URL("../../src/install/open-dough-release.sh", import.meta.url),
);

export type WorktreeApplyResult =
  | { readonly kind: "updated"; readonly output: string }
  | { readonly kind: "refused"; readonly explanation: string };

function releaseHelper(): string {
  return process.env["OPEN_DOUGH_RELEASE_HELPER"]?.trim() || defaultHelper;
}

async function helperPresent(helper: string): Promise<boolean> {
  try {
    await access(helper);
    return true;
  } catch {
    return false;
  }
}

function combinedOutput(stdout: string, stderr: string): string {
  return [stdout, stderr]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("\n");
}

// Ordinary apply for the launch worktree. Never passes `--force`.
export async function applyReleaseToWorktree(
  workspacePath: string,
  host: AgentLaunchRequest["host"],
): Promise<WorktreeApplyResult> {
  const helper = releaseHelper();
  if (!(await helperPresent(helper))) {
    return {
      kind: "refused",
      explanation: `The Open Dough release updater was not found at ${helper}, so the worktree was not updated and nothing was launched.`,
    };
  }
  try {
    const { stdout, stderr } = await exec(
      "bash",
      [helper, "apply", "--target", workspacePath, "--platform", host],
      {
        cwd: path.dirname(helper),
        maxBuffer: 16 * 1024 * 1024,
        env: { ...process.env },
      },
    );
    return { kind: "updated", output: combinedOutput(stdout, stderr) };
  } catch (error) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    const printed = combinedOutput(err.stdout ?? "", err.stderr ?? "");
    return {
      kind: "refused",
      explanation:
        printed.length > 0
          ? `Updating the launch worktree's Open Dough installation was refused or failed:\n${printed}\nNothing was launched. No forced reinstall was attempted.`
          : `Updating the launch worktree's Open Dough installation failed (${err.message ?? String(error)}). Nothing was launched. No forced reinstall was attempted.`,
    };
  }
}
