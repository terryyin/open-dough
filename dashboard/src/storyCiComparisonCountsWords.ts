// Overall counted-results wording for a story's CI comparison on Intent's
// homepage (`./IntentCiComparison.tsx`): per-unit totals of the two compared
// builds' proofs, framed as an observation between single builds, matched
// entry by entry as every compared scope matches its units
// (`./ciScopeComparisonUnits.ts`). An entry's results in a declared unit
// (`./ciProofUnits.ts`) count toward that unit's difference when both builds
// report the entry in it, or when only one build declares the entry at all
// (added or removed). Every other result — legacy results, whose unit is not
// known, and an entry's unit only one build reports — is no zero: those
// results are totalled apart, each build in its units, with why there is no
// difference. Timing and selection wording stay in
// `./storyCiComparisonWording.ts`.

import {
  countWords,
  measuredCountsChangeWords,
  totalCounted,
} from "./ciScopeComparisonCounts.ts";
import { overallCountCueOf } from "./ciScopeComparisonAgreedCues.ts";
import type { CountCue } from "./ciScopeComparisonCues.ts";
import {
  countedAny,
  declaredUnits,
  listedUnits,
  whyNotCompared,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

// Each declared entry's counted total in each unit it counted results in.
type EntryTotals = ReadonlyMap<string, ReadonlyMap<CiProofUnit, number>>;

function entryTotalsOf(
  proof: ComparisonEndpointProof,
):
  | { readonly kind: "entries"; readonly entries: EntryTotals }
  | { readonly kind: "partial"; readonly reason: string } {
  if (proof.kind === "checking") {
    return {
      kind: "partial",
      reason: "a compared build's proof is still reading",
    };
  }
  if (proof.kind === "unavailable") {
    return { kind: "partial", reason: proof.line };
  }
  if (proof.kind === "no-build") {
    return { kind: "partial", reason: proof.explanation };
  }
  return {
    kind: "entries",
    entries: new Map(
      proof.entries.map((entry) => [
        entry.path,
        new Map(
          entry.evidence.flatMap((evidence) =>
            countedAny(evidence)
              ? [[evidence.unit, totalCounted(evidence)] as const]
              : [],
          ),
        ),
      ]),
    ),
  };
}

type Totals = Map<CiProofUnit, number>;

const add = (totals: Totals, unit: CiProofUnit, total: number) =>
  totals.set(unit, (totals.get(unit) ?? 0) + total);

// Each build's totals that compare and those that do not.
type MatchedTotals = {
  readonly kind: "matched";
  readonly compared: { readonly before: Totals; readonly after: Totals };
  readonly apart: { readonly before: Totals; readonly after: Totals };
};

function matchedTotalsOf(
  before: EntryTotals,
  after: EntryTotals,
): MatchedTotals {
  const totals: MatchedTotals = {
    kind: "matched",
    compared: { before: new Map(), after: new Map() },
    apart: { before: new Map(), after: new Map() },
  };
  const paths = new Set([...before.keys(), ...after.keys()]);
  for (const path of paths) {
    const from = before.get(path);
    const to = after.get(path);
    const side = (
      units: ReadonlyMap<CiProofUnit, number> | undefined,
      other: ReadonlyMap<CiProofUnit, number> | undefined,
      at: "before" | "after",
    ) => {
      for (const [unit, total] of units ?? []) {
        // An entry the other build does not declare is added or removed.
        const compares =
          unit !== "legacy" && (other === undefined || other.has(unit));
        add(totals[compares ? "compared" : "apart"][at], unit, total);
      }
    };
    side(from, to, "before");
    side(to, from, "after");
  }
  return totals;
}

// The two compared builds' totals matched entry by entry, or why the overall
// count is partial: either build lacks a usable total.
function overallTotalsOf(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): MatchedTotals | { readonly kind: "partial"; readonly reason: string } {
  const before = entryTotalsOf(baseline);
  if (before.kind === "partial") return before;
  const later = entryTotalsOf(after);
  if (later.kind === "partial") return later;
  return matchedTotalsOf(before.entries, later.entries);
}

// "1 test file and 6 legacy test results", or "—" without any.
function totalsWords(totals: Totals): string {
  const units = listedUnits.filter((unit) => totals.has(unit));
  if (units.length === 0) return "—";
  return units
    .map((unit) => countWords(totals.get(unit) ?? 0, unit))
    .join(" and ");
}

// The results that do not compare, each build in its units, with why when
// both builds have such results (`whyNotCompared`).
function apartWords({ before, after }: MatchedTotals["apart"]): string[] {
  if (before.size === 0 && after.size === 0) return [];
  const why =
    before.size === 0 || after.size === 0
      ? ""
      : ` (${whyNotCompared([...before.keys(), ...after.keys()])})`;
  return [`${totalsWords(before)} → ${totalsWords(after)}${why}`];
}

// Overall counted-results difference with units kept apart (test cases and
// test files are never mixed), a unit only one build reports shown without a
// difference, and results that do not compare totalled apart. Partial when
// either build lacks a usable total.
export function overallCountsWords(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): string {
  const totals = overallTotalsOf(baseline, after);
  if (totals.kind === "partial")
    return `Overall count partial: ${totals.reason.replace(/\.$/, "")}.`;
  const { compared, apart } = totals;
  const parts = declaredUnits.flatMap((unit) => {
    const from = compared.before.get(unit);
    const to = compared.after.get(unit);
    if (from === undefined && to === undefined) return [];
    if (from !== undefined && to !== undefined)
      return [measuredCountsChangeWords(from, to, unit)];
    const side = (total: number | undefined) =>
      total === undefined ? "—" : countWords(total, unit);
    return [`${side(from)} → ${side(to)}`];
  });
  const shown = [...parts, ...apartWords(apart)];
  return shown.length === 0
    ? "No overall count: neither compared build has a usable total."
    : shown.join("; ");
}

// Overall count cue from the same totals the summary words use: only units
// both builds have compared totals in.
export function overallCountsCue(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): CountCue {
  const totals = overallTotalsOf(baseline, after);
  if (totals.kind === "partial") return { kind: "none", reason: "partial" };
  const { compared } = totals;
  return overallCountCueOf(
    declaredUnits.flatMap((unit) => {
      const from = compared.before.get(unit);
      const to = compared.after.get(unit);
      return from === undefined || to === undefined
        ? []
        : [{ before: from, after: to }];
    }),
  );
}
