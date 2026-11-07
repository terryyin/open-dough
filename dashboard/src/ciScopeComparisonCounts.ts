// Counted-results of one scope path inside one comparison endpoint proof
// (`./ciScopeComparison.ts`): classify measured / absent / no-breakdown /
// unavailable from `./ciScopeProof.ts` figures the same way timing does in
// `./ciScopeComparisonTiming.ts`, and word the Summary / homepage Counts
// cell as baseline → after with a signed difference in parentheses. A signed
// difference exists only between two measured totals. Outcome detail and
// parts stay with the chosen build in `./ciScopeComparison.ts`.

import type { CiProofEntry, CiProofFigures } from "./ciProof.ts";
import {
  countedResultsOf,
  hasFileBreakdown,
  type CountedResults,
} from "./ciProofWording.ts";
import { endpointProofReadOf } from "./ciScopeComparisonEndpoint.ts";
import {
  outsideOf,
  owningEntryOf,
  scopeFiguresOf,
  type SummaryChild,
} from "./ciScopeProof.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

export type ScopeEndpointCount =
  | { readonly kind: "checking" }
  | { readonly kind: "status"; readonly text: string }
  | { readonly kind: "no-breakdown" }
  | { readonly kind: "absent" }
  | { readonly kind: "nothing" }
  | {
      readonly kind: "measured";
      readonly total: number;
      readonly failed: number;
      readonly unit: string;
    };

const noFileBreakdown = "no file breakdown";
const minus = "−";

export const totalCounted = (figures: CiProofFigures): number =>
  countedResultsOf(figures).total;

// The counted results a Counts column sorts COUNT by: none for a gap, and
// none counted for an entry that counts nothing.
export function countedResultsOfCount(
  count: ScopeEndpointCount,
): CountedResults | undefined {
  if (count.kind === "measured")
    return { total: count.total, failed: count.failed };
  return count.kind === "nothing" ? { total: 0, failed: 0 } : undefined;
}

function formatTotal(total: number): string {
  return total.toLocaleString("en-US");
}

function signedCountWords(delta: number): string {
  if (delta === 0) return "0";
  return delta > 0 ? `+${String(delta)}` : `${minus}${String(Math.abs(delta))}`;
}

// "12 → 10 tests (−2)" or "6 tests (no change)". Units stay with the totals;
// the signed difference is separate text in parentheses.
export function measuredCountsChangeWords(
  before: number,
  after: number,
  unit: string,
): string {
  if (before === after) return `${formatTotal(after)} ${unit} (no change)`;
  return `${formatTotal(before)} → ${formatTotal(after)} ${unit} (${signedCountWords(after - before)})`;
}

function measuredOf(
  entry: CiProofEntry,
  figures: CiProofFigures,
): ScopeEndpointCount {
  if (entry.unit === null) return { kind: "nothing" };
  return {
    kind: "measured",
    ...countedResultsOf(figures),
    unit: entry.unit,
  };
}

export function scopeEndpointCountOf(
  proof: ComparisonEndpointProof,
  lookup: string,
): ScopeEndpointCount {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, lookup);
  if (entry === undefined) return { kind: "absent" };
  if (lookup === entry.path) return measuredOf(entry, entry);
  if (!hasFileBreakdown(entry)) return { kind: "no-breakdown" };
  const figures = scopeFiguresOf(entry, lookup);
  if (figures.files === 0) return { kind: "absent" };
  return measuredOf(entry, figures);
}

export function outsideCountOf(
  proof: ComparisonEndpointProof,
  path: string,
  children: readonly SummaryChild[],
): ScopeEndpointCount {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, path);
  if (entry === undefined) return { kind: "absent" };
  if (!hasFileBreakdown(entry)) return { kind: "no-breakdown" };
  const outside = outsideOf(entry, path, children);
  if (outside === undefined) return { kind: "absent" };
  return measuredOf(entry, outside.figures);
}

