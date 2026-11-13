// Precise scope metrics and unit-specific membership reuse the common rule's
// evidence. The original history list keeps every observed reading and gap.
import {
  scopeHistoryEndpointWords,
  scopeHistorySelectionWords,
  scopeHistoryReason,
  type ScopeHistoryContext,
} from "./intentScopeHistoryContext.ts";
import type { CiScopeHistory } from "./ciScopeHistory.ts";
import { shortSha } from "./baseCiWording.ts";
import { IntentCiPriorBuildReference } from "./IntentCiPriorBuildReference.tsx";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
import { scopeHistoryProvenance } from "./IntentScopeTimingHistoryEvidence.tsx";
import { PriorBuildReferenceEvidenceList } from "./PriorBuildReferenceEvidenceList.tsx";

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
  if (comparison === undefined) {
    return null;
  }
  return (
    <>
      <IntentCiPriorBuildReference
        reference={comparison.reference}
        precise
        endpointLabel={scopeHistoryEndpointWords(context)}
        reasonWords={(reason) => scopeHistoryReason(context, reason)}
        unavailableReason={comparison.reason}
      />
      <PriorBuildReferenceEvidenceList
        evidence={comparison.reference.evidence}
        medianMs={comparison.reference.medianMs}
        selectedLabel={scopeHistorySelectionWords(context)}
        reasonWords={(reason) => scopeHistoryReason(context, reason)}
        precise
        details={(sample) => {
          const entry = entries.find((entry) => entry.key === sample.key);
          const run = entry?.build ?? entry?.run;
          return (
            <>
              {entry === undefined ? "" : ` · ${scopeHistoryProvenance(entry)}`}
              {entry?.build !== undefined && (
                <>
                  {" "}
                  <code>{shortSha(entry.build.revision)}</code>
                </>
              )}
              {run !== undefined && <HistoryRunAttempt run={run} />}
            </>
          );
        }}
      />
    </>
  );
}
