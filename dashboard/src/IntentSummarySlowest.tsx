// A Gherkin location or folder summary's slowest scenarios
// (`./IntentGherkinSummary.tsx`): its slowest counted rows anywhere in the
// selection (`./intentSummaryProofCost.ts`), each naming the scenario and its
// file relative to the selection, with file Proof's row cells
// (`./ProofObservationCells.tsx`). A row's scenario name opens its file with
// Purpose positioned on the row's source line. Nothing shows without counted
// rows.

import type { SlowestRow } from "./intentSummaryProofCost.ts";
import {
  ObservedCells,
  observedCellHeaders,
  ScenarioName,
} from "./ProofObservationCells.tsx";
import { useTickingNow } from "./useTickingNow.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummarySlowest({
  path,
  rows,
  featureBlobs,
  onOpen,
}: {
  readonly path: string;
  readonly rows: readonly SlowestRow[];
  readonly featureBlobs: Readonly<Record<string, string>>;
  readonly onOpen: (next: IntentSelection) => void;
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
                <ScenarioName row={row} />
              </button>
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
