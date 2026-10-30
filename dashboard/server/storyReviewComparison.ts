// Compares two points of a story review by restating the from tree on the
// to baseline when they differ, leaving trunk's intervening changes out.
// Inseparable files are compared from the original from tree, or from the
// to baseline when kept as they were. The comparison's paths, counts and
// file diffs therefore all describe the same observation. All changes lists
// a Trunk Mode story's inseparable files through the same listing
// (`./storyPublishedCommits.ts`). Missing from
// objects and unsupported restatement remain distinct; aborted responses
// and Git failures outside restatement belong to the caller.
// A selected range can also supply the listed points of its integrations:
// their inseparable paths survive even if the outer from tree predates the
// story edit or the resolution restores that tree's original content.

import {
  type MarkUncomparable,
  type RestatedComparison,
  type ReviewedFile,
  type ReviewIntegration,
} from "../src/storyReviewContract.ts";
import { gitExitedOne, runGit, type GitCall } from "./gitRunner.ts";
import { mergeTreeOutput } from "./mergeTreeOutput.ts";
import {
  baselinesDiffer,
  reviewPointObjects,
  type ReviewPoint,
} from "./storyReviewPoints.ts";
import { changedFrom } from "./storyReviewFiles.ts";

// Whether the repository holds the point's tree and its baseline: a commit,
// or for a from point, which a mark can supply, a tree as well.
async function holdsPoint(
  point: ReviewPoint,
  call: GitCall,
  baselineType?: "tree",
) {
  try {
    for (const object of reviewPointObjects(point, baselineType)) {
      await runGit(["rev-parse", "--verify", "--quiet", object], call);
    }
    return true;
  } catch (error) {
    if (gitExitedOne(error)) return false;
    throw error;
  }
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
  return [
    ...restated.filter((file) => !touches(file, new Set(origins.keys()))),
    ...flagged.values(),
  ].sort(byPath);
}

// The points' comparison, with whether trunk was integrated between them,
// or why the from point cannot be compared.
export async function compareReviewPoints(
  from: ReviewPoint,
  to: ReviewPoint,
  call: GitCall,
  integrations: readonly ReviewIntegration[] = [],
): Promise<
  | { readonly kind: "comparison"; readonly comparison: RestatedComparison }
  | { readonly kind: "uncomparable"; readonly reason: MarkUncomparable }
> {
  if (!(await holdsPoint(from, call, "tree")))
    return { kind: "uncomparable", reason: "unreadable" };
  const restatement = await restatedPoint(from, to.baseline, call);
  if (restatement === undefined)
    return { kind: "uncomparable", reason: "not-restated" };
  const { tree, inseparable } = restatement;
  for (const integration of integrations) {
    if (
      !(await holdsPoint(
        { tree: integration.fromTree, baseline: integration.fromBaseline },
        call,
      )) ||
      !(await holdsPoint(
        { tree: integration.fromTree, baseline: integration.baseline },
        call,
      ))
    ) {
      return { kind: "uncomparable", reason: "unreadable" };
    }
    const same =
      integration.fromTree === from.tree &&
      integration.fromBaseline === from.baseline &&
      integration.baseline === to.baseline;
    const integrated = same
      ? restatement
      : await restatedPoint(
          { tree: integration.fromTree, baseline: integration.fromBaseline },
          integration.baseline,
          call,
        );
    if (integrated === undefined) {
      return { kind: "uncomparable", reason: "not-restated" };
    }
    const conflicts = new Set(integrated.inseparable);
    for (const conflict of conflicts) {
      inseparable.add(conflict);
    }
    if (conflicts.size > 0) {
      for (const target of [from.tree, to.tree]) {
        const files = await changedFrom(integration.fromTree, target, call);
        for (const file of files) {
          if (file.kind === "renamed" && touches(file, conflicts)) {
            inseparable.add(file.oldPath);
            inseparable.add(file.path);
          }
        }
      }
    }
  }
  return {
    kind: "comparison",
    comparison: {
      trunkIntegrated: await baselinesDiffer(from, to, call),
      from: tree,
      files: await listedFrom(
        tree,
        to.tree,
        new Map([...inseparable].map((file) => [file, from.tree])),
        to.baseline,
        call,
      ),
    },
  };
}
