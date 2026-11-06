// Scope comparison of a selected story's CI endpoints for Intent Summaries
// and the homepage's entry rows (`./IntentScopeProof.tsx`,
// `./storyCiComparisonEntries.ts`): for one path and each endpoint's proof
// summary, take that scope's figures by `./ciScopeProof.ts` (entry totals at
// the entry's own path; folder and file figures from the file breakdown),
// classify through `./ciScopeComparisonTiming.ts`, and word baseline /
// branch / landed cells with signed differences. A rename reads its baseline
// at its old path. Summary uses precise duration words; the homepage keeps
// whole-second words. Counts and completeness stay from the landed summary
// (or branch when landed has none) for now.

import type { CiProofEntry } from "./ciProof.ts";
import {
  afterCellText,
  baselineCellText,
  outsideTimingOf,
  scopeEndpointTimingOf,
  type ComparisonTimingPrecision,
} from "./ciScopeComparisonTiming.ts";
import {
  ciProofCellsOf,
  ciScopeCellsOf,
  hasFileBreakdown,
} from "./ciProofWording.ts";
import {
  outsideOf,
  owningEntryOf,
  scopeFiguresOf,
  type SummaryChild,
} from "./ciScopeProof.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

export type {
  ComparisonTimingPrecision,
  ScopeEndpointTiming,
} from "./ciScopeComparisonTiming.ts";
export {
  afterCellText,
  baselineCellText,
  scopeEndpointTimingOf,
  scopeTimingOf,
} from "./ciScopeComparisonTiming.ts";

const notInCompared = "not in the compared builds";

export function primaryProofOf(
  landed: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  baseline: ComparisonEndpointProof,
): ComparisonEndpointProof {
  if (landed.kind === "summary") return landed;
  if (branch.kind === "summary") return branch;
  return baseline;
}

function presentIn(proof: ComparisonEndpointProof, path: string): boolean {
  if (proof.kind !== "summary") return false;
  const entry = owningEntryOf(proof.entries, path);
  if (entry === undefined) return false;
  if (path === entry.path) return true;
  if (!hasFileBreakdown(entry)) return false;
  return scopeFiguresOf(entry, path).files > 0;
}

function primaryEntryOf(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): CiProofEntry | undefined {
  const primary = primaryProofOf(landed, branch, baseline);
  const from = (proof: ComparisonEndpointProof) =>
    proof.kind === "summary" ? owningEntryOf(proof.entries, path) : undefined;
  return from(primary) ?? from(branch) ?? from(landed) ?? from(baseline);
}

function proofCellsForPath(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
): Pick<ComparisonEntryCells, "counts" | "completeness" | "gaps"> {
  const entry = primaryEntryOf(path, baseline, branch, landed);
  if (entry === undefined) return { counts: "—", completeness: "—", gaps: [] };
  // Slice 1 keeps counts for the homepage's chosen build; count differences
  // arrive in slice 2. Entry totals match the homepage entry row.
  if (path === entry.path) {
    const cells = ciProofCellsOf(entry);
    return {
      counts: cells.counts,
      completeness: cells.completeness,
      gaps: cells.gaps,
    };
  }
  const scopeCells = ciScopeCellsOf(entry, scopeFiguresOf(entry, path));
  return {
    counts: scopeCells.counts,
    completeness: scopeCells.completeness,
    gaps: scopeCells.gaps,
  };
}

function absentOn(
  proof: ComparisonEndpointProof,
  timing: ReturnType<typeof scopeEndpointTimingOf>,
): boolean {
  // A gap endpoint does not place the path in a compared build.
  if (proof.kind !== "summary") return true;
  return timing.kind === "absent";
}

