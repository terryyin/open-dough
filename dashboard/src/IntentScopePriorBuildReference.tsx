// One unit's compact prior-build readout (`./IntentCiPriorBuildReference.tsx`)
// in scope words, with precise execution times, saying when an equivalent or
// later trunk build supplies the endpoint's measurement.
import { standInBuildWords } from "./ciHistoryWords.ts";
import type { CiScopeHistory } from "./ciScopeHistory.ts";
import { IntentCiPriorBuildReference } from "./IntentCiPriorBuildReference.tsx";
import {
  scopeHistoryEndpointWords,
  scopeHistoryReason,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";

// How the endpoint's measurement stands for it, when another build supplies it.
function standInWords(entries: CiScopeHistory["entries"]) {
  for (const entry of entries) {
    const landing = entry.landings.find((each) => each.selected);
    const provenance = landing?.provenance ?? entry.build?.provenance;
    if (
      landing !== undefined &&
      provenance !== undefined &&
      provenance !== "exact"
    )
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
    NonNullable<CiScopeHistory["references"]>[number] | undefined;
  readonly entries: CiScopeHistory["entries"];
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
