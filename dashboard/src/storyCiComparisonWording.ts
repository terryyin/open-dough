// Wording of a story's CI comparison on Intent's homepage
// (`./IntentCiComparison.tsx`): each endpoint's build identity and selection
// rule, CI wall time in whole seconds, readable before → after (Δ[, %])
// differences, the active comparison name, and overall count and timing
// summaries framed as observations between single builds, never attributed
// to the story.

import {
  durationChangeWords,
  wallTimeMs,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import {
  measuredCountsChangeWords,
  totalCounted,
} from "./ciScopeComparisonCounts.ts";
import {
  notLandedYetExplanation,
  type StoryCiComparisonAnswer,
  type StoryCiComparisonSlot,
} from "./storyCiComparison.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEndpointProofs,
} from "./storyCiComparisonEntries.ts";

export function selectionWords(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" | "running" }>,
  provisional = false,
): string {
  const base =
    slot.selection === "exact"
      ? slot.kind === "running"
        ? "exact revision (still running)"
        : "exact revision"
      : (() => {
          const count = slot.laterWithoutResult;
          return `ancestor: ${String(count)} later revision${count === 1 ? "" : "s"} without a build`;
        })();
  // Taken stories label the live tip provisional, not final.
  return provisional ? `provisional · ${base}` : base;
}

export const notLandedYetWords = notLandedYetExplanation;

export function wallTimeWords(slot: StoryCiComparisonSlot): string | undefined {
  if (slot.kind !== "build") return undefined;
  const ms = wallTimeMs(slot.startedAt, slot.completedAt);
  return ms === undefined ? undefined : wholeSecondWords(ms);
}

// Readable CI wall-time change between two completed builds. Percentage only
// when the baseline is a measured non-zero duration.
export function wallTimeChangeWords(
  baseline: StoryCiComparisonSlot,
  after: StoryCiComparisonSlot,
): string | undefined {
  if (baseline.kind !== "build" || after.kind !== "build") return undefined;
  const before = wallTimeMs(baseline.startedAt, baseline.completedAt);
  const later = wallTimeMs(after.startedAt, after.completedAt);
  if (before === undefined || later === undefined) return undefined;
  return durationChangeWords(
    before,
    later,
    wholeSecondWords,
    wholeSecondDifferenceWords,
  );
}

export const observedNotAttributed =
  "observed builds; differences are not attributed to the story";

export type ActiveComparedEndpoint = "Landed" | "Branch" | "Provisional";

export type ActiveComparison = {
  readonly endpoint: ActiveComparedEndpoint;
  readonly slot: StoryCiComparisonSlot;
  readonly proof: ComparisonEndpointProof;
  readonly title: string;
  readonly landedUnusedReason: string | undefined;
};

function landedUnusedReasonOf(
  landed: StoryCiComparisonSlot,
  proof: ComparisonEndpointProof,
): string {
  if (landed.kind === "build" || landed.kind === "running") {
    if (proof.kind === "unavailable") return proof.line;
    if (proof.kind === "no-build") return proof.explanation;
    if (proof.kind === "checking") return "Landed proof is still reading.";
    return "Landed has no CI proof summary.";
  }
  return landed.explanation;
}

// Active comparison: Baseline with Landed when Landed has a proof summary,
// otherwise Branch (or Provisional for Taken Trunk Mode), with why Landed
// is not used when it is skipped.
export function activeComparisonOf(
  answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>,
  proofs: ComparisonEndpointProofs,
): ActiveComparison {
  if (
    proofs.landed.kind === "summary" ||
    (proofs.landed.kind === "checking" &&
      (answer.landed.kind === "build" || answer.landed.kind === "running"))
  ) {
    return {
      endpoint: "Landed",
      slot: answer.landed,
      proof: proofs.landed,
      title: "Baseline compared with Landed",
      landedUnusedReason: undefined,
    };
  }
  const reason = landedUnusedReasonOf(answer.landed, proofs.landed);
  if (answer.provisional !== undefined) {
    return {
      endpoint: "Provisional",
      slot: answer.provisional,
      proof: proofs.branch,
      title: "Baseline compared with Provisional",
      landedUnusedReason: reason,
    };
  }
  return {
    endpoint: "Branch",
    slot: answer.branch,
    proof: proofs.branch,
    title: "Baseline compared with Branch",
    landedUnusedReason: reason,
  };
}

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
  const units = new Set<string>([
    ...(before.kind === "totals" ? before.byUnit.keys() : []),
    ...(later.kind === "totals" ? later.byUnit.keys() : []),
  ]);
  // Stable unit order: tests, then checks, then any other unit by name.
  const ordered = [...units].sort((left, right) => {
    const rank = (unit: string) =>
      unit === "tests" ? 0 : unit === "checks" ? 1 : 2;
    const byRank = rank(left) - rank(right);
    return byRank !== 0 ? byRank : left.localeCompare(right);
  });
  const parts = ordered.map((unit) => {
    const from = before.kind === "totals" ? (before.byUnit.get(unit) ?? 0) : 0;
    const to = later.kind === "totals" ? (later.byUnit.get(unit) ?? 0) : 0;
    return measuredCountsChangeWords(from, to, unit);
  });
  return parts.join("; ");
}
