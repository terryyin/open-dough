// Overall count observations matched by entry and unit. Every contributing
// unit retains its missing/conflicting parts, including when none were present.
import { countPartGapsOf, totalCounted } from "./ciScopeComparisonCounts.ts";
import { countedAny, type CiProofUnit } from "./ciProofUnits.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

type EntryCount = {
  readonly total: number | undefined;
  readonly gaps: readonly string[];
};
type EntryTotals = ReadonlyMap<string, ReadonlyMap<CiProofUnit, EntryCount>>;
type PartialTotal = { readonly kind: "partial"; readonly reason: string };

function entryTotalsOf(
  proof: ComparisonEndpointProof,
): { readonly kind: "entries"; readonly entries: EntryTotals } | PartialTotal {
  if (proof.kind === "checking")
    return {
      kind: "partial",
      reason: "a compared build's proof is still reading",
    };
  if (proof.kind === "unavailable")
    return { kind: "partial", reason: proof.line };
  if (proof.kind === "no-build")
    return { kind: "partial", reason: proof.explanation };
  return {
    kind: "entries",
    entries: new Map(
      proof.entries.map((entry) => [
        entry.path,
        new Map(
          entry.evidence.map((evidence) => [
            evidence.unit,
            {
              total: countedAny(evidence) ? totalCounted(evidence) : undefined,
              gaps: countPartGapsOf(evidence),
            },
          ]),
        ),
      ]),
    ),
  };
}

export type Totals = Map<CiProofUnit, number>;
type Side = "before" | "after";
export type MatchedTotals = {
  readonly kind: "matched";
  readonly compared: { readonly before: Totals; readonly after: Totals };
  readonly apart: { readonly before: Totals; readonly after: Totals };
  readonly gaps: {
    readonly before: Map<CiProofUnit, string[]>;
    readonly after: Map<CiProofUnit, string[]>;
  };
};

function matchedTotalsOf(
  before: EntryTotals,
  after: EntryTotals,
): MatchedTotals {
  const totals: MatchedTotals = {
    kind: "matched",
    compared: { before: new Map(), after: new Map() },
    apart: { before: new Map(), after: new Map() },
    gaps: { before: new Map(), after: new Map() },
  };
  for (const path of new Set([...before.keys(), ...after.keys()])) {
    const from = before.get(path);
    const to = after.get(path);
    const side = (
      units: ReadonlyMap<CiProofUnit, EntryCount> | undefined,
      other: ReadonlyMap<CiProofUnit, EntryCount> | undefined,
      at: Side,
    ) => {
      for (const [unit, count] of units ?? []) {
        const compares =
          unit !== "legacy" && (other === undefined || other.has(unit));
        const counted = totals[compares ? "compared" : "apart"][at];
        if (count.total !== undefined)
          counted.set(unit, (counted.get(unit) ?? 0) + count.total);
        if (count.gaps.length > 0)
          totals.gaps[at].set(unit, [
            ...(totals.gaps[at].get(unit) ?? []),
            ...count.gaps.map((gap) => `${path}: ${gap}`),
          ]);
      }
    };
    side(from, to, "before");
    side(to, from, "after");
  }
  return totals;
}

export function overallTotalsOf(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): MatchedTotals | PartialTotal {
  const before = entryTotalsOf(baseline);
  if (before.kind === "partial") return before;
  const later = entryTotalsOf(after);
  return later.kind === "partial"
    ? later
    : matchedTotalsOf(before.entries, later.entries);
}

export const unitHasGaps = (
  totals: MatchedTotals,
  unit: CiProofUnit,
): boolean => totals.gaps.before.has(unit) || totals.gaps.after.has(unit);

// Every observed contributor of UNIT, preserving absence rather than making zero.
export function observedTotalOf(
  totals: MatchedTotals,
  at: Side,
  unit: CiProofUnit,
): number | undefined {
  const compared = totals.compared[at].get(unit);
  const apart = totals.apart[at].get(unit);
  return compared === undefined && apart === undefined
    ? undefined
    : (compared ?? 0) + (apart ?? 0);
}
