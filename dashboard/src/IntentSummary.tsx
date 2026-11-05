// Summary reading pane for a selected Intent location or folder
// (`./IntentSelectionReading.tsx`): names the selection by path and how many
// matching files the tree lists, explains an unusable location, and shows
// the selection's CI proof with its immediate folders and files
// (`./IntentScopeProof.tsx`). It reads no source file.

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import { IntentScopeProof } from "./IntentScopeProof.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummary({
  path,
  files,
  location,
  revision,
  onOpen,
}: {
  readonly path: string;
  // The files the tree lists under the selection.
  readonly files: readonly string[];
  readonly location: IntentLocation;
  readonly revision: string;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  return (
    <section className="intent-summary" aria-label="Summary">
      <h3>Summary</h3>
      <p className="intent-summary-path">
        <code>{path}</code>
      </p>
      <p className="intent-summary-files">
        {files.length} {intentFileCountWords(files.length)}
      </p>
      {location.problem !== undefined && (
        <p className="intent-location-problem">
          {locationExplanation(location)}
        </p>
      )}
      <IntentScopeProof
        path={path}
        inventory={location.files}
        revision={revision}
        onOpen={onOpen}
      />
    </section>
  );
}
