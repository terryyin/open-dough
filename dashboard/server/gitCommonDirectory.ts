// Checkouts, sibling worktrees and their shared Git directory identify one
// local repository through the canonical common Git directory.
import { realpath } from "node:fs/promises";
import { runGit, type GitCall } from "./gitRunner.ts";

// The rev-parse options that print the common Git directory for
// canonicalGitDirectory. --path-format applies to every later option.
export const commonGitDirectoryOptions = [
  "--path-format=absolute",
  "--git-common-dir",
] as const;

export const canonicalGitDirectory = (printed: string): Promise<string> =>
  realpath(printed.trim());

export async function commonGitDirectory(call: GitCall): Promise<string> {
  const common = await runGit(
    ["rev-parse", ...commonGitDirectoryOptions],
    call,
  );
  return canonicalGitDirectory(common.stdout);
}
