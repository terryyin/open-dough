// Timing of one scope path inside one comparison endpoint proof
// (`./ciScopeComparison.ts`): the endpoint's read state, or the one timing
// classification (`./ciProofTiming.ts`) of that scope's figures
// (`./ciScopeProof.ts`), and baseline and after cells worded for precise or
// whole-second Summary and homepage wording (`./ciProofTimeWords.ts`).

import type { CiProofEntry } from "./ciProof.ts";
import {
  durationChangeWords,
  executionTimeDifferenceWords,
  executionTimeWords,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import { hasFileBreakdown } from "./ciProofWording.ts";
import {
  entryTimingOf,
  scopeTimingOf,
  timingCellOf,
  type CiTiming,
  type TimingCell,
} from "./ciProofTiming.ts";
import {
  outsideOf,
  owningEntryOf,
  scopeFiguresOf,
  type CiScopeFigures,
  type SummaryChild,
} from "./ciScopeProof.ts";
import { endpointProofReadOf } from "./ciScopeComparisonEndpoint.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

export type ComparisonTimingPrecision = "precise" | "whole-second";

export type ScopeEndpointTiming =
  | { readonly kind: "checking" }
  | { readonly kind: "status"; readonly text: string }
  | { readonly kind: "no-breakdown" }
  | { readonly kind: "absent" }
  | CiTiming;

const noFileBreakdown = "no file breakdown";

// A scope inside ENTRY at one endpoint: no breakdown, absent without a CI
// result, else its classified timing.
function scopeEndpointFiguresTimingOf(
  entry: CiProofEntry,
  figures: CiScopeFigures,
): ScopeEndpointTiming {
  if (!hasFileBreakdown(entry)) return { kind: "no-breakdown" };
  if (figures.files === 0) return { kind: "absent" };
  return scopeTimingOf(entry, figures);
}

// One path's timing inside one endpoint proof. ENTRY scope (path equals the
// owning entry) uses the entry totals even without a file breakdown; folder
// and file scopes need the breakdown. LOOKUP is the path read in that
// summary (a rename's old path at baseline).
export function scopeEndpointTimingOf(
  proof: ComparisonEndpointProof,
  lookup: string,
): ScopeEndpointTiming {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, lookup);
  if (entry === undefined) return { kind: "absent" };
  if (lookup === entry.path) return entryTimingOf(entry);
  return scopeEndpointFiguresTimingOf(entry, scopeFiguresOf(entry, lookup));
}

export function outsideTimingOf(
  proof: ComparisonEndpointProof,
  path: string,
  children: readonly SummaryChild[],
): ScopeEndpointTiming {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, path);
  if (entry === undefined) return { kind: "absent" };
  if (!hasFileBreakdown(entry)) return { kind: "no-breakdown" };
  const outside = outsideOf(entry, path, children);
  if (outside === undefined) return { kind: "absent" };
  return scopeEndpointFiguresTimingOf(entry, outside.figures);
}

function timingWords(precision: ComparisonTimingPrecision): {
  readonly value: (ms: number) => string;
  readonly difference: (ms: number) => string;
} {
  return precision === "precise"
    ? {
        value: executionTimeWords,
        difference: executionTimeDifferenceWords,
      }
    : {
        value: wholeSecondWords,
        difference: wholeSecondDifferenceWords,
      };
}

export function baselineCellOf(
  timing: ScopeEndpointTiming,
  presentLater: boolean,
  precision: ComparisonTimingPrecision,
): TimingCell {
  if (timing.kind === "checking") return { text: "…" };
  if (timing.kind === "status") return { text: timing.text };
  if (timing.kind === "no-breakdown") return { text: noFileBreakdown };
  if (timing.kind === "absent") return { text: presentLater ? "added" : "—" };
  return timingCellOf(timing, timingWords(precision).value);
}

export function afterCellOf(
  timing: ScopeEndpointTiming,
  baselineMs: number | undefined,
  presentInBaseline: boolean,
  precision: ComparisonTimingPrecision,
  changeKind?: ChangeKind,
): TimingCell {
  const words = timingWords(precision);
  if (timing.kind === "checking") return { text: "…" };
  if (timing.kind === "status") return { text: timing.text };
  if (timing.kind === "no-breakdown") return { text: noFileBreakdown };
  if (timing.kind === "absent") {
    return {
      text: changeKind === "deleted" || presentInBaseline ? "removed" : "added",
    };
  }
  if (timing.kind !== "measured" || baselineMs === undefined)
    return timingCellOf(timing, words.value);
  // before → after (Δ[, %]) keeps the baseline column's own value and makes
  // the difference readable as separate text, with a percentage only when the
  // baseline is a measured non-zero duration.
  return {
    text: durationChangeWords(
      baselineMs,
      timing.ms,
      words.value,
      words.difference,
    ),
    ms: timing.ms,
  };
}
