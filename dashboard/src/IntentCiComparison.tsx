// A selected story's CI timing comparison on Intent's homepage
// (`./IntentCiStatus.tsx`): names the active comparison (Baseline with
// Landed when Landed has proof, otherwise Branch or Provisional), shows an
// overall count and CI time without runner waits as before → after (Δ) with
// CI wall time as context, then each endpoint's build identity, wall time,
// and time without runner waits (`./IntentCiComparisonEndpoints.tsx`), then
// one row per CI entry in the homepage proof table (`./CiProofTable.tsx`)
// with each endpoint's cumulative test execution time. Taken answers label
// the live tip provisional and say Landed has not landed yet; Taken Trunk
// Mode also names the provisional trunk tip beside Branch N/A. A done
// comparison ends with the judged branch's Check again
// (`./IntentCiJudgedBranch.tsx`), disabled while it is read, whatever it
// shows: the comparison, an unavailable answer, or a failed read.

import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import {
  countCueElementAttrs,
  durationCueElementAttrs,
} from "./ciScopeComparisonCuePresentation.ts";
import { ComparisonEndpointsTable } from "./IntentCiComparisonEndpoints.tsx";
import { CheckAgain } from "./IntentCiJudgedBranch.tsx";
import { useIntentCiEvidence, type CiEvidence } from "./IntentCiEvidence.tsx";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import {
  activeComparisonAfterSideOf,
  comparisonEntriesFromProofs,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";
import {
  activeComparisonOf,
  observedNotAttributed,
  overallTimingCue,
  timeWithoutRunnerWaitsChangeWords,
  wallTimeChangeWords,
} from "./storyCiComparisonWording.ts";
import {
  overallCountsCue,
  overallCountsWords,
} from "./storyCiComparisonCountsWords.ts";
import type { ComparisonAfterSide } from "./ciScopeComparisonCues.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import "./intent-ci-cues.css";

function endpointProofsOf(
  evidence: CiEvidence,
): ComparisonEndpointProofs | undefined {
  return evidence.kind === "comparison" || evidence.kind === "judged"
    ? evidence.endpointProofs
    : undefined;
}

function ActiveComparisonSummary({
  answer,
  proofs,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly proofs: ComparisonEndpointProofs;
}) {
  const active = activeComparisonOf(answer, proofs);
  const overallCounts = overallCountsWords(proofs.baseline, active.proof);
  const overallTiming = timeWithoutRunnerWaitsChangeWords(
    answer.baseline,
    active.slot,
  );
  const wallContext = wallTimeChangeWords(answer.baseline, active.slot);
  const countsCue = overallCountsCue(proofs.baseline, active.proof);
  const timingCue = overallTimingCue(answer.baseline, active.slot);
  return (
    <div className="intent-ci-comparison-summary">
      <p className="intent-ci-comparison-active">{active.title}</p>
      {active.landedUnusedReason !== undefined && (
        <p className="intent-ci-comparison-active-reason">
          Landed is not used: {active.landedUnusedReason}
        </p>
      )}
      <p
        {...countCueElementAttrs(
          countsCue,
          "intent-ci-comparison-overall-counts",
        )}
      >
        {overallCounts}
      </p>
      {overallTiming !== undefined && (
        <p
          {...durationCueElementAttrs(
            timingCue,
            "intent-ci-comparison-overall-timing",
          )}
        >
          {overallTiming}
        </p>
      )}
      {wallContext !== undefined && (
        <p className="intent-ci-comparison-overall-wall">
          CI wall time {wallContext}
        </p>
      )}
    </div>
  );
}

function EntryComparison({
  proofs,
  afterSide,
}: {
  readonly proofs: ComparisonEndpointProofs;
  readonly afterSide: ComparisonAfterSide;
}) {
  const entries = comparisonEntriesFromProofs(proofs, afterSide);
  if (entries.kind === "checking") {
    return (
      <p className="intent-ci-reading" role="status">
        Reading entry comparison…
      </p>
    );
  }
  if (entries.kind === "empty") {
    return (
      <p className="intent-ci-comparison-entries">{entries.explanation}</p>
    );
  }
  return (
    <CiProofTable
      label="CI entry timing comparison"
      scopeHeader="Entry"
      rows={entries.rows.map((row) => ({
        key: row.path,
        scope: <ScopePath path={row.path} />,
        cells: row.cells,
      }))}
    />
  );
}

function ComparisonBody({
  answer,
  proofs,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly proofs: ComparisonEndpointProofs | undefined;
}) {
  const taken = answer.phase === "taken";
  const branchProvisional = taken && answer.mode === "story-branch";
  return (
    <>
      {proofs !== undefined && (
        <ActiveComparisonSummary answer={answer} proofs={proofs} />
      )}
      <ComparisonEndpointsTable
        baseline={answer.baseline}
        branch={answer.branch}
        provisional={answer.provisional}
        landed={answer.landed}
        branchProvisional={branchProvisional}
      />
    </>
  );
}

export function IntentCiComparison({
  story,
  reading,
  checkAgain,
}: {
  readonly story: string;
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
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-reading" role="status">
          Reading CI comparison…
        </p>
        {checkAgainButton}
      </section>
    );
  }
  if (reading.failed !== undefined && reading.shown === undefined) {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{reading.failed}</p>
        {checkAgainButton}
      </section>
    );
  }
  const answer = reading.shown;
  if (answer === undefined) return null;
  if (answer.kind === "unavailable") {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{answer.explanation}</p>
        {checkAgainButton}
      </section>
    );
  }
  const afterSide =
    proofs === undefined
      ? "landed"
      : activeComparisonAfterSideOf(answer, proofs);
  return (
    <section className="intent-ci-status" aria-label="CI timing comparison">
      <h3>CI timing changes for {story}</h3>
      <p className="intent-ci-comparison-framing">({observedNotAttributed})</p>
      <ComparisonBody answer={answer} proofs={proofs} />
      {proofs !== undefined && (
        <EntryComparison proofs={proofs} afterSide={afterSide} />
      )}
      {proofs === undefined && (
        <p className="intent-ci-reading" role="status">
          Reading entry comparison…
        </p>
      )}
      {checkAgainButton}
    </section>
  );
}
