// Endpoint meaning travels with the shared scope history, readout and chart.
// A measured CI ancestor never replaces the project's observed trunk head.
import { doneWallTimeAvailabilityWords } from "./ciDoneWallTimeHistory.ts";
import type {
  ScopeHistoryGlance,
  ScopeHistoryEndpoint,
} from "./ciScopeHistory.ts";
import type { CiEvidence } from "./IntentCiEvidence.tsx";
import type { PublishedSource } from "./publishedSource.ts";

export type ScopeHistoryContext = {
  readonly source: PublishedSource;
  readonly endpoint: ScopeHistoryEndpoint | undefined;
  readonly reason: string | undefined;
} & (
  | { readonly kind: "done" }
  | {
      readonly kind: "project";
      readonly branch: string;
      readonly checkedAgain: string | undefined;
    }
);

export function scopeHistoryContextOf(
  evidence: CiEvidence,
): ScopeHistoryContext | undefined {
  if (
    evidence.kind === "retained" ||
    (evidence.kind === "comparison" && evidence.phase === "done")
  )
    return {
      kind: "done",
      source: evidence.source,
      endpoint: evidence.doneEndpoint,
      reason: evidence.doneEndpointReason,
    };
  if (evidence.kind === "judged" && evidence.story === undefined)
    return {
      kind: "project",
      source: evidence.source,
      branch: evidence.branch,
      endpoint: evidence.projectEndpoint,
      reason: "Reading the configured trunk’s published revision…",
      checkedAgain: evidence.judged.round,
    };
  return undefined;
}

export const scopeHistoryEndpointWords = (context: ScopeHistoryContext) =>
  context.kind === "done" ? "Selected landing" : "Observed trunk endpoint";

export const scopeHistorySelectionWords = (context: ScopeHistoryContext) =>
  context.kind === "done" ? "Selected" : "Endpoint";

export const scopeHistoryReason = (
  context: ScopeHistoryContext,
  reason: string,
) =>
  context.kind === "done"
    ? reason
    : reason.replace(/^Selected landing/, "Observed trunk endpoint");

// The history's brief status at the endpoint, as the Done wall time history
// words it, when it is not simply retained there.
export const scopeHistoryAvailabilityWords = (
  context: ScopeHistoryContext,
  availability: ScopeHistoryGlance["availability"],
) => {
  const words = doneWallTimeAvailabilityWords(availability);
  return words === undefined ? undefined : scopeHistoryReason(context, words);
};
