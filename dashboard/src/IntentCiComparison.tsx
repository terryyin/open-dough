// A selected story's CI timing comparison on Intent's homepage
// (`./IntentCiStatus.tsx`): names the baseline, branch and landed builds with
// each selection rule and a run link where available (as CI judgment/proof
// do), shows CI wall time with signed whole-second differences, then one row
// per CI entry in the homepage proof table (`./CiProofTable.tsx`) with each
// endpoint's cumulative test execution time. Taken answers label the live tip
// provisional and say Landed has not landed yet; Taken Trunk Mode also names
// the provisional trunk tip beside Branch N/A.

import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import { EndpointRow } from "./IntentCiComparisonEndpoint.tsx";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import { comparisonEntriesFromProofs } from "./useIntentCiComparisonEntries.ts";
import { observedNotAttributed } from "./storyCiComparisonWording.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

function EntryComparison() {
  const evidence = useIntentCiEvidence();
  const proofs =
    evidence.kind === "comparison" || evidence.kind === "judged"
      ? evidence.endpointProofs
      : undefined;
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
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
}) {
  const taken = answer.phase === "taken";
  const branchProvisional = taken && answer.mode === "story-branch";
  return (
    <table className="intent-ci-comparison">
      <caption className="visually-hidden">
        Baseline, branch and landed CI builds with wall times
      </caption>
      <thead>
        <tr>
          <th scope="col">Endpoint</th>
          <th scope="col">Build</th>
          <th scope="col">CI wall time</th>
        </tr>
      </thead>
      <tbody>
        <EndpointRow
          label="Baseline"
          slot={answer.baseline}
          baseline={answer.baseline}
          provisional={false}
        />
        <EndpointRow
          label="Branch"
          slot={answer.branch}
          baseline={answer.baseline}
          provisional={branchProvisional}
        />
        {answer.provisional !== undefined && (
          <EndpointRow
            label="Provisional"
            slot={answer.provisional}
            baseline={answer.baseline}
            provisional={true}
          />
        )}
        <EndpointRow
          label="Landed"
          slot={answer.landed}
          baseline={answer.baseline}
          provisional={false}
        />
      </tbody>
    </table>
  );
}

export function IntentCiComparison({
  story,
  reading,
}: {
  readonly story: string;
  readonly reading: ComparisonReading;
}) {
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
      <ComparisonBody answer={answer} />
      <EntryComparison />
    </section>
  );
}
