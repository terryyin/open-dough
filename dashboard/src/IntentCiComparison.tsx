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
import { ComparisonEndpointsTable } from "./IntentCiComparisonEndpoints.tsx";
import {
  ActiveComparisonSummary,
  overallTimeChangesOf,
  type OverallTimeChanges,
} from "./IntentCiComparisonSummary.tsx";
import { EntryComparison } from "./IntentCiEntryComparison.tsx";
import { CheckAgain } from "./IntentCiJudgedBranch.tsx";
import { useIntentCiEvidence, type CiEvidence } from "./IntentCiEvidence.tsx";
import {
  RelativeTimingControls,
  RelativeTimingProvider,
} from "./IntentCiTimeChange.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import {
  activeComparisonAfterSideOf,
  comparisonEntriesFromProofs,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";
import {
  activeComparisonOf,
  observedNotAttributedInFull,
} from "./storyCiComparisonWording.ts";
import type { ComparisonEntries } from "./storyCiComparisonEntries.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import { relativeScaleOf } from "./storyCiRelativeChange.ts";
import "./intent-ci-cues.css";

function endpointProofsOf(
  evidence: CiEvidence,
): ComparisonEndpointProofs | undefined {
  return evidence.kind === "comparison" || evidence.kind === "judged"
    ? evidence.endpointProofs
    : undefined;
}

// Every relative change the comparison shows: the summary's and each entry's
// Branch and Landed.
function relativesOf(
  overall: OverallTimeChanges,
  entries: ComparisonEntries,
): (number | undefined)[] {
  const rows = entries.kind === "rows" ? entries.rows : [];
  return [
    overall.withoutWaits?.relative,
    overall.wall?.relative,
    ...rows.flatMap(({ cells }) => [
      cells.branch.relative,
      cells.landed.relative,
    ]),
  ];
}

function ComparisonShown({
  answer,
  proofs,
  checkAgainButton,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly proofs: ComparisonEndpointProofs | undefined;
  readonly checkAgainButton: ReactNode;
}) {
  const [showPercent, setShowPercent] = useKeptReading(
    "ciShowPercent",
    () => false,
  );
  const taken = answer.phase === "taken";
  const active =
    proofs === undefined ? undefined : activeComparisonOf(answer, proofs);
  const entries =
    proofs === undefined || active === undefined
      ? undefined
      : comparisonEntriesFromProofs(
          proofs,
          activeComparisonAfterSideOf(answer, proofs),
        );
  const overall =
    active === undefined ? undefined : overallTimeChangesOf(answer, active);
  const scale = relativeScaleOf(
    overall === undefined || entries === undefined
      ? []
      : relativesOf(overall, entries),
  );
  return (
    <section
      className="intent-ci-status intent-ci-story-comparison"
      aria-label="CI timing comparison"
    >
      <div className="intent-ci-comparison-head">
        <div>
          <h3 className="intent-ci-comparison-active">
            {active?.title ?? ciTimingHeading}
          </h3>
          <p className="intent-ci-comparison-framing">
            {observedNotAttributedInFull}
          </p>
        </div>
        <RelativeTimingControls
          showPercent={showPercent}
          onShowPercent={setShowPercent}
        />
      </div>
      <RelativeTimingProvider value={{ scale, showPercent }}>
        {proofs !== undefined && active !== undefined && (
          <ActiveComparisonSummary
            answer={answer}
            proofs={proofs}
            active={active}
          />
        )}
        <ComparisonEndpointsTable
          baseline={answer.baseline}
          branch={answer.branch}
          provisional={answer.provisional}
          landed={answer.landed}
          branchProvisional={taken && answer.mode === "story-branch"}
        />
        <EntryComparison entries={entries} />
      </RelativeTimingProvider>
      {checkAgainButton}
    </section>
  );
}

// The heading while no comparison is shown.
const ciTimingHeading = "CI timing changes";

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
