// The comparison's endpoint labels shared by Summary and file Proof.
import { CircleDashed, GitCommitHorizontal, Hourglass } from "lucide-react";
import { EvidenceLabels, type EvidenceLabel } from "./CiEvidenceLabels.tsx";
import type { ScopeComparisonEvidence } from "./IntentScopeEvidence.tsx";
import { SelectedBuildIdentity } from "./IntentCiComparisonEndpoints.tsx";
import type { StoryCiComparisonSlot } from "./storyCiComparison.ts";
import type { ComparisonEndpointName } from "./storyCiComparisonEntries.ts";
import { slotShortWords } from "./storyCiComparisonSlotWords.ts";

// An endpoint as a label: "Baseline abc1234", "Landed Skipped def5678" or
// "Landed Not landed yet", its full status or explanation heard after it --
// the status words Intent's homepage comparison identity uses.
function endpointLabel(
  endpoint: ComparisonEndpointName | "Provisional" | "Selection",
  slot: StoryCiComparisonSlot,
  showRun = false,
): EvidenceLabel {
  const { status, revision, full } = slotShortWords(slot);
  return {
    key: endpoint,
    icon: revision === undefined ? CircleDashed : GitCommitHorizontal,
    words: (
      <>
        {endpoint}
        {status === undefined ? "" : ` ${status}`}
        {revision === undefined ? "" : " "}
        {revision !== undefined &&
          (showRun && (slot.kind === "build" || slot.kind === "running") ? (
            <SelectedBuildIdentity slot={slot} />
          ) : (
            <code>{revision}</code>
          ))}
      </>
    ),
    ...(full === undefined ? {} : { full }),
  };
}

const provisionalLabel: EvidenceLabel = {
  key: "provisional",
  icon: Hourglass,
  words: "Provisional",
  full: "The story is still Taken: its latest build, not a final result",
};

// A selected story's comparison identity as labels: Baseline, Branch and
// Landed, plus the provisional mark or distinct Trunk Mode endpoint while
// Taken. The shared comparison frame supplies observed-build framing.
export function ComparisonNamed({
  evidence,
}: {
  readonly evidence: ScopeComparisonEvidence;
}) {
  const { answer, story } = evidence;
  return (
    <EvidenceLabels
      label={`CI timing comparison of ${story}`}
      labels={
        answer.kind === "selection"
          ? [
              endpointLabel("Baseline", answer.baseline, true),
              endpointLabel("Selection", answer.selection, true),
            ]
          : [
              ...(answer.phase === "taken" && answer.provisional === undefined
                ? [provisionalLabel]
                : []),
              endpointLabel("Baseline", answer.baseline),
              endpointLabel("Branch", answer.branch),
              ...(answer.provisional === undefined
                ? []
                : [endpointLabel("Provisional", answer.provisional)]),
              endpointLabel("Landed", answer.landed),
            ]
      }
    />
  );
}
