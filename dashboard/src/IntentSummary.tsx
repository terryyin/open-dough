// Summary reading pane for a selected Intent location or folder
// (`./IntentBrowser.tsx`): names the selection by path and how many matching
// files it holds. For a kind Intent reads proof for (`./proofKinds.ts`) it
// delegates to `./IntentProofSummary.tsx`. Other kinds, undeclared proof,
// unusable locations, and proof that could not be read reuse the same
// explanations file Proof uses (`./IntentProofAbsence.tsx`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import { IntentProofGeneration } from "./IntentProofGeneration.tsx";
import { IntentProofSummary } from "./IntentProofSummary.tsx";
import { proofKindOf } from "./proofKinds.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";

export function IntentSummary({
  path,
  files,
  location,
  source,
  revision,
  proofRereading,
  onProofRetry,
  onOpen,
}: {
  readonly path: string;
  readonly files: readonly string[];
  readonly location: IntentLocation;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  const proofKind =
    location.problem === undefined ? proofKindOf(location.kind) : undefined;
  return (
    <section className="intent-summary" aria-label="Summary">
      <h3>Summary</h3>
      <p className="intent-summary-path">
        <code>{path}</code>
      </p>
      <p className="intent-summary-files">
        {files.length} {intentFileCountWords(files.length)}
      </p>
      <IntentProofGeneration location={location} />
      {proofKind !== undefined ? (
        <IntentProofSummary
          path={path}
          files={files}
          location={location}
          proofKind={proofKind}
          source={source}
          revision={revision}
          proofRereading={proofRereading}
          onProofRetry={onProofRetry}
          onOpen={onOpen}
        />
      ) : (
        <IntentProofAbsence
          kind={location.kind}
          proof={location.proof}
          rereading={proofRereading}
          onRetry={onProofRetry}
          {...(location.problem !== undefined
            ? { locationProblem: locationExplanation(location) }
            : {})}
        />
      )}
    </section>
  );
}
