// The CI proof of the attempt Intent's CI status homepage shows a result of
// (`./IntentCiStatus.tsx`): its own labelled part after the judgment, read
// apart from it by Intent's one CI evidence owner (`./IntentCiEvidence.tsx`)
// once the judgment names a GitHub Actions run or a ciAdapter attempt, so the
// judgment is shown first and never changes with it. It names that attempt
// once as short labels (`./CiEvidenceLabels.tsx`) -- a run's attempt and
// link, or an adapter's attempt id, the revision, a running result's
// completed ancestor -- and its CI wall time, then a table with one row per
// declared entry, in the order the project's CI declares them until a column
// header sorts them, with columns for counts with their unit and cumulative
// test execution time, including timing gaps
// (`./CiProofTable.tsx`, `./ciProofWording.ts`); otherwise one
// line says why there is no proof to show (`./useIntentCiShownProof.ts`). An adapter attempt whose attemptId
// another discovered attempt shares at its revision is ambiguous: no proof is read for it. A
// running result's proof is its completed ancestor's, the result the homepage
// shows beside it. Proof is read again with each judgment the homepage reads,
// so Check again refreshes both.

import { useId } from "react";
import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import {
  CiProofTable,
  ScopePath,
  useCiProofSorting,
  type CiProofSorting,
} from "./CiProofTable.tsx";
import type { CiProofEntry } from "./ciProof.ts";
import {
  ancestorLabel,
  attemptLabel,
  EvidenceLabels,
  revisionLabel,
  wallTimeLabel,
} from "./CiEvidenceLabels.tsx";
import { ciProofCellsOf } from "./ciProofWording.ts";
import type { ShownCiProofRun } from "./shownCiProofRun.ts";
import { shownProofStateOf, type ShownProof } from "./useIntentCiShownProof.ts";

// Each declared entry's row, in the order the summary lists them until a
// column is sorted; a summary declaring no entry shows no table, as it showed
// no rows.
function ProofEntries({
  entries,
  sorting,
}: {
  readonly entries: readonly CiProofEntry[];
  readonly sorting: CiProofSorting;
}) {
  if (entries.length === 0) return null;
  return (
    <CiProofTable
      label="CI proof by declared entry"
      scopeHeader="Entry"
      sorting={sorting}
      rows={entries.map((entry) => ({
        key: entry.path,
        scope: <ScopePath path={entry.path} />,
        name: entry.path,
        cells: ciProofCellsOf(entry),
      }))}
    />
  );
}

function RunNamed({
  run,
  ancestor,
}: {
  readonly run: ShownCiProofRun;
  readonly ancestor: boolean;
}) {
  return (
    <EvidenceLabels
      label="CI evidence"
      labels={[
        attemptLabel(run),
        revisionLabel(run.revision),
        ...(ancestor ? [ancestorLabel] : []),
        wallTimeLabel(run),
      ]}
    />
  );
}

export function IntentCiProof({
  judgment,
  proof,
}: {
  readonly judgment: Judgment;
  readonly proof: ShownProof;
}) {
  const state = shownProofStateOf(judgment, proof);
  const heading = useId();
  // Kept while Check again reads the proof anew.
  const sorting = useCiProofSorting();
  return (
    <section className="intent-ci-proof" aria-labelledby={heading}>
      <h4 id={heading}>Proof</h4>
      {state.kind === "no attempt" ? (
        <p className="intent-ci-proof-unavailable">{state.line}</p>
      ) : (
        <>
          <RunNamed run={state.run} ancestor={judgment.state === "running"} />
          {state.kind === "summary" ? (
            <ProofEntries entries={state.summary.entries} sorting={sorting} />
          ) : state.kind === "checking" ? (
            <p aria-live="polite" className="intent-ci-proof-checking quiet">
              {state.line}
            </p>
          ) : (
            <p
              className={
                state.problem === true
                  ? "intent-ci-proof-unavailable intent-ci-proof-problem"
                  : "intent-ci-proof-unavailable"
              }
            >
              {state.line}
            </p>
          )}
        </>
      )}
    </section>
  );
}
