// CI timing comparison in the selected story's CI comparison tab
// (`./IntentCiStatus.tsx`): the active comparison's title (Baseline with
// Landed when Landed has proof, otherwise Branch or Provisional), framed as
// observed builds, beside the relative scale's directions and **Show %**
// (`./IntentCiTimeChange.tsx`); then its summary
// (`./IntentCiComparisonSummary.tsx`), each endpoint's build identity and
// measured wall time and time without runner waits
// (`./IntentCiComparisonEndpoints.tsx`), and each CI entry's timing
// comparison (`./IntentCiEntryComparison.tsx`). Every relative change, in the
// summary and the entry cells, shares one scale (`./storyCiRelativeChange.ts`);
// **Show %** is off until chosen, kept with the story's reading place, and
// changes labels only.
// Taken answers label the live tip provisional and say Landed has not landed
// yet; Taken Trunk Mode also names the provisional trunk tip beside Branch
// N/A. A done comparison ends with the judged branch's Check again
// (`./IntentCiJudgedBranch.tsx`), disabled while it is read, whatever it
// shows: the comparison, an unavailable answer, or a failed read.

import type { ReactNode } from "react";
import { useCiProofSorting } from "./CiProofTable.tsx";
import { CheckAgain } from "./IntentCiJudgedBranch.tsx";
import { useIntentCiEvidence, type CiEvidence } from "./IntentCiEvidence.tsx";
import { ciTimingHeading } from "./IntentCiComparisonFrameView.tsx";
import { useCiComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import { IntentCiComparisonContent } from "./IntentCiComparisonContent.tsx";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import type { ComparisonEndpointProofs } from "./storyCiComparisonEntries.ts";
import "./intent-ci-cues.css";

function endpointProofsOf(
  evidence: CiEvidence,
): ComparisonEndpointProofs | undefined {
  return evidence.kind === "comparison" || evidence.kind === "judged"
    ? evidence.endpointProofs
    : undefined;
}

function ComparisonShown(
  props: Omit<
    Parameters<typeof IntentCiComparisonContent>[0],
    "preference" | "sorting"
  >,
) {
  return (
    <IntentCiComparisonContent
      {...props}
      preference={useCiComparisonPreference()}
      sorting={useCiProofSorting()}
    />
  );
}

function ComparisonGap({
  children,
  checkAgainButton,
}: {
  readonly children: ReactNode;
  readonly checkAgainButton: ReactNode;
}) {
  return (
    <section className="intent-ci-status" aria-label="CI timing comparison">
      <h3>{ciTimingHeading}</h3>
      {children}
      {checkAgainButton}
    </section>
  );
}

export function IntentCiComparison({
  reading,
  checkAgain,
}: {
  readonly reading: ComparisonReading;
  // Offered for a done comparison only.
  readonly checkAgain?: () => void;
}) {
  const proofs = endpointProofsOf(useIntentCiEvidence());
  const checkAgainButton = checkAgain !== undefined && (
    <CheckAgain reading={reading.reading} checkAgain={checkAgain} />
  );
  if (reading.reading && reading.shown === undefined) {
    return (
      <ComparisonGap checkAgainButton={checkAgainButton}>
        <p className="intent-ci-reading" role="status">
          Reading CI comparison…
        </p>
      </ComparisonGap>
    );
  }
  if (reading.failed !== undefined && reading.shown === undefined) {
    return (
      <ComparisonGap checkAgainButton={checkAgainButton}>
        <p className="intent-ci-gap">{reading.failed}</p>
      </ComparisonGap>
    );
  }
  const answer = reading.shown;
  if (answer === undefined) return null;
  if (answer.kind === "unavailable") {
    return (
      <ComparisonGap checkAgainButton={checkAgainButton}>
        <p className="intent-ci-gap">{answer.explanation}</p>
      </ComparisonGap>
    );
  }
  return (
    <ComparisonShown
      answer={answer}
      proofs={proofs}
      checkAgainButton={checkAgainButton}
    />
  );
}