function baselineCountText(
  count: ScopeEndpointCount,
  presentLater: boolean,
): string {
  if (count.kind === "checking") return "…";
  if (count.kind === "status") return count.text;
  if (count.kind === "no-breakdown") return noFileBreakdown;
  if (count.kind === "absent") return presentLater ? "added" : "—";
  if (count.kind === "nothing") return "nothing counted";
  return formatTotal(count.total);
}

function afterCountText(
  count: ScopeEndpointCount,
  presentInBaseline: boolean,
  changeKind?: ChangeKind,
): string {
  if (count.kind === "checking") return "…";
  if (count.kind === "status") return count.text;
  if (count.kind === "no-breakdown") return noFileBreakdown;
  if (count.kind === "absent") {
    if (changeKind === "deleted" || presentInBaseline) return "removed";
    return "added";
  }
  if (count.kind === "nothing") return "nothing counted";
  return formatTotal(count.total);
}

function unitOf(
  before: ScopeEndpointCount,
  branch: ScopeEndpointCount,
  landed: ScopeEndpointCount,
): string | undefined {
  for (const count of [landed, branch, before]) {
    if (count.kind === "measured") return count.unit;
  }
  return undefined;
}

function sameMeasured(
  left: ScopeEndpointCount,
  right: ScopeEndpointCount,
): boolean {
  return (
    left.kind === "measured" &&
    right.kind === "measured" &&
    left.total === right.total &&
    left.unit === right.unit
  );
}

function countsChangePhrase(
  before: ScopeEndpointCount,
  after: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind: ChangeKind | undefined,
  unit: string | undefined,
): string {
  if (before.kind === "measured" && after.kind === "measured") {
    return measuredCountsChangeWords(before.total, after.total, after.unit);
  }
  const baselineText = baselineCountText(before, presentLater);
  const afterText = afterCountText(after, presentInBaseline, changeKind);
  if (baselineText === afterText) {
    return after.kind === "measured" && unit !== undefined
      ? `${afterText} ${unit}`
      : afterText;
  }
  // Append the unit only when an after endpoint measured a total, so
  // "1 → removed" stays a gap and "added → 1 tests" keeps its unit.
  if (after.kind === "measured" && unit !== undefined) {
    return `${baselineText} → ${afterText} ${unit}`;
  }
  return `${baselineText} → ${afterText}`;
}

// One Counts cell: baseline → after with signed differences when both sides
// are measured; a gap endpoint shows its gap, never an invented difference.
export function countsCellText(
  before: ScopeEndpointCount,
  branch: ScopeEndpointCount,
  landed: ScopeEndpointCount,
  presentLater: boolean,
  presentInBaseline: boolean,
  changeKind?: ChangeKind,
): string {
  const unit = unitOf(before, branch, landed);
  const phrase = (after: ScopeEndpointCount) =>
    countsChangePhrase(
      before,
      after,
      presentLater,
      presentInBaseline,
      changeKind,
      unit,
    );
  const branchText = afterCountText(branch, presentInBaseline, changeKind);
  const landedText = afterCountText(landed, presentInBaseline, changeKind);

  if (
    baselineCountText(before, presentLater) === branchText &&
    branchText === landedText &&
    !(before.kind === "measured" && branch.kind === "measured")
  ) {
    return phrase(branch);
  }
  if (sameMeasured(branch, landed) || landed.kind !== "measured") {
    if (branch.kind === "measured" || branchText === landedText) {
      return phrase(branch);
    }
  }
  if (branch.kind === "status" || branch.kind === "checking") {
    return phrase(landed);
  }
  if (landed.kind === "status" || landed.kind === "checking") {
    return phrase(branch);
  }
  if (branchText === landedText) {
    return phrase(branch);
  }
  if (
    before.kind === "measured" &&
    branch.kind === "measured" &&
    landed.kind === "measured"
  ) {
    return `${measuredCountsChangeWords(before.total, branch.total, branch.unit)} → ${formatTotal(landed.total)} ${landed.unit} (${signedCountWords(landed.total - before.total)})`;
  }
  return `${phrase(branch)} → ${landedText}${landed.kind === "measured" && unit !== undefined ? ` ${unit}` : ""}`;
}
