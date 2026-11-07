// Overall counted-results wording for a story's CI comparison on Intent's
// homepage (`./IntentCiComparison.tsx`): per-unit totals of the two compared
// builds' proofs, framed as an observation between single builds. Timing and
// selection wording stay in `./storyCiComparisonWording.ts`.

import {
  measuredCountsChangeWords,
  totalCounted,
} from "./ciScopeComparisonCounts.ts";
import { overallCountCueOf, type CountCue } from "./ciScopeComparisonCues.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

function unitTotalsOf(
  proof: ComparisonEndpointProof,
):
  | { readonly kind: "totals"; readonly byUnit: ReadonlyMap<string, number> }
  | { readonly kind: "partial"; readonly reason: string }
  | { readonly kind: "none" } {
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
  const byUnit = new Map<string, number>();
  for (const entry of proof.entries) {
    if (entry.unit === null) continue;
    byUnit.set(entry.unit, (byUnit.get(entry.unit) ?? 0) + totalCounted(entry));
  }
  if (byUnit.size === 0) return { kind: "none" };
  return { kind: "totals", byUnit };
}

function orderedUnitsOf(
  before: ReturnType<typeof unitTotalsOf>,
  later: ReturnType<typeof unitTotalsOf>,
): string[] {
  const units = new Set<string>([
    ...(before.kind === "totals" ? before.byUnit.keys() : []),
    ...(later.kind === "totals" ? later.byUnit.keys() : []),
  ]);
  // Stable unit order: tests, then checks, then any other unit by name.
  return [...units].sort((left, right) => {
    const rank = (unit: string) =>
      unit === "tests" ? 0 : unit === "checks" ? 1 : 2;
    const byRank = rank(left) - rank(right);
    return byRank !== 0 ? byRank : left.localeCompare(right);
  });
}

// Overall counted-results difference with units kept apart (tests and checks
// are never mixed). Partial when either build lacks a usable total.
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
  if (before.kind === "none" && later.kind === "none") {
    return "No overall count: neither compared build has a usable total.";
  }
  const parts = orderedUnitsOf(before, later).map((unit) => {
    const from = before.kind === "totals" ? (before.byUnit.get(unit) ?? 0) : 0;
    const to = later.kind === "totals" ? (later.byUnit.get(unit) ?? 0) : 0;
    return measuredCountsChangeWords(from, to, unit);
  });
  return parts.join("; ");
}

// Overall count cue from the same unit totals the summary words use.
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
  if (before.kind === "none" && later.kind === "none") {
    return { kind: "none", reason: "no overall count" };
  }
  return overallCountCueOf(
    orderedUnitsOf(before, later).map((unit) => ({
      before: before.kind === "totals" ? (before.byUnit.get(unit) ?? 0) : 0,
      after: later.kind === "totals" ? (later.byUnit.get(unit) ?? 0) : 0,
    })),
  );
}
