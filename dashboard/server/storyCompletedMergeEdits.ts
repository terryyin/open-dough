// An owning or completion merge's own edits, separated from what Git merged
// automatically. Genuine conflict paths are mixed work. Edits on paths Git did
// not report as conflicted are taken out like a story commit, against the
// merge tree with only those edits undone. Paths `merge-tree` reported only
// through directory-rename heuristics, which the story branch did not change
// and the merge kept as trunk had them, are neither.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runGit, type GitCall } from "./gitRunner.ts";
import { storySideOf } from "./storyPublishedEndpointDerived.ts";
import type { PublishedCommit } from "./storyPublishedEvidence.ts";

const names = (output: string) => new Set(output.split("\0").filter(Boolean));

export async function owningMergeEdits(
  merge: string,
  [first, second]: readonly [string, string],
  // Git's automatic merge of the parents: its tree and conflicted paths.
  automatic: {
    readonly tree: string;
    readonly inseparable: ReadonlySet<string>;
  },
  // Paths whose committed merge differs from that automatic tree.
  resolved: readonly string[],
  storyCommits: readonly string[],
  call: GitCall,
): Promise<{
  readonly conflicts: readonly string[];
  // The merge's own edits as a commit taken out against the tree without
  // them; absent when the merge made none outside its conflicts.
  readonly edit?: PublishedCommit;
}> {
  const git = async (...args: string[]) => (await runGit(args, call)).stdout;
  const [trunkParent, storyParent] =
    (await storySideOf(first, second, storyCommits, call)) === "second"
      ? [first, second]
      : [second, first];
  const base = (await git("merge-base", first, second)).trim();
  const diffed = async (from: string, to: string) =>
    names(await git("diff", "--name-only", "--no-renames", "-z", from, to));
  const storyChanged = await diffed(base, storyParent);
  const keptFromTrunk = await diffed(trunkParent, merge);
  const untouched = new Set(
    [...automatic.inseparable, ...resolved].filter(
      (file) => !storyChanged.has(file) && !keptFromTrunk.has(file),
    ),
  );
  const conflicts = [...automatic.inseparable].filter(
    (file) => !untouched.has(file),
  );
  const edited = new Set(
    resolved.filter(
      (file) => !automatic.inseparable.has(file) && !untouched.has(file),
    ),
  );
  if (edited.size === 0) return { conflicts };
  return {
    conflicts,
    edit: {
      commit: merge,
      parent: await undone(merge, automatic.tree, edited, call),
    },
  };
}

// The merge's tree with `edited` paths as the automatic merge left them,
// written through a temporary index so the checkout's own index, worktree and
// refs stay untouched.
async function undone(
  merge: string,
  automaticTree: string,
  edited: ReadonlySet<string>,
  call: GitCall,
): Promise<string> {
  const folder = await mkdtemp(path.join(tmpdir(), "open-dough-merge-edit-"));
  const indexed: GitCall = {
    ...call,
    env: { ...call.env, GIT_INDEX_FILE: path.join(folder, "index") },
  };
  const git = async (args: string[], input?: string) =>
    (await runGit(args, input === undefined ? indexed : { ...indexed, input }))
      .stdout;
  try {
    await git(["read-tree", `${merge}^{tree}`]);
    const automatic = new Map(
      (await git(["ls-tree", "-r", "-z", automaticTree]))
        .split("\0")
        .filter(Boolean)
        .map((entry) => [entry.slice(entry.indexOf("\t") + 1), entry]),
    );
    const removed = `0 ${"0".repeat(automaticTree.length)}\t`;
    const entries = [...edited].map(
      (file) => automatic.get(file) ?? `${removed}${file}`,
    );
    await git(
      ["update-index", "-z", "--index-info"],
      `${entries.join("\0")}\0`,
    );
    return (await git(["write-tree"])).trim();
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}
