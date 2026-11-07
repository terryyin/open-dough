import { runGit, type GitCall } from "./gitRunner.ts";

export async function firstParentChain(
  start: string,
  call: GitCall,
  limit: number,
): Promise<string[]> {
  return (
    await runGit(
      ["rev-list", "--first-parent", `--max-count=${String(limit)}`, start],
      call,
    )
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
}

export async function revisionSubject(
  sha: string,
  call: GitCall,
): Promise<string> {
  try {
    const subject = (
      await runGit(["log", "-1", "--format=%s", sha], call)
    ).stdout.trim();
    return subject === "" ? "(no subject)" : subject;
  } catch {
    return "(no subject)";
  }
}
