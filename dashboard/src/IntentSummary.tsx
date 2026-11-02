// Summary reading pane for a selected Intent location or folder
// (`./IntentBrowser.tsx`): names the selection by path and how many matching
// files it holds. Non-Gherkin kinds, undeclared proof, unusable locations, and
// proof that could not be read reuse the same explanations file Proof uses
// (`./IntentProofProblem.tsx`, `./intentLocationExplanation.ts`). Scenario
// totals and aggregated Proof belong to a later slice.

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import { NotRecorded, ProofProblem } from "./IntentProofProblem.tsx";

export function IntentSummary({
  path,
  fileCount,
  location,
  proofRereading,
  onProofRetry,
}: {
  readonly path: string;
  readonly fileCount: number;
  readonly location: IntentLocation;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const proof = location.proof;
  return (
    <section className="intent-summary" aria-label="Summary">
      <h3>Summary</h3>
      <p className="intent-summary-path">
        <code>{path}</code>
      </p>
      <p className="intent-summary-files">
        {fileCount} {intentFileCountWords(fileCount)}
      </p>
      {location.problem !== undefined ? (
        <p className="intent-location-problem">
          {locationExplanation(location)}
        </p>
      ) : proof === undefined ? (
        <NotRecorded kind={location.kind} />
      ) : "problem" in proof ? (
        proofRereading ? (
          <p className="quiet">Reading Proof in {proof.path}…</p>
        ) : (
          <ProofProblem proof={proof} onRetry={onProofRetry} />
        )
      ) : null}
    </section>
  );
}
