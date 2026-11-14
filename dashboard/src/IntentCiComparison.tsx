// CI timing comparison in the selected story's CI comparison tab
// (`./IntentCiStatus.tsx`): the active comparison's title (Baseline with
// Landed when Landed has proof, otherwise Branch or Provisional), framed as
// observed builds, beside the relative scale's directions and **Show %**
// (`./IntentCiTimeChange.tsx`); then its summary
// (`./IntentCiComparisonSummary.tsx`), each endpoint's build identity and
// measured wall time and time without runner waits
// (`./IntentCiComparisonEndpoints.tsx`), and each CI entry's timing
// comparison (`./IntentCiEntryComparison.tsx`); a Done comparison's CI wall
// time history sits between the endpoints and the entry table
// (`./IntentCiDoneWallTimeReference.tsx`), after the gap when no comparison
// is shown. Every relative change, in the
// summary and the entry cells, shares one scale (`./storyCiRelativeChange.ts`);
// **Show %** is off until chosen, kept with the story's reading place, and
// changes labels only.
// Taken answers label the live tip provisional and say Landed has not landed
// yet; Taken Trunk Mode also names the provisional trunk tip beside Branch
// N/A. A done comparison ends with the judged branch's Check again
// (`./IntentCiJudgedBranch.tsx`), disabled while it is read, whatever it
// shows: the comparison, an unavailable answer, or a failed read.

import {
  IntentCiDoneWallTimeReference,
  useDoneWallTimeReading,
  type DoneWallTimeReading,
} from "./IntentCiDoneWallTimeReference.tsx";
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
    "preference" | "sorting" | "labelled"
  >,
) {
  return (
    <IntentCiComparisonContent
      {...props}
      labelled={false}
      preference={useCiComparisonPreference()}
      sorting={useCiProofSorting()}
    />
  );
}

function ComparisonGap({
  children,
  history,
  checkAgainButton,
}: {
  readonly children: ReactNode;
  readonly history: ReactNode;
  readonly checkAgainButton: ReactNode;
}) {
  return (
    <section className="intent-ci-status">
      <h3>{ciTimingHeading}</h3>
      {children}
      {history}
      {checkAgainButton}
    </section>
  );
}

type IntentCiComparisonProps = {
  readonly reading: ComparisonReading;
  // Offered for a done comparison only.
  readonly checkAgain?: () => void;
};

function CiComparisonContents({
  reading,
  checkAgain,
  done,
}: IntentCiComparisonProps & { readonly done: DoneWallTimeReading }) {
  const proofs = endpointProofsOf(useIntentCiEvidence());
  const checkAgainButton = checkAgain !== undefined && (
    <CheckAgain reading={reading.reading} checkAgain={checkAgain} />
  );
  const history = <IntentCiDoneWallTimeReference reading={done} />;
  if (reading.reading && reading.shown === undefined) {
    return (
      <ComparisonGap history={history} checkAgainButton={checkAgainButton}>
        <p className="intent-ci-reading" role="status">
          Reading CI comparison…
        </p>
      </ComparisonGap>
    );
  }
  if (reading.failed !== undefined && reading.shown === undefined) {
    return (
      <ComparisonGap history={history} checkAgainButton={checkAgainButton}>
        <p className="intent-ci-gap">{reading.failed}</p>
      </ComparisonGap>
    );
  }
  const answer = reading.shown;
  if (answer === undefined) return history;
  if (answer.kind === "unavailable") {
    return (
      <ComparisonGap history={history} checkAgainButton={checkAgainButton}>
        <p className="intent-ci-gap">{answer.explanation}</p>
      </ComparisonGap>
    );
  }
  return (
    <ComparisonShown
      answer={answer}
      proofs={proofs}
      history={history}
      checkAgainButton={checkAgainButton}
    />
  );
}

// One stable local history owner across reading, failed, unavailable and shown
// CI states; only where its view renders changes between them. Those states
// keep their own existing refresh lifecycle.
export function IntentCiComparison(props: IntentCiComparisonProps) {
  const done = useDoneWallTimeReading();
  return (
    <section aria-label="CI timing comparison">
      <CiComparisonContents {...props} done={done} />
    </section>
  );
}
