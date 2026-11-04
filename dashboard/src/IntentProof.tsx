// Intent's Proof pane for a selected file (`./IntentFileReading.tsx`): every
// case row the published text defines, in source order, as its proof kind
// derives them (`./proofKinds.ts`), each with its last successful committed
// proof (`./proofCases.ts`) read as `./ProofObservationCells.tsx` words it. A
// count line summarizes successful proof, cases without successful proof
// included; it is never a suite verdict. A file without successful proof,
// a project that records no proof, and proof that could not be read (with
// retry) each say so differently (`./IntentProofAbsence.tsx`). Side by side,
// a file opened at a case (`./IntentBrowser.tsx`) brings that case's row into
// view beside Purpose positioned on it; with tabs, Proof keeps its own place.

import { useEffect, useMemo, useRef } from "react";
import type { IntentLocationProof } from "./authenticatedIntentRead.ts";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import {
  CaseName,
  ObservedCells,
  observedCellHeaders,
} from "./ProofObservationCells.tsx";
import { latestProofOf, observedRowsOf } from "./proofCases.ts";
import { noSuccessfulProof, proofCountLine } from "./proofCountLine.ts";
import { proofKindOf, type ProofKind } from "./proofKinds.ts";
import { useTickingNow } from "./useTickingNow.ts";
import "./intent-proof.css";

function ProofRows({
  path,
  proofKind,
  text,
  proof,
  targetLine,
  sideBySide,
}: {
  readonly path: string;
  readonly proofKind: ProofKind;
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
  const latest = useMemo(
    () => latestProofOf(proof.observations),
    [proof.observations],
  );
  const rows = observedRowsOf(path, text, proofKind.rowsOf, latest);
  const publishedBlob = proof.fileBlobs[path];
  const { words } = proofKind;
  return (
    <>
      <p className="intent-proof-counts">
        {latest.byFile.get(path) === undefined ? (
          <>
            No successful proof recorded for this file in{" "}
            <code>{proof.path}</code>.
          </>
        ) : (
          proofCountLine(
            rows.map(({ observation }) => observation),
            words.cases,
          )
        )}
      </p>
      <div className="intent-proof-table">
        <table className="intent-proof-rows" aria-label={`${path} proof`}>
          <thead>
            <tr>
              <th scope="col">{words.caseHeader}</th>
              {observedCellHeaders.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, observation }, at) => (
              <tr
                key={at}
                ref={row.line === targetLine ? targetRow : undefined}
              >
                <th scope="row">
                  <CaseName row={row} words={words} />
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
      </div>
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
    return <p className="quiet">Select a file to see its Proof.</p>;
  }
  const proofKind = proofKindOf(kind);
  if (proof === undefined || "problem" in proof || proofKind === undefined) {
    return (
      <IntentProofAbsence
        kind={kind}
        proof={proofKind === undefined ? undefined : proof}
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
      proofKind={proofKind}
      text={text}
      proof={proof}
      targetLine={targetLine}
      sideBySide={sideBySide}
    />
  );
}
