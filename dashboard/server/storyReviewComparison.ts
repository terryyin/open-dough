// Shared listing and restatement for published changes and recorded pairs.
import {
  type ReviewComparison,
  type ReviewedFile,
} from "../src/storyReviewContract.ts";
import { gitExitedOne, runGit, type GitCall } from "./gitRunner.ts";
import { mergeTreeOutput } from "./mergeTreeOutput.ts";
import type { ReviewPoint } from "./storyReviewPoints.ts";
import { changedFrom } from "./storyReviewFiles.ts";

export async function compareOriginalTrees(
  from: string,
  tree: string,
  call: GitCall,
): Promise<ReviewComparison> {
  return { from, files: await changedFrom(from, tree, call) };
}

// The from tree restated on the to baseline, and the paths Git could not
// merge; undefined when Git could not restate it at all.
export async function restatedPoint(
  from: ReviewPoint,
  baseline: string,
  call: GitCall,
) {
  if (from.baseline === baseline) {
    return { tree: from.tree, inseparable: new Set<string>() };
  }
  const output = await runGit(
    [
      "merge-tree",
      "--write-tree",
      "--name-only",
      "-z",
      `--merge-base=${from.baseline}`,
      from.tree,
      baseline,
    ],
    call,
  ).catch((error: unknown) => {
    if (call.signal?.aborted === true) throw error;
    // A conflicted merge exits 1 with a tree, possibly after driver output.
    if (gitExitedOne(error)) {
      return error;
    }
    return undefined;
  });
  if (output === undefined) return undefined;
  return mergeTreeOutput(output.stdout);
}

const byPath = (a: ReviewedFile, b: ReviewedFile) =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

// Match a file's identity on either side of a rename, after Git has detected
// that rename over the complete comparison rather than narrowed pathspecs.
const touches = (file: ReviewedFile, paths: ReadonlySet<string>) =>
  paths.has(file.path) || (file.kind === "renamed" && paths.has(file.oldPath));

// The files changed from the restated tree to `to`, with each inseparable
// path listed instead from its origin, the tree given for it, and flagged
// with that tree as including trunk's changes.
export async function listedFrom(
  restatedTree: string,
  to: string,
  inseparable: ReadonlyMap<string, string>,
  // Where an inseparable file with no diff from its origin is compared from.
  keptFrom: string,
  call: GitCall,
): Promise<ReviewedFile[]> {
  const restated = await changedFrom(restatedTree, to, call);
  // A file renamed from an inseparable one is compared from that one's
  // origin with it, so its content is not hidden.
  const origins = new Map(inseparable);
  for (const file of restated) {
    const origin =
      file.kind === "renamed" ? inseparable.get(file.oldPath) : undefined;
    if (origin !== undefined && !origins.has(file.path)) {
      origins.set(file.path, origin);
    }
  }
  const flagged = new Map<string, ReviewedFile>();
  const flagFrom = async (tree: string, paths: ReadonlySet<string>) => {
    for (const file of await changedFrom(tree, to, call)) {
      if (touches(file, paths) && !flagged.has(file.path)) {
        flagged.set(file.path, { ...file, includesTrunkFrom: tree });
      }
    }
  };
  for (const tree of new Set(origins.values())) {
    await flagFrom(
      tree,
      new Set([...origins.keys()].filter((file) => origins.get(file) === tree)),
    );
  }
  // An inseparable file kept as its origin has it is compared from
  // `keptFrom` instead, so its diff shows the story's version against trunk's.
  const differed = new Set(
    [...flagged.values()].flatMap((file) =>
      file.kind === "renamed" ? [file.path, file.oldPath] : [file.path],
    ),
  );
  const keptAsOrigin = new Set(
    [...inseparable.keys()].filter((file) => !differed.has(file)),
  );
  if (keptAsOrigin.size > 0) await flagFrom(keptFrom, keptAsOrigin);
  // A restated file sharing a path with a flagged one, such as the old path
  // of a renamed inseparable file, is already listed through it.
  const listed = new Set([...origins.keys(), ...differed]);
  return [
    ...restated.filter((file) => !touches(file, listed)),
    ...flagged.values(),
  ].sort(byPath);
}
