import type { SelectedComparisonEndpointProofs } from "./ciComparisonProofs.ts";
import { scopeComparisonRowsOf } from "./ciScopeComparison.ts";
import type { ComparisonAfterSide } from "./ciScopeComparisonCues.ts";
import type { ScopeComparisonEvidence } from "./IntentScopeEvidence.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import { selectionScopeComparisonRowsOf } from "./selectionScopeComparison.ts";
import type { ComparisonEndpointProofs } from "./storyCiComparisonEntries.ts";
import { activeComparisonAfterSideOf } from "./useIntentCiComparisonEntries.ts";

export type ScopeComparisonReading =
  | {
      readonly kind: "selection";
      readonly proofs: SelectedComparisonEndpointProofs;
    }
  | {
      readonly kind: "comparison";
      readonly afterSide: ComparisonAfterSide;
      readonly proofs: ComparisonEndpointProofs;
    };

export function scopeComparisonReadingOf(
  evidence: ScopeComparisonEvidence,
): ScopeComparisonReading {
  return evidence.kind === "selection"
    ? { kind: "selection", proofs: evidence.proofs }
    : {
        kind: "comparison",
        afterSide: activeComparisonAfterSideOf(
          evidence.answer,
          evidence.proofs,
        ),
        proofs: evidence.proofs,
      };
}

// Changes, Summary and file Proof read the same units at a scope's paths.
export function scopeComparisonRowsFor(
  reading: ScopeComparisonReading,
  path: string,
  file?: IntentTreeFile,
) {
  const baselinePath = baselinePathOf(file, path);
  if (reading.kind === "selection") {
    return selectionScopeComparisonRowsOf(
      path,
      reading.proofs,
      baselinePath,
      file?.kind,
    );
  }
  const { baseline, branch, landed } = reading.proofs;
  return scopeComparisonRowsOf(
    path,
    baseline,
    branch,
    landed,
    "precise",
    baselinePath,
    file?.kind,
    reading.afterSide,
  );
}
