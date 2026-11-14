// Revision-consistent file text at an admitted comparison's trees: the same
// rule the file-text endpoint and file-anchored follow-up line checks share.
import { gitProblem, runGit } from "./gitRunner.ts";

const outputLimit = 64 * 1024 * 1024;

export type SideRead =
  | { readonly kind: "absent" }
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "unavailable"; readonly explanation: string };

// Text of one path at one tree object, or why that side cannot supply text.
export async function textAtTree(
  repository: string,
  tree: string,
  filePath: string,
  signal: AbortSignal,
): Promise<SideRead> {
  try {
    const { stdout: listed } = await runGit(
      ["ls-tree", "-z", tree, "--", filePath],
      { cwd: repository, signal, maxBuffer: outputLimit },
    );
    if (listed === "") return { kind: "absent" };
    const entry = /^(\d+) (\S+) ([0-9a-f]+)\t/.exec(listed);
    if (entry === null)
      return {
        kind: "unavailable",
        explanation:
          "The file's text could not be read: unexpected tree entry.",
      };
    const type = entry[2];
    const object = entry[3];
    if (type === undefined || object === undefined)
      return {
        kind: "unavailable",
        explanation:
          "The file's text could not be read: unexpected tree entry.",
      };
    if (type !== "blob")
      return {
        kind: "unavailable",
        explanation: "The path is not a file at that revision.",
      };
    const { stdout } = await runGit(["cat-file", "blob", object], {
      cwd: repository,
      signal,
      maxBuffer: outputLimit,
    });
    if (stdout.includes("\0"))
      return {
        kind: "unavailable",
        explanation: "The file has no textual content at that revision.",
      };
    return { kind: "text", text: stdout };
  } catch (error) {
    return {
      kind: "unavailable",
      explanation: `The file's text could not be read: ${gitProblem(error)}`,
    };
  }
}
