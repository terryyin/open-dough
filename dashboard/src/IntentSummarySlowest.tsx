// A Gherkin location or folder summary's slowest scenarios
// (`./IntentGherkinSummary.tsx`): its slowest counted rows anywhere in the
// selection (`./intentSummaryProofCost.ts`), each naming the scenario and its
// file relative to the selection, with file Proof's row cells
// (`./ProofObservationCells.tsx`). Nothing shows without counted rows.

import type { SlowestRow } from "./intentSummaryProofCost.ts";
import {
  ObservedCells,
  observedCellHeaders,
  ScenarioName,
} from "./ProofObservationCells.tsx";
import { useTickingNow } from "./useTickingNow.ts";

export function IntentSummarySlowest({
  path,
  rows,
  featureBlobs,
}: {
  readonly path: string;
  readonly rows: readonly SlowestRow[];
  readonly featureBlobs: Readonly<Record<string, string>>;
}) {
  const now = useTickingNow(30_000);
  if (rows.length === 0) return null;
  const prefix = `${path}/`;
  return (
    <table
      className="intent-proof-rows intent-summary-slowest"
      aria-label="Slowest scenarios"
    >
      <caption>Slowest scenarios</caption>
      <thead>
        <tr>
          <th scope="col">Scenario</th>
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
          <tr key={`${file}:${String(row.line)}`}>
            <th scope="row">
              <ScenarioName row={row} />
            </th>
            <td>
              <code>
                {file.startsWith(prefix) ? file.slice(prefix.length) : file}
              </code>
            </td>
            <ObservedCells
              observation={observation}
              publishedBlob={featureBlobs[file]}
              now={now}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
