import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runGitUntilClosed, type GitCall } from "./gitRunner.ts";

// Keep the worktree's final files and nonignored additions without writing
// its real index. Seed the temporary index with the already observed tip.
export async function writeWorkingTree(
  committedTip: string,
  call: GitCall,
): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "dough-review-"));
  const snapshot = {
    ...call,
    env: { ...call.env, GIT_INDEX_FILE: path.join(directory, "index") },
  };
  try {
    await runGitUntilClosed(["read-tree", committedTip], snapshot);
    await runGitUntilClosed(["add", "--all"], snapshot);
    return (await runGitUntilClosed(["write-tree"], snapshot)).stdout.trim();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