// Cells for one compared scope path across the three endpoint proofs.
// `baselineLookup` is the path read at baseline (a rename's old path).
// `changeKind` is the story overlay's marker when the path is a story change.
export function scopeComparisonCellsOf(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  precision: ComparisonTimingPrecision,
  baselineLookup: string = path,
  changeKind?: ChangeKind,
): ComparisonEntryCells {
  const presentLater = presentIn(branch, path) || presentIn(landed, path);
  const presentInBaseline =
    presentIn(baseline, baselineLookup) || changeKind === "deleted";
  const before = scopeEndpointTimingOf(baseline, baselineLookup);
  const branchTiming = scopeEndpointTimingOf(branch, path);
  const landedTiming = scopeEndpointTimingOf(landed, path);
  const baselineMs = before.kind === "measured" ? before.ms : undefined;
  // Never measured in any compared summary — including when one endpoint is
  // still running or unavailable, and when a no-breakdown baseline cannot
  // place a later-trunk file. A removed story file keeps "removed" instead.
  const neverInComparedBuilds =
    changeKind !== "deleted" &&
    [baseline, branch, landed].some((proof) => proof.kind === "summary") &&
    ((absentOn(baseline, before) &&
      absentOn(branch, branchTiming) &&
      absentOn(landed, landedTiming)) ||
      (before.kind === "no-breakdown" &&
        branchTiming.kind === "absent" &&
        absentOn(landed, landedTiming) &&
        changeKind === undefined));
  if (neverInComparedBuilds) {
    return {
      ...proofCellsForPath(path, baseline, branch, landed),
      baseline: notInCompared,
      branch: notInCompared,
      landed: notInCompared,
    };
  }
  const renameNote =
    baselineLookup !== path &&
    (presentIn(baseline, baselineLookup) || before.kind === "measured")
      ? ` (was ${baselineLookup})`
      : "";
  const baselineText = baselineCellText(before, presentLater, precision);
  return {
    ...proofCellsForPath(path, baseline, branch, landed),
    baseline: renameNote === "" ? baselineText : `${baselineText}${renameNote}`,
    branch: afterCellText(
      branchTiming,
      baselineMs,
      presentInBaseline,
      precision,
      changeKind,
    ),
    landed: afterCellText(
      landedTiming,
      baselineMs,
      presentInBaseline,
      precision,
      changeKind,
    ),
  };
}

// Comparison cells for the Summary's "Not in the rows above" row: each
// endpoint's outside figures under PATH given the same CHILDREN.
export function outsideComparisonCellsOf(
  path: string,
  children: readonly SummaryChild[],
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  precision: ComparisonTimingPrecision,
): ComparisonEntryCells {
  const before = outsideTimingOf(baseline, path, children);
  const baselineMs = before.kind === "measured" ? before.ms : undefined;
  const branchOutside = outsideTimingOf(branch, path, children);
  const landedOutside = outsideTimingOf(landed, path, children);
  const presentLater =
    branchOutside.kind === "measured" ||
    branchOutside.kind === "explained" ||
    landedOutside.kind === "measured" ||
    landedOutside.kind === "explained";
  const presentInBaseline =
    before.kind === "measured" || before.kind === "explained";
  const primaryEntry = primaryEntryOf(path, baseline, branch, landed);
  const primaryOutside =
    primaryEntry !== undefined && hasFileBreakdown(primaryEntry)
      ? outsideOf(primaryEntry, path, children)
      : undefined;
  const parts =
    primaryEntry === undefined
      ? { counts: "—", completeness: "—", gaps: [] as const }
      : primaryOutside === undefined
        ? {
            counts: "—",
            completeness: ciProofCellsOf(primaryEntry).completeness,
            gaps: ciProofCellsOf(primaryEntry).gaps,
          }
        : (() => {
            const cells = ciScopeCellsOf(primaryEntry, primaryOutside.figures);
            return {
              counts: cells.counts,
              completeness: cells.completeness,
              gaps: cells.gaps,
            };
          })();
  return {
    ...parts,
    baseline: baselineCellText(before, presentLater, precision),
    branch: afterCellText(
      branchOutside,
      baselineMs,
      presentInBaseline,
      precision,
    ),
    landed: afterCellText(
      landedOutside,
      baselineMs,
      presentInBaseline,
      precision,
    ),
  };
}
