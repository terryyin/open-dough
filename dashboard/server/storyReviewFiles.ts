// A story review snapshot's changed files (`../src/storyReview.ts`) as Git's
// rename-detecting tree diff prints them (`./storyReviewSnapshot.ts`): the
// files from `--name-status -M -z`, each joined by its path with its added
// and removed line counts from `--numstat -M -z` over the same comparison.

import type { LineCounts, ReviewedFile } from "../src/storyReview.ts";
import { runGit, type GitCall } from "./gitRunner.ts";

// A comparison's kinds and counts always come from these same two trees.
// Paths, when supplied for inseparable files, are literal Git pathspecs.
export async function changedFrom(
  from: string,
  to: string,
  call: GitCall,
  paths: readonly string[] = [],
): Promise<ReviewedFile[]> {
  const changes = async (format: string) =>
    (
      await runGit(
        [
          "--literal-pathspecs",
          "diff",
          format,
          "-M",
          "-z",
          from,
          to,
          "--",
          ...paths,
        ],
        call,
      )
    ).stdout;
  return reviewedFiles(
    await changes("--name-status"),
    await changes("--numstat"),
  );
}

// The changed files `git diff --name-status -M -z` printed: a status field,
// then the path, or for a rename the old path and then the new one.
function namedFiles(nameStatus: string): ReviewedFile[] {
  const fields = nameStatus.split("\0");
  const files: ReviewedFile[] = [];
  let index = 0;
  while (index + 1 < fields.length) {
    const status = fields[index] ?? "";
    const first = fields[index + 1] ?? "";
    if (status.startsWith("R")) {
      files.push({
        kind: "renamed",
        oldPath: first,
        path: fields[index + 2] ?? "",
      });
      index += 3;
      continue;
    }
    files.push({
      kind: status === "A" ? "added" : status === "D" ? "deleted" : "modified",
      path: first,
    });
    index += 2;
  }
  return files;
}

// The line counts `git diff --numstat -M -z` printed, by each file's path:
// added and removed counts and the path, or for a rename an empty path field
// followed by the old path and then the new one. A binary file's counts are
// `-`, so it has none.
function countedLines(numstat: string): ReadonlyMap<string, LineCounts> {
  const fields = numstat.split("\0");
  const counts = new Map<string, LineCounts>();
  let index = 0;
  while (index < fields.length) {
    const [added = "", removed = "", path = ""] = (fields[index] ?? "").split(
      "\t",
    );
    const renamed = path === "" ? fields[index + 2] : undefined;
    index += renamed === undefined ? 1 : 3;
    if (added === "" || added === "-") continue;
    counts.set(renamed ?? path, {
      added: Number(added),
      removed: Number(removed),
    });
  }
  return counts;
}

// The changed files, each with its line counts when Git counted them.
export function reviewedFiles(
  nameStatus: string,
  numstat: string,
): ReviewedFile[] {
  const counts = countedLines(numstat);
  return namedFiles(nameStatus).map((file) => {
    const lines = counts.get(file.path);
    return lines === undefined ? file : { ...file, lines };
  });
}
