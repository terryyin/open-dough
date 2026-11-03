// Intent's Proof pane for a selected feature file (`./IntentFileReading.tsx`):
// every scenario and outline row the published text runs, in source order
// (`./gherkinScenarios.ts`), each with its last successful committed proof
// (`./cucumberProof.ts`) read as `./ProofObservationCells.tsx` words it. A
// count line summarizes successful proof, scenarios without successful proof
// included; it is never a suite verdict. A file without successful proof,
// a project that records no proof, and proof that could not be read (with
// retry) each say so differently (`./IntentProofAbsence.tsx`). Side by side,
// a file opened at a case (`./IntentBrowser.tsx`) brings that case's row into
// view beside Purpose positioned on it; with tabs, Proof keeps its own place.

import { useEffect, useRef } from "react";
import { proofIdentity } from "./cucumberProof.ts";
import type { IntentLocationProof } from "./authenticatedIntentRead.ts";
import { scenarioRowsOf } from "./gherkinScenarios.ts";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import {
  ObservedCells,
  observedCellHeaders,
  ScenarioName,
} from "./ProofObservationCells.tsx";
import {
  noSuccessfulProof,
  proofScenarioCountLine,
} from "./proofScenarioCountLine.ts";
import { useTickingNow } from "./useTickingNow.ts";
import "./intent-proof.css";

function ProofRows({
  path,
  text,
  proof,
  targetLine,
  sideBySide,
}: {
  readonly path: string;
  readonly text: string;
  readonly proof: Extract<IntentLocationProof, { observations: unknown }>;
  readonly targetLine: number | undefined;
  readonly sideBySide: boolean;
}) {
  const now = useTickingNow(30_000);
  const targetRow = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (!sideBySide) return;
    targetRow.current?.scrollIntoView({ block: "nearest", behavior: "auto" });
    // Only showing an opened case positions Proof; a layout switch keeps its
    // place (`./useIntentReadingPlaces.ts`).
  }, [path, targetLine]);
  const latest = new Map(
    proof.observations
      .filter((observation) => observation.feature === path)
      .map((observation) => [proofIdentity(observation), observation]),
  );
  const rows = scenarioRowsOf(text).map((row) => ({
    row,
    observation: latest.get(proofIdentity({ feature: path, ...row })),
  }));
  const publishedBlob = proof.featureBlobs[path];
  return (
    <>
      <p className="intent-proof-counts">
        {latest.size === 0 ? (
          <>
            No successful proof recorded for this file in{" "}
            <code>{proof.path}</code>.
          </>
        ) : (
          proofScenarioCountLine(rows.map(({ observation }) => observation))
        )}
      </p>
      <table className="intent-proof-rows" aria-label={`${path} proof`}>
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            {observedCellHeaders.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, observation }, at) => (
            <tr key={at} ref={row.line === targetLine ? targetRow : undefined}>
              <th scope="row">
                <ScenarioName row={row} />
              </th>
              {observation === undefined ? (
                <>
                  <td>{noSuccessfulProof}</td>
                  <td />
                  <td />
                  <td />
                  <td />
                </>
              ) : (
                <ObservedCells
                  observation={observation}
                  publishedBlob={publishedBlob}
                  now={now}
                />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function IntentProof({
  path,
  kind,
  text,
  proof,
  targetLine,
  sideBySide,
  rereading,
  onRetry,
}: {
  readonly path: string;
  readonly kind: string | undefined;
  readonly text: string | undefined;
  readonly proof: IntentLocationProof | undefined;
  // The line of the case the file was opened at, and whether Proof sits
  // beside Purpose.
  readonly targetLine: number | undefined;
  readonly sideBySide: boolean;
  // Whether the proof is being read again after a failed read.
  readonly rereading: boolean;
  readonly onRetry: () => void;
}) {
  if (path === "") {
    return <p className="quiet">Select a feature file to see its Proof.</p>;
  }
  if (proof === undefined || "problem" in proof) {
    return (
      <IntentProofAbsence
        kind={kind}
        proof={proof}
        rereading={rereading}
        onRetry={onRetry}
      />
    );
  }
  if (text === undefined) {
    return <p className="quiet">Proof is shown once {path} is read.</p>;
  }
  return (
    <ProofRows
      path={path}
      text={text}
      proof={proof}
      targetLine={targetLine}
      sideBySide={sideBySide}
    />
  );
}
