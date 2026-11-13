// One unit's compact prior-build readout (`./IntentCiPriorBuildReference.tsx`)
// in scope words, with precise execution times, saying when an equivalent or
// later trunk build supplies the endpoint's measurement.
import { standInBuildWords } from "./ciHistoryWords.ts";
import type { ScopeHistoryGlance } from "./ciScopeHistory.ts";
import { IntentCiPriorBuildReference } from "./IntentCiPriorBuildReference.tsx";
import {
  scopeHistoryEndpointWords,
  scopeHistoryReason,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";

// How the endpoint's measurement stands for it, when another build supplies it.
function standInWords(entries: ScopeHistoryGlance["entries"]) {
  for (const entry of entries) {
    const provenance = entry.landings.find((each) => each.selected)?.provenance;
    if (provenance !== undefined && provenance !== "exact")
      return standInBuildWords[provenance];
  }
  return undefined;
}

export function IntentScopePriorBuildReference({
  comparison,
  entries,
  context,
}: {
  readonly comparison:
    NonNullable<ScopeHistoryGlance["references"]>[number] | undefined;
  readonly entries: ScopeHistoryGlance["entries"];
  readonly context: ScopeHistoryContext;
}) {
  if (comparison === undefined) return null;
  return (
    <IntentCiPriorBuildReference
      reference={comparison.reference}
      precise
      endpointLabel={scopeHistoryEndpointWords(context)}
      selectedNote={standInWords(entries)}
      reasonWords={(reason) => scopeHistoryReason(context, reason)}
      unavailableReason={comparison.reason}
    />
  );
}
