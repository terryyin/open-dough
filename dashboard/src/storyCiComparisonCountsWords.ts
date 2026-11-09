// Overall counted-results wording for a story's CI comparison on Intent's
// homepage (`./IntentCiComparison.tsx`): per-unit totals of the two compared
// builds' proofs, framed as an observation between single builds. Only
// declared units (`./ciProofUnits.ts`) are totalled and compared, each on its
// own: a unit one build does not report is no zero, and legacy results,
// whose unit is not known, are never totalled or compared. Timing and
// selection wording stay in `./storyCiComparisonWording.ts`.

import {
  countWords,
  measuredCountsChangeWords,
  totalCounted,
} from "./ciScopeComparisonCounts.ts";
import { overallCountCueOf, type CountCue } from "./ciScopeComparisonCues.ts";
import {
  countedAny,
  declaredUnits,
  type DeclaredUnit,
} from "./ciProofUnits.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

function unitTotalsOf(proof: ComparisonEndpointProof):
  | {
      readonly kind: "totals";
      readonly byUnit: ReadonlyMap<DeclaredUnit, number>;
      // Whether the build reports legacy results, which are not totalled.
      readonly legacy: boolean;
    }
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
  const byUnit = new Map<DeclaredUnit, number>();
  let legacy = false;
  for (const entry of proof.entries) {
    for (const evidence of entry.evidence) {
      if (!countedAny(evidence)) continue;
      if (evidence.unit === "legacy") {
        legacy = true;
        continue;
      }
      byUnit.set(
        evidence.unit,
        (byUnit.get(evidence.unit) ?? 0) + totalCounted(evidence),
      );
    }
  }
  return { kind: "totals", byUnit, legacy };
}

type UnitTotals = Extract<ReturnType<typeof unitTotalsOf>, { kind: "totals" }>;

// The declared units either build totals, in stable order.
const unitsOf = (before: UnitTotals, later: UnitTotals) =>
  declaredUnits.filter(
    (unit) => before.byUnit.has(unit) || later.byUnit.has(unit),
  );

const legacyNotCompared = "legacy test results not compared";

// Overall counted-results difference with units kept apart (test cases and
// test files are never mixed), a unit only one build reports shown without a
// difference. Partial when either build lacks a usable total.
export function overallCountsWords(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): string {
  const before = unitTotalsOf(baseline);
  const later = unitTotalsOf(after);
  const partialLine = (reason: string) =>
    `Overall count partial: ${reason.replace(/\.$/, "")}.`;
  if (before.kind === "partial") {
    return partialLine(before.reason);
  }
  if (later.kind === "partial") {
    return partialLine(later.reason);
  }
  const parts = unitsOf(before, later).map((unit) => {
    const from = before.byUnit.get(unit);
    const to = later.byUnit.get(unit);
    if (from !== undefined && to !== undefined)
      return measuredCountsChangeWords(from, to, unit);
    const side = (total: number | undefined) =>
      total === undefined ? "—" : countWords(total, unit);
    return `${side(from)} → ${side(to)}`;
  });
  const legacy = before.legacy || later.legacy;
  if (parts.length === 0) {
    return legacy
      ? "No overall count: legacy test results are not compared."
      : "No overall count: neither compared build has a usable total.";
  }
  return [...parts, ...(legacy ? [legacyNotCompared] : [])].join("; ");
}

// Overall count cue from the same unit totals the summary words use: only
// units both builds report.
export function overallCountsCue(
  baseline: ComparisonEndpointProof,
  after: ComparisonEndpointProof,
): CountCue {
  const before = unitTotalsOf(baseline);
  const later = unitTotalsOf(after);
  if (before.kind === "partial") {
    return { kind: "none", reason: "partial" };
  }
  if (later.kind === "partial") {
    return { kind: "none", reason: "partial" };
  }
  return overallCountCueOf(
    unitsOf(before, later).flatMap((unit) => {
      const from = before.byUnit.get(unit);
      const to = later.byUnit.get(unit);
      return from === undefined || to === undefined
        ? []
        : [{ before: from, after: to }];
    }),
  );
}
