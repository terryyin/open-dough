// A selected Intent entry's or folder's CI proof (`./IntentScopeProof.tsx`),
// derived from the one CI proof summary Intent's homepage shows
// (`./IntentCiEvidence.tsx`), never from source reads: the declared entry
// whose path holds the scope (the longest one), the scope's figures summed
// by path over that entry's file breakdown whatever the browsable inventory
// lists, the immediate folders and files the inventory lists in the
// browser's tree order (`./reviewFileTree.ts`), each child's figures the same
// way, and what the scope's figures hold that no child row shows: files the
// inventory does not list and, for the entry itself, results CI could not
// place in a file.

import type { CiProofEntry, CiProofFigures, CiProofFile } from "./ciProof.ts";
import { reviewFileTree, type PathBearing } from "./reviewFileTree.ts";

// A scope's figures inside an entry: summed over the entry's file breakdown
// for every file at or under the scope's path; `files` is how many files
// matched, none meaning CI published no result for the scope.
export type CiScopeFigures = CiProofFigures & { readonly files: number };

export type SummaryChild = {
  readonly kind: "folder" | "file";
  readonly name: string;
  readonly path: string;
};

type RelativeFile = PathBearing & { readonly full: string };

// The inventory's immediate folders and files under SELECTION_PATH, in the
// browser's tree order.
export function immediateChildrenOf(
  selectionPath: string,
  files: readonly string[],
): readonly SummaryChild[] {
  const prefix = `${selectionPath}/`;
  const relative: RelativeFile[] = files.flatMap((full) => {
    if (!full.startsWith(prefix)) return [];
    return [{ path: full.slice(prefix.length), full }];
  });
  return reviewFileTree(relative).map((node) =>
    node.kind === "file"
      ? {
          kind: "file" as const,
          name: node.name,
          path: `${selectionPath}/${node.file.path}`,
        }
      : {
          kind: "folder" as const,
          name: node.name,
          path: `${selectionPath}/${node.path}`,
        },
  );
}

const isAtOrUnder = (path: string, scope: string) =>
  path === scope || path.startsWith(`${scope}/`);

// The declared entry holding PATH: the longest entry path at or above it.
export function owningEntryOf(
  entries: readonly CiProofEntry[],
  path: string,
): CiProofEntry | undefined {
  return entries
    .filter((entry) => isAtOrUnder(path, entry.path))
    .sort((left, right) => right.path.length - left.path.length)[0];
}

function summedFigures(
  figures: readonly CiProofFigures[],
  files: number,
): CiScopeFigures {
  let passed = 0;
  let failed = 0;
  let other = 0;
  let untimed = 0;
  let durationMs: number | undefined;
  for (const value of figures) {
    passed += value.passed;
    failed += value.failed;
    other += value.other;
    untimed += value.untimed ?? 0;
    if (value.durationMs !== undefined)
      durationMs = (durationMs ?? 0) + value.durationMs;
  }
  return {
    passed,
    failed,
    other,
    untimed,
    files,
    ...(durationMs === undefined ? {} : { durationMs }),
  };
}

// The figures of SCOPE inside ENTRY: every broken-down file at or under it.
export function scopeFiguresOf(
  entry: CiProofEntry,
  scope: string,
): CiScopeFigures {
  const matched = (entry.files ?? []).filter((file) =>
    isAtOrUnder(file.path, scope),
  );
  return summedFigures(matched, matched.length);
}

// What SCOPE's figures in ENTRY hold that no row for INVENTORY's files
// shows: the broken-down files at or under it that the inventory does not
// list, and for the entry itself its unassigned results. Undefined when
// there is none.
export type ScopeOutside = {
  readonly files: readonly CiProofFile[];
  readonly unassigned: CiProofFigures | undefined;
  readonly figures: CiScopeFigures;
};

export function outsideOf(
  entry: CiProofEntry,
  scope: string,
  inventory: ReadonlySet<string>,
): ScopeOutside | undefined {
  const files = (entry.files ?? []).filter(
    (file) => isAtOrUnder(file.path, scope) && !inventory.has(file.path),
  );
  const unassigned = scope === entry.path ? entry.unassigned : undefined;
  if (files.length === 0 && unassigned === undefined) return undefined;
  return {
    files,
    unassigned,
    figures: summedFigures(
      unassigned === undefined ? files : [...files, unassigned],
      files.length + (unassigned === undefined ? 0 : 1),
    ),
  };
}
