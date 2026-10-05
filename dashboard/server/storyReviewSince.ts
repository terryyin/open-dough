// A story review's changes since the review (`./storyReviewSnapshot.ts`):
// the snapshot compared with its story's marked snapshot
// (`./storyReviewMarks.ts`) restated on the review's current baseline, so
// what came only from trunk stays out. Git merges what trunk changed from
// the marked baseline to the current one into the marked tree, writing the
// result as a tree object and touching no index, worktree, or ref; with an
// unchanged baseline that is the marked tree itself. A file Git could not
// merge -- trunk and the story both changed it inseparably -- is listed, its
// kind and diff from the marked tree, flagged as including trunk's changes,
// so no story change is hidden. A mark whose tree or baseline the
// repository no longer holds -- the project was cloned anew, say -- has
// nothing to restate, so there are no changes since the review to answer;
// any other Git failure is the caller's.

import type {
  ReviewComparison,
  ReviewedFile,
  ReviewMark,
} from "../src/storyReview.ts";
import { GitFailure, runGit, type GitCall } from "./gitRunner.ts";
import { markObjects } from "./storyReviewMarks.ts";

// Git exited 1: the merge has conflicts, having printed its result, or a
// quiet `rev-parse --verify` found no such object.
const exitedOne = (error: unknown): error is GitFailure =>
  error instanceof GitFailure &&
  error.cause instanceof Error &&
  "code" in error.cause &&
  error.cause.code === 1;

// Whether the repository holds the mark's tree and its baseline commit.
async function holdsMark(mark: ReviewMark, call: GitCall) {
  try {
    for (const object of markObjects(mark)) {
      await runGit(["rev-parse", "--verify", "--quiet", object], call);
    }
    return true;
  } catch (error) {
    if (exitedOne(error)) return false;
    throw error;
  }
}

// The marked tree restated on the baseline, and the paths Git could not
// merge.
async function restatedMark(mark: ReviewMark, baseline: string, call: GitCall) {
  const { stdout } = await runGit(
    [
      "merge-tree",
      "--write-tree",
      "--name-only",
      "-z",
      `--merge-base=${mark.baseline}`,
      mark.tree,
      baseline,
    ],
    call,
  ).catch((error: unknown) => {
    if (exitedOne(error)) return error;
    throw error;
  });
  // The tree, then the conflicted files' names up to an empty field, then
  // Git's messages.
  const [tree = "", ...rest] = stdout.split("\0");
  const end = rest.indexOf("");
  return {
    tree,
    inseparable: new Set(end === -1 ? rest : rest.slice(0, end)),
  };
}

const byPath = (a: ReviewedFile, b: ReviewedFile) =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

// The changes since the review, or undefined when the repository no longer
// holds the mark.
export async function changesSinceReview(
  mark: ReviewMark,
  baseline: string,
  // The files changed from one tree to the snapshot's, of the paths given or
  // of all.
  changedFrom: (
    from: string,
    paths?: readonly string[],
  ) => Promise<ReviewedFile[]>,
  call: GitCall,
): Promise<ReviewComparison | undefined> {
  if (!(await holdsMark(mark, call))) return undefined;
  const { tree, inseparable } = await restatedMark(mark, baseline, call);
  const restated = await changedFrom(tree);
  // A file renamed from an inseparable one is compared from the marked tree
  // with it, so its content is not hidden.
  const flaggedPaths = new Set(inseparable);
  for (const file of restated) {
    if (file.kind === "renamed" && inseparable.has(file.oldPath)) {
      flaggedPaths.add(file.path);
    }
  }
  const separated = restated.filter((file) => !flaggedPaths.has(file.path));
  const flagged =
    flaggedPaths.size === 0
      ? []
      : (await changedFrom(mark.tree, [...flaggedPaths])).map((file) => ({
          ...file,
          includesTrunkFrom: mark.tree,
        }));
  return { from: tree, files: [...separated, ...flagged].sort(byPath) };
}
