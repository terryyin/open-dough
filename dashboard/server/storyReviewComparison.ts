// Compares two points of a story review by restating the from tree on the
// to baseline when they differ, leaving trunk's intervening changes out.
// Inseparable files are compared from the original from tree, or from the
// to baseline when kept as they were. The comparison's paths, counts and
// file diffs therefore all describe the same observation. Missing from
// objects and unsupported restatement remain distinct; aborted responses
// and Git failures outside restatement belong to the caller.

import {
  objectIdSchema,
  type MarkUncomparable,
  type ReviewComparison,
  type ReviewedFile,
} from "../src/storyReview.ts";
import { GitFailure, runGit, type GitCall } from "./gitRunner.ts";
import { reviewPointObjects, type ReviewPoint } from "./storyReviewPoints.ts";
import { changedFrom } from "./storyReviewFiles.ts";

// Git exited 1: the merge has conflicts, having printed its result, or a
// quiet `rev-parse --verify` found no such object.
const exitedOne = (error: unknown): error is GitFailure =>
  error instanceof GitFailure &&
  error.cause instanceof Error &&
  "code" in error.cause &&
  error.cause.code === 1;

// Whether the repository holds the from point's tree and baseline commit.
async function holdsPoint(point: ReviewPoint, call: GitCall) {
  try {
    for (const object of reviewPointObjects(point)) {
      await runGit(["rev-parse", "--verify", "--quiet", object], call);
    }
    return true;
  } catch (error) {
    if (exitedOne(error)) return false;
    throw error;
  }
}

// The from tree restated on the to baseline, and the paths Git could not
// merge; undefined when Git could not restate it at all.
function restatementFrom(stdout: string) {
  const fields = stdout.split("\0");
  for (const [index, field] of fields.entries()) {
    // Drivers may print lines before Git's tree. Once found, only NULs
    // separate paths: a conflicted filename can itself contain newlines.
    const tree = field
      .split("\n")
      .find((part) => objectIdSchema.safeParse(part).success);
    if (tree === undefined) {
      continue;
    }
    const paths = fields.slice(index + 1);
    const end = paths.indexOf("");
    return {
      tree,
      inseparable: new Set(end === -1 ? paths : paths.slice(0, end)),
    };
  }
  return undefined;
}

async function restatedPoint(
  from: ReviewPoint,
  baseline: string,
  call: GitCall,
) {
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
    if (exitedOne(error)) {
      return error;
    }
    return undefined;
  });
  if (output === undefined) return undefined;
  return restatementFrom(output.stdout);
}

const byPath = (a: ReviewedFile, b: ReviewedFile) =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

// The points' comparison, or why the from point cannot be compared.
export async function compareReviewPoints(
  from: ReviewPoint,
  to: ReviewPoint,
  call: GitCall,
): Promise<
  | { readonly kind: "comparison"; readonly comparison: ReviewComparison }
  | { readonly kind: "uncomparable"; readonly reason: MarkUncomparable }
> {
  if (!(await holdsPoint(from, call)))
    return { kind: "uncomparable", reason: "unreadable" };
  const restatement =
    from.baseline === to.baseline
      ? { tree: from.tree, inseparable: new Set<string>() }
      : await restatedPoint(from, to.baseline, call);
  if (restatement === undefined)
    return { kind: "uncomparable", reason: "not-restated" };
  const { tree, inseparable } = restatement;
  const restated = await changedFrom(tree, to.tree, call);
  // A file renamed from an inseparable one is compared from the original from tree
  // with it, so its content is not hidden.
  const flaggedPaths = new Set(inseparable);
  for (const file of restated) {
    if (file.kind === "renamed" && inseparable.has(file.oldPath)) {
      flaggedPaths.add(file.path);
    }
  }
  const separated = restated.filter((file) => !flaggedPaths.has(file.path));
  const fromOriginal =
    flaggedPaths.size === 0
      ? []
      : await changedFrom(from.tree, to.tree, call, [...flaggedPaths]);
  // An inseparable file kept as it was is compared from the to baseline
  // instead, so its diff shows the story's version against trunk's.
  const differed = new Set(
    fromOriginal.flatMap((file) =>
      file.kind === "renamed" ? [file.path, file.oldPath] : [file.path],
    ),
  );
  const keptAsFrom = [...inseparable].filter((file) => !differed.has(file));
  const fromBaseline =
    keptAsFrom.length === 0
      ? []
      : await changedFrom(to.baseline, to.tree, call, keptAsFrom);
  const flagged = [
    ...fromOriginal.map((file) => ({ ...file, includesTrunkFrom: from.tree })),
    ...fromBaseline.map((file) => ({
      ...file,
      includesTrunkFrom: to.baseline,
    })),
  ];
  return {
    kind: "comparison",
    comparison: { from: tree, files: [...separated, ...flagged].sort(byPath) },
  };
}
