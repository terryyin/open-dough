// Summary reading pane for a selected Intent location or folder
// (`./IntentBrowser.tsx`): names the selection by path and how many matching
// files it holds. For Gherkin it delegates to `./IntentGherkinSummary.tsx`.
// Non-Gherkin kinds, undeclared proof, unusable locations, and proof that
// could not be read reuse the same explanations file Proof uses
// (`./IntentProofAbsence.tsx`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import { IntentGherkinSummary } from "./IntentGherkinSummary.tsx";
import { IntentProofAbsence } from "./IntentProofAbsence.tsx";
import type { PublishedSource } from "./publishedSource.ts";

export function IntentSummary({
  path,
  files,
  location,
  source,
  revision,
  proofRereading,
  onProofRetry,
}: {
  readonly path: string;
  readonly files: readonly string[];
  readonly location: IntentLocation;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const gherkin = location.kind === "gherkin" && location.problem === undefined;
  return (
    <section className="intent-summary" aria-label="Summary">
      <h3>Summary</h3>
      <p className="intent-summary-path">
        <code>{path}</code>
      </p>
      <p className="intent-summary-files">
        {files.length} {intentFileCountWords(files.length)}
      </p>
      {gherkin ? (
        <IntentGherkinSummary
          path={path}
          files={files}
          location={location}
          source={source}
          revision={revision}
          proofRereading={proofRereading}
          onProofRetry={onProofRetry}
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
