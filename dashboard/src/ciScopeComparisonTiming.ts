// Timing of one scope path inside one comparison endpoint proof
// (`./ciScopeComparison.ts`): classify measured / partial / absent /
// no-breakdown / unavailable from `./ciScopeProof.ts` figures, and word
// baseline and after cells for precise or whole-second Summary and homepage
// wording (`./ciProofTimeWords.ts`).

import type { CiProofEntry } from "./ciProof.ts";
import {
  executionTimeDifferenceWords,
  executionTimeWords,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "./ciProofTimeWords.ts";
import {
  entryTimingOf,
  hasFileBreakdown,
  partsWithoutBreakdown,
} from "./ciProofWording.ts";
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
  | { readonly kind: "explained"; readonly text: string }
  | { readonly kind: "measured"; readonly ms: number };

const noFileBreakdown = "no file breakdown";

function joinedAnd(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1) ?? ""}`;
}

function partPhrase(
  part: { readonly part: number; readonly status: string },
  of: number,
  status: string,
): string {
  return `part ${String(part.part)} of ${String(of)} ${status}`;
}

function unitCount(entry: CiProofEntry, count: number): string {
  const unit = entry.unit ?? "results";
  return `${String(count)} ${count === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit}`;
}

export function scopeTimingOf(
  entry: CiProofEntry,
  figures: CiScopeFigures,
): ScopeEndpointTiming {
  if (!hasFileBreakdown(entry)) return { kind: "no-breakdown" };
  if (figures.files === 0) return { kind: "absent" };
  const of = entry.parts.length;
  const named = [
    ...entry.parts
      .filter((part) => part.status !== "present")
      .map((part) => partPhrase(part, of, part.status)),
    ...partsWithoutBreakdown(entry).map((part) =>
      partPhrase(part, of, "has no file breakdown"),
    ),
    ...((figures.untimed ?? 0) > 0
      ? [`${unitCount(entry, figures.untimed ?? 0)} without a duration`]
      : []),
  ];
  if (figures.durationMs === undefined) {
    if (named.length === 0) return { kind: "explained", text: "not recorded" };
    return {
      kind: "explained",
      text:
        (figures.untimed ?? 0) > 0 && named.length === 1
          ? `not recorded: ${named.join("")}`
          : `partial: ${joinedAnd(named)}`,
    };
  }
  if (named.length > 0)
    return { kind: "explained", text: `partial: ${joinedAnd(named)}` };
  return { kind: "measured", ms: figures.durationMs };
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
  if (lookup === entry.path) {
    const timing = entryTimingOf(entry);
    return timing.kind === "complete"
      ? { kind: "measured", ms: timing.ms }
      : { kind: "explained", text: timing.text };
  }
  return scopeTimingOf(entry, scopeFiguresOf(entry, lookup));
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
  return scopeTimingOf(entry, outside.figures);
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

export function baselineCellText(
  timing: ScopeEndpointTiming,
  presentLater: boolean,
  precision: ComparisonTimingPrecision,
): string {
  const words = timingWords(precision);
  if (timing.kind === "checking") return "…";
  if (timing.kind === "status") return timing.text;
  if (timing.kind === "no-breakdown") return noFileBreakdown;
  if (timing.kind === "absent") return presentLater ? "added" : "—";
  if (timing.kind === "explained") return timing.text;
  return words.value(timing.ms);
}

export function afterCellText(
  timing: ScopeEndpointTiming,
  baselineMs: number | undefined,
  presentInBaseline: boolean,
  precision: ComparisonTimingPrecision,
  changeKind?: ChangeKind,
): string {
  const words = timingWords(precision);
  if (timing.kind === "checking") return "…";
  if (timing.kind === "status") return timing.text;
  if (timing.kind === "no-breakdown") return noFileBreakdown;
  if (timing.kind === "absent") {
    if (changeKind === "deleted" || presentInBaseline) return "removed";
    return "added";
  }
  if (timing.kind === "explained") return timing.text;
  const value = words.value(timing.ms);
  if (baselineMs === undefined) return value;
  return `${value} ${words.difference(timing.ms - baselineMs)}`;
}
