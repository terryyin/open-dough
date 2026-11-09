// A selected Intent entry's or folder's CI proof (`./IntentScopeProof.tsx`),
// derived from the one CI proof summary Intent's homepage shows
// (`./IntentCiEvidence.tsx`), never from source reads: the declared entry
// whose path holds the scope (the longest one), and for each unit's results
// there (`./ciProofUnits.ts`) the scope's figures summed by path over that
// unit's file breakdown whatever the browsable inventory lists, the
// immediate folders and files the inventory lists in the browser's tree
// order (`./reviewFileTree.ts`), each child's figures the same way, and what
// the scope's figures hold that no child row shows: files no child row
// covers, which the inventory therefore does not list, and, for the entry
// itself, results CI could not place in a file. A file the inventory does
// not list under a listed child folder counts in that folder's row, and
// shows as outside only once that folder is selected, so the child rows and
// the outside row hold each result exactly once. Figures stay within their
// unit; how many breakdown paths a scope matches is never a count of test
// files.

import type {
  CiProofEntry,
  CiProofEvidence,
  CiProofFigures,
  CiProofFile,
} from "./ciProof.ts";
import {
  countedAny,
  entryEvidenceOf,
  hasFileBreakdown,
  type CiEntryEvidence,
} from "./ciProofUnits.ts";
import { reviewFileTree, type PathBearing } from "./reviewFileTree.ts";

// A scope's figures in one unit inside an entry: summed over that unit's
// file breakdown for every path at or under the scope's path; `paths` is how
// many breakdown paths matched, none meaning CI published no result of that
// unit for the scope. It counts paths, never test files.
export type CiScopeFigures = CiProofFigures & { readonly paths: number };

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
  paths: number,
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
    paths,
    ...(durationMs === undefined ? {} : { durationMs }),
  };
}

// The figures of SCOPE in one unit's EVIDENCE: every broken-down path at or
// under it.
export function scopeFiguresOf(
  evidence: CiProofEvidence,
  scope: string,
): CiScopeFigures {
  const matched = (evidence.files ?? []).filter((file) =>
    isAtOrUnder(file.path, scope),
  );
  return summedFigures(matched, matched.length);
}

// One unit's results as shown at a scope: at its entry's own path its
// totals (no `figures`), inside it the scope's figures.
export type UnitResults = {
  readonly evidence: CiEntryEvidence;
  readonly figures: CiScopeFigures | undefined;
};

// The results ENTRY shows at SCOPE, one per unit: every unit's at the
// entry's path; inside it, each unit's whose breakdown holds a result there
// or that counted results without a file breakdown, so cannot say; when no
// unit holds one, the first unit's alone, saying what the scope lacks.
export function unitResultsAt(
  entry: CiProofEntry,
  scope: string,
): readonly UnitResults[] {
  const evidence = entryEvidenceOf(entry);
  if (scope === entry.path)
    return evidence.map((unit) => ({ evidence: unit, figures: undefined }));
  const shown = evidence.map((unit) => ({
    evidence: unit,
    figures: scopeFiguresOf(unit, scope),
  }));
  const held = shown.filter(({ evidence: unit, figures }) =>
    hasFileBreakdown(unit) ? figures.paths > 0 : countedAny(unit),
  );
  return held.length > 0 ? held : shown.slice(0, 1);
}

// The units of SHOWN (`unitResultsAt`) with results at their scope: each
// at its entry's own path; inside it, each whose file breakdown holds a
// result there.
export const unitsWithResults = (
  shown: readonly UnitResults[],
): readonly UnitResults[] =>
  shown.filter(
    ({ evidence, figures }) =>
      figures === undefined ||
      (hasFileBreakdown(evidence) && figures.paths > 0),
  );

// Why SHOWN has no unit with results inside its entry: no file breakdown
// when a unit cannot say, otherwise absent, as CI published none there.
export const noResultsKindOf = (
  shown: readonly UnitResults[],
): "no-breakdown" | "absent" =>
  shown.some(({ evidence }) => !hasFileBreakdown(evidence))
    ? "no-breakdown"
    : "absent";

// What SCOPE's figures in one unit's EVIDENCE hold that none of its
// CHILDREN's rows shows: the broken-down paths at or under it that no child
// folder or file covers, and for the entry itself its unassigned results.
// Undefined when there is none.
export type ScopeOutside = {
  readonly files: readonly CiProofFile[];
  readonly unassigned: CiProofFigures | undefined;
  readonly figures: CiScopeFigures;
};

export function outsideOf(
  evidence: CiEntryEvidence,
  scope: string,
  children: readonly SummaryChild[],
): ScopeOutside | undefined {
  const files = (evidence.files ?? []).filter(
    (file) =>
      isAtOrUnder(file.path, scope) &&
      !children.some((child) => isAtOrUnder(file.path, child.path)),
  );
  const unassigned = scope === evidence.path ? evidence.unassigned : undefined;
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

// What SCOPE's figures hold that none of its CHILDREN's rows shows, in each
// unit of ENTRY broken down by file that holds such results.
export type UnitOutside = {
  readonly evidence: CiEntryEvidence;
  readonly outside: ScopeOutside;
};

export function entryOutsidesOf(
  entry: CiProofEntry,
  scope: string,
  children: readonly SummaryChild[],
): readonly UnitOutside[] {
  return entryEvidenceOf(entry).flatMap((evidence) => {
    if (!hasFileBreakdown(evidence)) return [];
    const outside = outsideOf(evidence, scope, children);
    return outside === undefined ? [] : [{ evidence, outside }];
  });
}
