// Files at one Git tree object, read literally: every blob path it tracks, or
// one path's text. Story review results, review file text, file-anchored
// follow-ups and Project Intent browsing share these rules.
import { gitProblem, runGit } from "./gitRunner.ts";

const outputLimit = 64 * 1024 * 1024;

// The metadata and literal path in one NUL-delimited Git tree record.
function gitTreeEntry(record: string) {
  const match = /^\d+ (\S+) ([0-9a-f]+)\t/.exec(record);
  if (match === null) return undefined;
  const [metadata, type, object] = match;
  if (type === undefined || object === undefined) return undefined;
  return { type, object, path: record.slice(metadata.length) };
}

export async function trackedFiles(
  repository: string,
  tree: string,
  signal: AbortSignal,
): Promise<string[]> {
  const { stdout } = await runGit(
    ["ls-tree", "--full-tree", "-r", "-z", tree],
    { cwd: repository, signal, maxBuffer: outputLimit },
  );
  const entries = stdout.split("\0");
  if (entries.pop() !== "") throw new Error("Incomplete Git tree listing.");
  return entries.flatMap((record) => {
    const entry = gitTreeEntry(record);
    if (
      entry === undefined ||
      (entry.type !== "blob" && entry.type !== "commit")
    )
      throw new Error("Unexpected Git tree entry.");
    return entry.type === "blob" ? [entry.path] : [];
  });
}

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
      [
        "--literal-pathspecs",
        "ls-tree",
        "--full-tree",
        "-z",
        tree,
        "--",
        filePath,
      ],
      { cwd: repository, signal, maxBuffer: outputLimit },
    );
    if (listed === "") return { kind: "absent" };
    const entry = gitTreeEntry(listed.slice(0, listed.indexOf("\0")));
    if (entry === undefined)
      return {
        kind: "unavailable",
        explanation:
          "The file's text could not be read: unexpected tree entry.",
      };
    if (entry.path !== filePath) return { kind: "absent" };
    if (entry.type !== "blob")
      return {
        kind: "unavailable",
        explanation: "The path is not a file at that revision.",
      };
    const { stdout } = await runGit(["cat-file", "blob", entry.object], {
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
