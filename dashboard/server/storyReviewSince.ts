// A story review's changes since the review (`./storyReviewSnapshot.ts`):
// the snapshot compared with its story's marked snapshot
// (`./storyReviewMarks.ts`) restated on the review's current baseline, so
// what came only from trunk stays out. With an unchanged baseline that is
// the marked tree itself, and nothing is restated. Otherwise Git merges what
// trunk changed from the marked baseline to the current one into the marked
// tree, writing the result as a tree object and touching no index, worktree,
// or ref. A file Git could not merge -- trunk and the story both changed it
// inseparably -- is listed, its kind and diff from the marked tree, flagged
// as including trunk's changes, so no story change is hidden; one the story
// kept as marked is listed from the baseline, showing that the story's
// version replaces trunk's. The earlier
// review cannot be compared, and the answer says why, when the repository no
// longer holds the mark's tree or baseline -- the project was cloned anew,
// say -- or when this machine's Git cannot restate it (Git before 2.45
// merges no tree given with `--merge-base`); a restatement the response
// aborted, and any Git failure outside restating, is the caller's.

import {
  objectIdSchema,
  type MarkUncomparable,
  type ReviewComparison,
  type ReviewedFile,
  type ReviewMark,
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
// merge; undefined when Git could not restate it at all.
async function restatedMark(mark: ReviewMark, baseline: string, call: GitCall) {
  const output = await runGit(
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
    // Only a conflicted merge exits 1 having printed its tree first.
    const [first] = error instanceof GitFailure ? error.stdout.split("\0") : [];
    if (exitedOne(error) && objectIdSchema.safeParse(first).success)
      return error;
    if (call.signal?.aborted === true) throw error;
    return undefined;
  });
  if (output === undefined) return undefined;
  // The tree, then the conflicted files' names up to an empty field, then
  // Git's messages.
  const [tree = "", ...rest] = output.stdout.split("\0");
  const end = rest.indexOf("");
  return {
    tree,
    inseparable: new Set(end === -1 ? rest : rest.slice(0, end)),
  };
}

const byPath = (a: ReviewedFile, b: ReviewedFile) =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

// The changes since the review, or why the earlier review cannot be
// compared.
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
): Promise<
  | { readonly since: ReviewComparison }
  | { readonly markUncomparable: MarkUncomparable }
> {
  if (!(await holdsMark(mark, call))) return { markUncomparable: "unreadable" };
  const restatement =
    mark.baseline === baseline
      ? { tree: mark.tree, inseparable: new Set<string>() }
      : await restatedMark(mark, baseline, call);
  if (restatement === undefined) return { markUncomparable: "not-restated" };
  const { tree, inseparable } = restatement;
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
  const fromMark =
    flaggedPaths.size === 0
      ? []
      : await changedFrom(mark.tree, [...flaggedPaths]);
  // An inseparable file the story kept as marked is compared from the
  // baseline instead, so its diff shows the story's version against trunk's.
  const differed = new Set(
    fromMark.flatMap((file) =>
      file.kind === "renamed" ? [file.path, file.oldPath] : [file.path],
    ),
  );
  const keptAsMarked = [...inseparable].filter((file) => !differed.has(file));
  const fromBaseline =
    keptAsMarked.length === 0 ? [] : await changedFrom(baseline, keptAsMarked);
  const flagged = [
    ...fromMark.map((file) => ({ ...file, includesTrunkFrom: mark.tree })),
    ...fromBaseline.map((file) => ({ ...file, includesTrunkFrom: baseline })),
  ];
  return {
    since: { from: tree, files: [...separated, ...flagged].sort(byPath) },
  };
}
