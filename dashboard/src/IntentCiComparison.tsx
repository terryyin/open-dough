// A selected story's CI timing comparison on Intent's homepage
// (`./IntentCiStatus.tsx`): names the active comparison (Baseline with
// Landed when Landed has proof, otherwise Branch or Provisional), shows an
// overall count and CI wall-time summary with readable before → after (Δ)
// text, then each endpoint's build identity and wall time
// (`./IntentCiComparisonEndpoints.tsx`), then one row per CI entry in the
// homepage proof table (`./CiProofTable.tsx`) with each endpoint's cumulative
// test execution time. Taken answers label the live tip provisional and say
// Landed has not landed yet; Taken Trunk Mode also names the provisional
// trunk tip beside Branch N/A.

import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import { ComparisonEndpointsTable } from "./IntentCiComparisonEndpoints.tsx";
import { useIntentCiEvidence, type CiEvidence } from "./IntentCiEvidence.tsx";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import {
  comparisonEntriesFromProofs,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";
import {
  activeComparisonOf,
  observedNotAttributed,
  overallCountsWords,
  wallTimeChangeWords,
} from "./storyCiComparisonWording.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

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
  const overallTiming = wallTimeChangeWords(answer.baseline, active.slot);
  return (
    <div className="intent-ci-comparison-summary">
      <p className="intent-ci-comparison-active">{active.title}</p>
      {active.landedUnusedReason !== undefined && (
        <p className="intent-ci-comparison-active-reason">
          Landed is not used: {active.landedUnusedReason}
        </p>
      )}
      <p className="intent-ci-comparison-overall-counts">{overallCounts}</p>
      {overallTiming !== undefined && (
        <p className="intent-ci-comparison-overall-timing">{overallTiming}</p>
      )}
    </div>
  );
}

function EntryComparison() {
  const proofs = endpointProofsOf(useIntentCiEvidence());
  if (proofs === undefined) {
    return (
      <p className="intent-ci-reading" role="status">
        Reading entry comparison…
      </p>
    );
  }
  const entries = comparisonEntriesFromProofs(proofs);
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
}: {
  readonly story: string;
  readonly reading: ComparisonReading;
}) {
  const proofs = endpointProofsOf(useIntentCiEvidence());
  if (reading.reading && reading.shown === undefined) {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-reading" role="status">
          Reading CI comparison…
        </p>
      </section>
    );
  }
  if (reading.failed !== undefined && reading.shown === undefined) {
    return (
      <section className="intent-ci-status" aria-label="CI timing comparison">
        <h3>CI timing changes for {story}</h3>
        <p className="intent-ci-gap">{reading.failed}</p>
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
      </section>
    );
  }
  return (
    <section className="intent-ci-status" aria-label="CI timing comparison">
      <h3>CI timing changes for {story}</h3>
      <p className="intent-ci-comparison-framing">({observedNotAttributed})</p>
      <ComparisonBody answer={answer} proofs={proofs} />
      <EntryComparison />
    </section>
  );
}
