// Summary reading pane for a selected Intent location or folder
// (`./IntentBrowser.tsx`): names the selection by path and how many matching
// files it holds, explains an unusable location
// (`./intentLocationExplanation.ts`), and lists its immediate folders and
// files (`./IntentSummaryChildren.tsx`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import { IntentSummaryChildren } from "./IntentSummaryChildren.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummary({
  path,
  files,
  location,
  onOpen,
}: {
  readonly path: string;
  readonly files: readonly string[];
  readonly location: IntentLocation;
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
      {location.problem !== undefined ? (
        <p className="intent-location-problem">
          {locationExplanation(location)}
        </p>
      ) : null}
      <IntentSummaryChildren path={path} files={files} onOpen={onOpen} />
    </section>
  );
}
