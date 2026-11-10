// Checkouts, sibling worktrees and their shared Git directory identify one
// local repository through the canonical common Git directory.
import { realpath } from "node:fs/promises";
import { runGit, type GitCall } from "./gitRunner.ts";

export async function commonGitDirectory(call: GitCall): Promise<string> {
  const common = await runGit(
    ["rev-parse", "--path-format=absolute", "--git-common-dir"],
    call,
  );
  return realpath(common.stdout.trim());
}
