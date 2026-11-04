// A location or folder summary's slowest cases (`./IntentProofSummary.tsx`):
// its slowest counted rows anywhere in the selection
// (`./intentSummaryProofCost.ts`), each naming the case in the proof kind's
// words (`./proofKinds.ts`) and its file relative to the selection, with file
// Proof's row cells (`./ProofObservationCells.tsx`). A row's case name opens
// its file with Purpose positioned on the row's source line. Nothing shows
// without counted rows.

import type { SlowestRow } from "./intentSummaryProofCost.ts";
import {
  CaseName,
  ObservedCells,
  observedCellHeaders,
} from "./ProofObservationCells.tsx";
import type { ProofKindWords } from "./proofKinds.ts";
import { useTickingNow } from "./useTickingNow.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummarySlowest({
  path,
  rows,
  fileBlobs,
  words,
  onOpen,
}: {
  readonly path: string;
  readonly rows: readonly SlowestRow[];
  readonly fileBlobs: Readonly<Record<string, string>>;
  readonly words: ProofKindWords;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  const now = useTickingNow(30_000);
  if (rows.length === 0) return null;
  const prefix = `${path}/`;
  return (
    <div className="intent-proof-table">
      <table
        className="intent-proof-rows intent-summary-slowest"
        aria-label={words.slowestCases}
      >
        <caption>{words.slowestCases}</caption>
        <thead>
          <tr>
            <th scope="col">{words.caseHeader}</th>
            <th scope="col">File</th>
            {observedCellHeaders.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ path: file, row, observation }) => (
            <tr key={JSON.stringify([file, row.line, row.variant ?? null])}>
              <th scope="row">
                <button
                  type="button"
                  className="intent-open-link"
                  onClick={() => {
                    onOpen({
                      path: file,
                      scope: "file",
                      caseTarget: String(row.line),
                    });
                  }}
                >
                  <CaseName row={row} words={words} />
                </button>
              </th>
              <td className="intent-proof-file">
                <code>
                  {file.startsWith(prefix) ? file.slice(prefix.length) : file}
                </code>
              </td>
              <ObservedCells
                observation={observation}
                publishedBlob={fileBlobs[file]}
                now={now}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
